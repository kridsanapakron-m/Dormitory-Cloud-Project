const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');
const axios = require('axios');

router.get("/", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }
  db.all(
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

  db.get(
    `SELECT id, roomName, description, roomTypeId, floor, renterID FROM room WHERE id = ?`,
    [roomId],
    (error, room) => {
      if (error) {
        return next(error);
      }

      if (!room) {
        return res.status(404).json({ message: "ไม่พบเลขห้องในระบบ" });
      }

      res.status(200).json({ room: room });
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
      db.all(
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
      db.run(
        sql,
        [roomName, description, roomTypeId, floor, null, roomImg],
        function (error) {
          if (error) return reject(error);
          resolve(this.lastID);
        }
      );
    });

    // Call the /register endpoint in auth to create a user for this room
    const registerResponse = await axios.post("http://localhost:3000/auth/register", {
      username: `room_${newRoomId}`,
      password: "Cisco123!"
    });

    // Update the room with the newly created userId
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE room SET renterID = ? WHERE id = ?`,
        [registerResponse.data.userId, newRoomId],
        function (error) {
          if (error) return reject(error);
          resolve();
        }
      );
    });

    res.status(201).json({
      roomId: newRoomId,
      user: registerResponse.data,
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

  db.get(`SELECT renterID FROM room WHERE id = ?`, [roomId], (error, row) => {
    if (error) {
      return next(error);
    }

    if (!row) {
      return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
    }

    if (row.renterID !== null) {
      return res.status(400).json({ message: "ไม่สามารถลบห้องได้ เนื่องจากมีผู้เช่าอยู่" });
    }

    db.run(`DELETE FROM room WHERE id = ?`, [roomId], function (error) {
      if (error) {
        return next(error);
      }

      if (this.changes === 0) {
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
  db.run(
    sql,
    [roomName, description, roomTypeId, floor, roomImg, roomId],
    function (error) {
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

// router.put("/:roomId/assign", verifyToken, (req, res, next) => {
//   const { roomId } = req.params;
//   const { userId } = req.body;

//   if (!roomId || !userId) {
//     return res.status(400).json({ message: "ระบบไม่ได้รับ" });
//   }

//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
//   }

//   db.get(
//     `SELECT id FROM room WHERE renterID = ?`,
//     userId,
//     (error, userResult) => {
//       if (error) {
//         return next(error);
//       }

//       if (userResult) {
//         return res.status(409).json({ message: "ผู้ใช้มีห้องพัก" });
//       }

//       db.run(
//         `UPDATE room SET renterID = ? WHERE id = ?`,
//         [userId, roomId],
//         function (error) {
//           if (error) {
//             return next(error);
//           }

//           if (this.changes === 0) {
//             return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
//           }

//           db.run(
//             `UPDATE users SET RoomID = ? WHERE id = ?`,
//             [roomId, userId],
//             function (error) {
//               if (error) {
//                 return next(error);
//               }
//               if (this.changes === 0) {
//                 return res.status(404).json({ message: "ไม่พบผู้ใช้" });
//               }
//               res.status(200).json({ message: "เพิ่มผู้ใช้เข้าห้องพักสำเร็จ" });
//             }
//           );
//         }
//       );
//     }
//   );
// });
// router.put("/assignByq", verifyToken, (req, res, next) => {
//   const { roomId, userId } = req.body;
//   console.log(roomId, userId);
//   if (!roomId || !userId) {
//     return res
//       .status(400)
//       .json({ message: "ระบบไม่ได้ระบบ เลขห้องและรหัสประจำตัวผู้ใช้" });
//   }

//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
//   }
//   db.get(
//     `SELECT id FROM room WHERE renterID = ?`,
//     userId,
//     (error, userResult) => {
//       if (error) {
//         return next(error);
//       }

//       if (userResult) {
//         return res.status(409).json({ message: "ผู้ใช้มีห้องอยู่แล้ว" });
//       }
//       db.run(
//         `UPDATE room SET renterID = ? WHERE id = ?`,
//         [userId, roomId],
//         function (error) {
//           if (error) {
//             return next(error);
//           }
//           if (this.changes === 0) {
//             return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
//           }

//           db.run(
//             `UPDATE users SET RoomID = ? WHERE id = ?`,
//             [roomId, userId],
//             function (error) {
//               if (error) {
//                 return next(error);
//               }
//               if (this.changes === 0) {
//                 return res.status(404).json({ message: " ไม่พบผู้ใช้" });
//               }
//               db.run(
//                 `DELETE FROM Queue WHERE userId = ?`,
//                 [userId],
//                 function (error) {
//                   if (error) {
//                     return next(error);
//                   }
//                   if (this.changes === 0) {
//                     return res.status(404).json({ message: " ไม่พบคิว" });
//                   }
//                   res
//                     .status(200)
//                     .json({ message: "เพิ่มห้องให้ผู้ใช้เสร็จสิ้น" });
//                 }
//               );
//             }
//           );
//         }
//       );
//     }
//   );
// });
module.exports = router;