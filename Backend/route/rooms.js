const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');
const { createUser } = require('./auth');

router.get("/", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }
  db.query(
    `SELECT id, roomName, description, roomTypeId, floor, renterID, roomImg FROM room`,
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
    `SELECT id, roomName, description, roomTypeId, floor, renterID FROM room WHERE id = ?`,
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

    const newRoomId = await new Promise((resolve, reject) => {
      const sql = `INSERT INTO room (roomName, description, roomTypeId, floor, renterID, roomImg) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(
        sql,
        [roomName, description, roomTypeId, floor, null, roomImg],
        function (error, result) {
          if (error) return reject(error);
          resolve(result.insertId);
        }
      );
    });

    const registerResponse = await createUser(`room_${newRoomId}`, "Cisco123!");

    await new Promise((resolve, reject) => {
      db.query(
        `UPDATE room SET renterID = ? WHERE id = ?`,
        [registerResponse.userId, newRoomId],
        function (error, result) {
          if (error) return reject(error);
          resolve();
        }
      );
    });

    res.status(201).json({
      roomId: newRoomId,
      user: registerResponse,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:roomId", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { roomId } = req.params;
  if (!roomId) {
    return res.status(400).json({ message: "โปรดกรอก รหัสห้อง" });
  }

  db.query(`SELECT renterID FROM room WHERE id = ?`, [roomId], (error, results) => {
    if (error) {
      return next(error);
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
    }

    if (results[0].renterID !== null) {
      return res.status(400).json({ message: "ไม่สามารถลบห้องได้ เนื่องจากมีผู้เช่าอยู่" });
    }

    db.query(`DELETE FROM room WHERE id = ?`, [roomId], function (error, result) {
      if (error) {
        return next(error);
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
      }
      res.status(200).json({ message: "ลบห้อง สำเร็จ" });
    });
  });
});
router.put("/:roomId", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { roomId } = req.params;
  if (!roomId) {
    return res.status(400).json({ message: "โปรดกรอก รหัสห้อง" });
  }

  const { roomName, description, roomTypeId, floor, userId, roomImg } =
    req.body;
  console.log(roomImg);
  if (roomName !== undefined) {
    if (typeof roomName !== "string" || roomName.length < 3) {
      return res.status(400).json({ message: "ไม่พบ roomName" });
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.length < 3) {
      return res.status(400).json({ message: "ไม่พบ description" });
    }
  }

  if (roomTypeId !== undefined) {
    if (typeof roomTypeId !== "string" || roomTypeId.length <= 0) {
      return res.status(400).json({ message: "ไม่พบ roomTypeId" });
    }
  }

  if (floor !== undefined) {
    if (typeof floor !== "string" || floor.length <= 0) {
      return res.status(400).json({ message: "ไม่พบ floor" });
    }
  }
  if (roomImg !== undefined) {
    if (typeof roomImg !== "string") {
      return res.status(400).json({ message: "ไม่พบ รูปภาพ" });
    }
  }

  const sql =
    "UPDATE room SET roomName = ?, description = ?, roomTypeId = ?, floor = ?, roomImg = ? WHERE id = ?";
  db.query(
    sql,
    [roomName, description, roomTypeId, floor, roomImg, roomId],
    function (error, result) {
      if (error) {
        return next(error);
      }
      console.log("complete");
      res.status(200).json({ message: "อัปเดตห้องสำเร็จ" });
    }
  );
});

// router.put("/:roomId/clear", verifyToken, (req, res, next) => {
//   const { roomId } = req.params;
//   if (req.user.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
//   }
//   db.get(
//     `SELECT renterID FROM room WHERE id = ?`,
//     [roomId],
//     (error, result) => {
//       if (error) {
//         return next(error);
//       }
//       if (result.length === 0 || !result.renterID) {
//         return res.status(404).json({ message: "ไม่พบห้อง" });
//       }
//       const renterID = result.renterID;
//       db.run(
//         `UPDATE room SET renterID = NULL WHERE id = ?`,
//         [roomId],
//         function (error) {
//           if (error) {
//             return next(error);
//           }
//           db.run(
//             `UPDATE users SET RoomID = NULL WHERE id = ?`,
//             [renterID],
//             function (error) {
//               if (error) {
//                 return next(error);
//               }

//               res.json({ message: "ลบผู้เช่าห้องสำเร็จ" });
//             }
//           );
//         }
//       );
//     }
//   );
// });

router.put("/:roomId/assign", verifyToken, (req, res, next) => {
  const { roomId } = req.params;
  const { email } = req.body;
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }
  db.query(
    `SELECT renterID FROM room WHERE id = ?`,
    [roomId],
    (error, roomResults) => {
      if (error) {
        return next(error);
      }
      if (!roomResults || roomResults.length === 0 || !roomResults[0].renterID) {
        return res.status(404).json({ message: "ไม่พบ renterID ของห้องนี้" });
      }
      db.query(
        `SELECT username, password FROM users WHERE id = ?`,
        [roomResults[0].renterID],
        (error, userResults) => {
          if (error) {
            return next(error);
          }
          if (!userResults || userResults.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ตรงกับ renterID" });
          }
          db.query(
            `UPDATE room SET available = 1 WHERE id = ?`,
            [roomId],
            function (error, result) {
              if (error) {
                return next(error);
              }
              res.status(200).json({ 
                message: "แก้ไขห้องว่ามีผู้เช่าแล้ว",
                username: userResults[0].username,
              });
            }
          );
        }
      );
    }
  );

  // sent mail to email with username and password
});
router.put("/assignByq", verifyToken, (req, res, next) => {
  const { email } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }
  //
  // sent mail to userId
  //

});
router.put("/:roomId/removetenant", verifyToken, (req, res, next) => {
  const { roomId } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }
db.query(
    `SELECT roomName FROM room WHERE id = ?`,
    [roomId],
    (error, roomResults) => {
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
                `DELETE FROM percel WHERE roomName = ?`,
                [roomName],
                function (error, result) {
                  if (error) {
                    return next(error);
                  }

                  res.status(200).json({ 
                    message: "ลบข้อมูลบิล งาน และพัสดุสำเร็จ",
                  });
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