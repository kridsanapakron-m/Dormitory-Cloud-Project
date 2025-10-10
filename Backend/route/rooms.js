const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');
const { createUser } = require('./auth');
const config = require('../config');
const { sendEmail } = require('../service/send-email');
const s3 = require("../service/s3");
require("dotenv").config();
router.get("/", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  db.query(
    //`SELECT id, roomName, description, roomTypeId, floor, renterID, roomImg, available FROM room`,
      `SELECT r.id, r.roomName, r.description, r.roomTypeId, r.floor, r.renterID, r.roomImg, r.available, rt.roomprice 
    FROM room r 
    LEFT JOIN roomtype rt ON r.roomTypeId = rt.roomtypeid`,
    (error, rooms) => {
      if (error) {
        return next(error);
      }
      res.status(200).json({ rooms });
    }
  );
});

router.get("/:roomId", verifyToken, (req, res, next) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({ message: "โปรดกรอก เลขห้อง" });
  }
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  db.query(
    //`SELECT id, roomName, description, roomTypeId, floor, renterID FROM room WHERE id = ?`,
    `SELECT r.id, r.roomName, r.description, r.roomTypeId, r.floor, r.renterID, rt.roomprice 
    FROM room r 
    LEFT JOIN roomtype rt ON r.roomTypeId = rt.roomtypeid
    WHERE r.id = ?`,
    [roomId],
    (error, results) => {
      if (error) {
        return next(error);
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ message: "ไม่พบเลขห้องในระบบ" });
      }

      res.status(200).json({ room: results[0] });
    }
  );
});
router.post("/", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { roomName, description, roomTypeId, floor, roomImg } = req.body;

  if (!roomName || typeof roomName !== "string" || roomName.length < 3) {
    return res.status(400).json({ message: "ข้อมูล ชื่อห้อง ไม่ถูกต้อง" });
  }
  if (
    !description ||
    typeof description !== "string" ||
    description.length < 3
  ) {
    return res.status(400).json({ message: "ข้อมูล คำอธิบาย ไม่ถูกต้อง" });
  }
  if (!roomTypeId) {
    return res.status(400).json({ message: "ข้อมูล ประเภทห้อง ไม่ถูกต้อง" });
  }
  if (!floor) {
    return res.status(400).json({ message: "ข้อมูล ชั้น ไม่ถูกต้อง" });
  }

  if (!roomImg) {
    return res.status(400).json({ message: "กรุณาแนบรูปภาพห้อง" });
  }

  try {
    const existingRoom = await new Promise((resolve, reject) => {
      db.query(
        `SELECT id FROM room WHERE roomName = ?`,
        [roomName],
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });

    if (existingRoom.length) {
      return res.status(409).json({ message: "ชื่อห้องนี้มีในระบบแล้ว" });
    }

    const base64Data = Buffer.from(
      roomImg.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = roomImg.split(";")[0].split("/")[1];
    const fileName = `rooms/${roomName}-${Date.now()}.${type}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
      ACL: "public-read",
    };

    const uploadResult = await s3.upload(params).promise();
    const imageUrl = uploadResult.Location;

    const newRoomId = await new Promise((resolve, reject) => {
      const sql = `INSERT INTO room (roomName, description, roomTypeId, floor, renterID, roomImg) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(
        sql,
        [roomName, description, roomTypeId, floor, null, imageUrl],
        function (error, result) {
          if (error) return reject(error);
          resolve(result.insertId);
        }
      );
    });

    const registerResponse = await createUser(`room_${newRoomId}`, config.user.defaultPassword);

    await Promise.all([
      new Promise((resolve, reject) => {
        db.query(
          `UPDATE room SET renterID = ? WHERE id = ?`,
          [registerResponse.userId, newRoomId],
          function (error, result) {
            if (error) return reject(error);
            resolve(result);
          }
        );
      }),
      new Promise((resolve, reject) => {
        db.query(
          `UPDATE users SET RoomID = ? WHERE id = ?`,
          [newRoomId, registerResponse.userId],
          function (error, result) {
            if (error) return reject(error);
            resolve(result);
          }
        );
      })
    ]);

    res.status(201).json({
      roomId: newRoomId,
      user: registerResponse,
      imageUrl: imageUrl
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:roomId", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { roomId } = req.params;
  if (!roomId) {
    return res.status(400).json({ message: "โปรดกรอก รหัสห้อง" });
  }

  try {
    const roomResults = await new Promise((resolve, reject) => {
      db.query(`SELECT roomName, renterID FROM room WHERE id = ?`, [roomId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (!roomResults || roomResults.length === 0) {
      return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
    }

    const roomName = roomResults[0].roomName;
    const renterID = roomResults[0].renterID;
    console.log("roomName:", roomName, "renterID:", renterID);

    await new Promise((resolve, reject) => {
      db.query(`DELETE FROM bill WHERE RoomID = ?`, [roomId], (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });

    await new Promise((resolve, reject) => {
      db.query(`DELETE FROM task WHERE roomid = ?`, [roomId], (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });

    await new Promise((resolve, reject) => {
      db.query(`DELETE FROM parcel WHERE roomName = ?`, [roomName], (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });

    if (renterID) {
      await new Promise((resolve, reject) => {
        db.query(`DELETE FROM users WHERE id = ?`, [renterID], (error, result) => {
          if (error) return reject(error);
          console.log("Deleted user with id:", renterID);
          resolve(result);
        });
      });
    }

    await new Promise((resolve, reject) => {
      db.query(`DELETE FROM room WHERE id = ?`, [roomId], (error, result) => {
        if (error) return reject(error);
        if (result.affectedRows === 0) {
          return reject(new Error("ไม่พบห้องในระบบ"));
        }
        resolve(result);
      });
    });

    res.status(200).json({ 
      message: "ลบห้องและข้อมูลที่เกี่ยวข้องทั้งหมดสำเร็จ (บิล งาน พัสดุ และผู้ใช้)" 
    });

  } catch (error) {
    next(error);
  }
});
router.put("/:roomId", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { roomId } = req.params;
  if (!roomId) {
    return res.status(400).json({ message: "โปรดระบุรหัสห้อง" });
  }

  const { roomName, description, roomTypeId, floor, roomImg } = req.body;
  
  try {
    const updateFields = [];
    const values = [];

    if (roomName !== undefined) {
      if (typeof roomName !== "string" || roomName.length < 3) {
        return res.status(400).json({ message: "ข้อมูล roomName ไม่ถูกต้อง" });
      }
      updateFields.push("roomName = ?");
      values.push(roomName);
    }
    if (description !== undefined) {
      if (typeof description !== "string" || description.length < 3) {
        return res.status(400).json({ message: "ข้อมูล description ไม่ถูกต้อง" });
      }
      updateFields.push("description = ?");
      values.push(description);
    }
    if (roomTypeId !== undefined) {
      updateFields.push("roomTypeId = ?");
      values.push(roomTypeId);
    }
    if (floor !== undefined) {
      updateFields.push("floor = ?");
      values.push(floor);
    }

    if (roomImg !== undefined && roomImg !== null && roomImg !== '') {
      if (roomImg.startsWith('data:image')) {
        const base64Data = Buffer.from(
          roomImg.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
        const type = roomImg.split(";")[0].split("/")[1];
        const fileName = `rooms/room-${roomId}-${Date.now()}.${type}`;
        
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileName,
          Body: base64Data,
          ContentEncoding: "base64",
          ContentType: `image/${type}`,
          ACL: "public-read",
        };
        
        const uploadResult = await s3.upload(params).promise();
        const imageUrl = uploadResult.Location;
        
        updateFields.push("roomImg = ?");
        values.push(imageUrl);
      } 
      else if (roomImg.startsWith('http') && roomImg.includes(process.env.AWS_S3_BUCKET_NAME)) {
        updateFields.push("roomImg = ?");
        values.push(roomImg);
      } 
      else {
        return res.status(400).json({ message: "ข้อมูล roomImg ไม่ถูกต้อง ต้องเป็น Base64 หรือ URL จาก S3 ของระบบเท่านั้น" });
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'ไม่มีข้อมูลที่ถูกต้องให้อัปเดต' });
    }

    const sql = `UPDATE room SET ${updateFields.join(", ")} WHERE id = ?`;
    values.push(roomId);

    db.query(sql, values, function (error, result) {
      if (error) {
        return next(error);
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'ไม่พบห้องที่ระบุให้ทำการอัปเดต' });
      }
      res.status(200).json({ message: "อัปเดตห้องสำเร็จ" });
    });

  } catch (error) {
    next(error);
  }
});

router.post("/:roomId/assign", verifyToken, async (req, res, next) => {
  const { roomId } = req.params;
  const { email } = req.body;
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }
  try {
    await new Promise((resolve, reject) => {
      db.query(
        `UPDATE room SET available = 1 WHERE id = ?`,
        [roomId],
        function (error, result) {
          if (error) {
            return reject(error);
          }
          if (result.affectedRows === 0) {
            return reject({ status: 404, message: "ไม่พบห้องในระบบ" });
          }
          resolve(result);
        }
      );
    });

    const roomResult = await new Promise((resolve, reject) => {
      db.query(
        `SELECT renterID FROM room WHERE id = ?`,
        [roomId],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    if (!roomResult || roomResult.length === 0 || !roomResult[0].renterID) {
      return res.status(404).json({ message: "ไม่พบ renterID สำหรับห้องนี้" });
    }

    const renterID = roomResult[0].renterID;

    const userResult = await new Promise((resolve, reject) => {
      db.query(
        `SELECT username, id FROM users WHERE id = ?`,
        [renterID],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: "ไม่พบ username สำหรับ renterID นี้" });
    }
    const username = userResult[0].username;
    const password = config.client.defaultPassword;
    const loginUrl = config.client.url + "/login";

    await sendEmail({
      to: email,
      subject: 'ข้อมูลบัญชีผู้ใช้งานระบบจัดการหอพักของคุณ',
      html: `
        <h2>ยินดีต้อนรับสู่ระบบจัดการหอพัก</h2>
        <p>ผู้ดูแลระบบได้สร้างบัญชีผู้ใช้งานสำหรับคุณเรียบร้อยแล้ว</p>
        <p>คุณสามารถเข้าสู่ระบบได้โดยใช้ข้อมูลดังนี้:</p>
        <ul>
          <li><strong>ชื่อผู้ใช้ (Username):</strong> ${username}</li>
          <li><strong>รหัสผ่าน (Password):</strong> ${password}</li>
        </ul>
        <p>กรุณาเข้าสู่ระบบผ่านลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่านของคุณ:</p>
        <p><a href="${loginUrl}" target="_blank">เข้าสู่ระบบจัดการหอพัก</a></p>
        <br>
        <p>ขอบคุณ,<br>ทีมงานระบบจัดการหอพัก</p>
      `
    });
    res.status(200).json({ message: `ส่งอีเมลแจ้งเตือนการมอบหมายงานไปยัง ${email} ${username}${password}สำเร็จ` });

  } catch (error) {
    if (error && error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Failed to send assignment email:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งอีเมล" });
  }
});

router.post("/assignByq", verifyToken, async (req, res) => {
  const { email, roomname } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถดำเนินการได้" });
  }
  try {
    const roomResult = await new Promise((resolve, reject) => {
      db.query(
        `SELECT renterID FROM room WHERE roomName = ?`,
        [roomname],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    if (!roomResult || roomResult.length === 0 || !roomResult[0].renterID) {
      return res.status(404).json({ message: "ไม่พบ renterID สำหรับห้องนี้" });
    }

    const renterID = roomResult[0].renterID;

    const userResult = await new Promise((resolve, reject) => {
      db.query(
        `SELECT username, id FROM users WHERE id = ?`,
        [renterID],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: "ไม่พบ username สำหรับ renterID นี้" });
    }
    const username = userResult[0].username;
    const password = config.client.defaultPassword;
    const loginUrl = config.client.url + "/login";
    await sendEmail({
      to: email,
      subject: 'ข้อมูลบัญชีผู้ใช้งานระบบจัดการหอพักของคุณ',
      html: `
        <h2>ยินดีต้อนรับสู่ระบบจัดการหอพัก</h2>
        <p>ผู้ดูแลระบบได้สร้างบัญชีผู้ใช้งานสำหรับคุณเรียบร้อยแล้ว</p>
        <p>คุณสามารถเข้าสู่ระบบได้โดยใช้ข้อมูลดังนี้:</p>
        <ul>
          <li><strong>ชื่อผู้ใช้ (Username):</strong> ${username}</li>
          <li><strong>รหัสผ่าน (Password):</strong> ${password}</li>
        </ul>
        <p>กรุณาเข้าสู่ระบบผ่านลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่านของคุณ:</p>
        <p><a href="${loginUrl}" target="_blank">เข้าสู่ระบบจัดการหอพัก</a></p>
        <br>
        <p>ขอบคุณ,<br>ทีมงานระบบจัดการหอพัก</p>
      `
    });
    db.query(
    `UPDATE room SET available = 1 WHERE roomName = ?`,
    [roomname],
    function (error, result) {
      if (error) {
        return next(error);
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
      }
    } 
    );
    res.status(200).json({ message: `ส่งอีเมลแจ้งเตือนการมอบหมายงานไปยัง ${email} สำเร็จ` });

  } catch (error) {
    console.error("Failed to send assignment email:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งอีเมล" });
  }

});

router.put("/:roomId/removetenant", verifyToken, async (req, res, next) => {
  const { roomId } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }
db.query(
    `SELECT roomName FROM room WHERE id = ?`,
    [roomId],
    async (error, roomResults) => {
      if (error) {
        return next(error);
      }

      if (!roomResults || roomResults.length === 0) {
        return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
      }

      const roomName = roomResults[0].roomName;
      db.query(
        `DELETE FROM bill WHERE RoomID = ?`,
        [roomId],
        function (error, result) {
          if (error) {
            return next(error);
          }
          db.query(
            `DELETE FROM task WHERE roomid = ?`,
            [roomId],
            function (error, result) {
              if (error) {
                return next(error);
              }

              db.query(
                `DELETE FROM parcel WHERE roomName = ?`,
                [roomName],
                function (error, result) {
                  if (error) {
                    return next(error);
                  }

                  db.query(
                    `UPDATE room SET available = 0 WHERE id = ?`,
                    [roomId],
                    function (error, result) {
                      if (error) {
                        return next(error);
                      }
                      
                      db.query(
                        `UPDATE users SET email = NULL, firstname = NULL, lastname = NULL, dob = NULL, address = NULL, telephone = NULL, userImg = NULL WHERE RoomID = ?`,
                        [roomId],
                        async function (error, result) {
                          if (error) {
                            return next(error);
                          }

                          if (typeof userId !== 'undefined') {
                            try {
                              await resetUserPassword(userId);
                            } catch (err) {
                              return next(err);
                            }
                          }

                          res.status(200).json({ 
                            message: "ลบข้อมูลบิล งาน และพัสดุสำเร็จ พร้อมอัพเดตสถานะห้องเป็นว่างและล้างข้อมูลผู้ใช้",
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );

});
module.exports = router;