require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("./config");
const { db } = require("./db");
const { verifyToken } = require("./middleware/auth.middleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const ppqr = require("promptpay-qr");
const qr = require("qrcode");
const stream = require("stream");
const generatePayload = require("promptpay-qr");
const { format } = require("date-fns");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRouter = require('./route/auth');
const roomsRouter = require('./route/rooms');
const queueRouter = require('./route/queue');
const tasksRouter = require('./route/tasks');
const billsRouter = require('./route/bills');
const mainRouter = require('./route/main');
const chatRouter = require('./route/chat');

const app = express();
const port = 3000;

const cors = require("cors");

const allowedOrigins = ["http://localhost:8000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`Request URL: ${req.originalUrl} via ${req.method} method`);
  next();
});

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      firstname: user.firstname,
      room: user.RoomID,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// /**
//  * @swagger
//  * /auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags:
//  *       - Auth
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               firstName:
//  *                 type: string
//  *               lastName:
//  *                 type: string
//  *               dateOfBirth:
//  *                 type: string
//  *               address:
//  *                 type: string
//  *               telephone:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: User registered successfully
//  *       400:
//  *         description: Missing required fields
//  *       409:
//  *         description: Duplicate user
//  */
// app.post("/auth/register", (req, res, next) => {
//   const {
//     username,
//     password,
//     email,
//     firstName,
//     lastName,
//     dateOfBirth,
//     address,
//     telephone,
//   } = req.body;
//   const RoomID = null;

//   if (!username || !password || !email) {
//     return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
//   }

//   db.all(
//     "SELECT * FROM users WHERE username = ? OR email = ?",
//     [username, email],
//     (error, existingUsers) => {
//       if (error) {
//         return next(error);
//       }

//       if (existingUsers.length > 0) {
//         return res.status(409).json({ message: "ข้อมูลซ้ำ" });
//       }

//       bcrypt.hash(password, 10, (err, hashedPassword) => {
//         if (err) {
//           return next(err);
//         }

//         const sql = `INSERT INTO users (username, password, email, firstname, lastname, dob, address, telephone, createat, RoomID, role, userImg)
//               VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)
//             `;

//         db.run(
//           sql,
//           [
//             username,
//             hashedPassword,
//             email,
//             firstName,
//             lastName,
//             dateOfBirth,
//             address,
//             telephone,
//             RoomID,
//             "user",
//             null,
//           ],
//           function (error) {
//             if (error) {
//               return next(error);
//             }
//             res.status(201).json({ message: "สมัครสำเร็จ" });
//           }
//         );
//       });
//     }
//   );
// });
// app.post("/auth/login", (req, res, next) => {
//   const { userIdentifier, password } = req.body;
//   if (!userIdentifier || !password) {
//     return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
//   }

//   db.get(
//     "SELECT * FROM users WHERE username = ? OR email = ?",
//     [userIdentifier, userIdentifier],
//     (error, user) => {
//       if (error) {
//         return next(error);
//       }

//       if (!user) {
//         return res.status(401).json({ message: "ไม่พบ username หรือ email" });
//       }

//       bcrypt.compare(password, user.password, (err, passwordMatch) => {
//         if (err) {
//           return next(err);
//         }

//         if (!passwordMatch) {
//           return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
//         }

//         const accessToken = generateAccessToken(user);
//         res.cookie("token", accessToken, {
//           httpOnly: true,
//           maxAge: 3600000,
//           secure: process.env.NODE_ENV === "production",
//         });
//         console.log(user.RoomID);
//         res.status(200).json({ role: user.role, room: user.RoomID });
//       });
//     }
//   );
// });

// app.post("/auth/logout", (req, res) => {
//   res.clearCookie("token");
//   res.status(200).json({ message: "Logged out successfully" });
// });

// app.get("/auth/users", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "เฉพาะผู้ดูแลระบบที่สามารถใช้คำสั่งนี้ได้" });
//   }

//   db.all("SELECT id, firstname, lastname FROM users", (error, users) => {
//     if (error) {
//       return next(error);
//     }
//     res.status(200).json(users);
//   });
// });

// app.get("/auth/profile", verifyToken, (req, res, next) => {
//   const userId = req.user.id;

//   if (!req.user) {
//     return res.status(403).json({ message: "โปรดเข้าสู่ระบบ" });
//   }

//   const sql = `SELECT users.firstname, users.lastname, users.address, users.telephone, users.email, users.userimg, users.RoomID, room.roomname,
//     room.roomTypeId FROM users LEFT JOIN room ON users.RoomID = room.id WHERE users.id = ?`;

//   db.get(sql, [userId], (error, user) => {
//     if (error) {
//       return next(error);
//     }

//     if (!user) {
//       return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
//     }
//     res.status(200).json(user);
//   });
// });

// app.get("/auth/id/:uid", verifyToken, (req, res, next) => {
//   const userId = req.params.uid;
//   if (!req.user) {
//     return res.status(403).json({ message: "โปรดเข้าสู่ระบบ" });
//   }
//   db.get(
//     `SELECT firstname, lastname, address, telephone, email, userimg FROM users WHERE id = ?`,
//     [userId],
//     (error, user) => {
//       if (error) {
//         return next(error);
//       }

//       if (!user) {
//         return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
//       }

//       res.status(200).json(user);
//     }
//   );
// });

// app.put("/auth/edit", verifyToken, (req, res, next) => {
//   const userId = req.user.id;
//   const { firstname, lastname, address, telephone, email, userImg } = req.body;
//   let sql =
//     "UPDATE users SET firstname = ?, lastname = ?, address = ?, telephone = ?, email = ?";
//   const params = [firstname, lastname, address, telephone, email];

//   if (typeof userImg === "string") {
//     sql += ", userimg = ?";
//     params.push(userImg);
//   }
//   sql += " WHERE id = ?";
//   params.push(userId);

//   db.run(sql, params, function (error) {
//     if (error) {
//       return next(error);
//     }
//     res.status(200).json({ message: "บันทึกข้อมูลเสร็จสิ้น" });
//   });
// });

// // -------------------- AUTH --------------------

// // -------------------- Room --------------------

// app.get("/rooms", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
//   }
//   db.all(
//     `SELECT id, roomName, description, roomTypeId, floor, renterID, roomImg FROM room`,
//     (error, rooms) => {
//       if (error) {
//         return next(error);
//       }
//       res.status(200).json({ rooms });
//     }
//   );
// });
// app.get("/rooms/:roomId", verifyToken, (req, res, next) => {
//   const { roomId } = req.params;

//   if (!roomId) {
//     return res.status(400).json({ message: "โปรดกรอก เลขห้อง" });
//   }
//   if (req.user.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
//   }

//   db.get(
//     `SELECT id, roomName, description, roomTypeId, floor, renterID FROM room WHERE id = ?`,
//     [roomId],
//     (error, room) => {
//       if (error) {
//         return next(error);
//       }

//       if (!room) {
//         return res.status(404).json({ message: "ไม่พบเลขห้องในระบบ" });
//       }

//       res.status(200).json({ room: room });
//     }
//   );
// });
// app.post("/rooms", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
//   }

//   const { roomName, description, roomTypeId, floor, userId, roomImg } =
//     req.body;
//   if (!roomName || typeof roomName !== "string" || roomName.length < 3) {
//     return res.status(400).json({ message: "ข้อมูล ชื่อห้อง ไม่ถูกต้อง" });
//   }
//   if (
//     !description ||
//     typeof description !== "string" ||
//     description.length < 3
//   ) {
//     return res.status(400).json({ message: "ข้อมูล คำอธิบาย ไม่ถูกต้อง" });
//   }
//   if (!roomTypeId) {
//     return res.status(400).json({ message: "ข้อมูล ประเภทห้อง ไม่ถูกต้อง" });
//   }
//   if (!floor) {
//     return res.status(400).json({ message: "ข้อมูล ชั้น ไม่ถูกต้อง" });
//   }
//   if (userId !== undefined && userId !== null && typeof userId !== "string") {
//     return res
//       .status(400)
//       .json({ message: "ข้อมูล รหัสประจำตัวของผู้ใช้ ไม่ถูกต้อง" });
//   }
//   db.all(
//     `SELECT id FROM room WHERE roomName = ?`,
//     [roomName],
//     function (error, result) {
//       if (error) {
//         return next(error);
//       }
//       console.log(result.length == 0)
//       if (result.length) {
//         return res.status(409).json({ message: "ชื่อห้องนี้มีในระบบแล้ว" });
//       }
//     }
//   );

//   const sql = `INSERT INTO room (roomName, description, roomTypeId, floor, renterID, roomImg) VALUES (?, ?, ?, ?, ?, ?)`;
//   db.run(
//     sql,
//     [roomName, description, roomTypeId, floor, null, roomImg],
//     function (error) {
//       if (error) {
//         return res.status(409).json({ message: error });
//       }

//       res.status(201).json({ roomId: this.lastID });
//     }
//   );
// });
// app.delete("/rooms/:roomId", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
//   }

//   const { roomId } = req.params;
//   if (!roomId) {
//     return res.status(400).json({ message: "โปรดกรอก รหัสห้อง" });
//   }

//   db.get(`SELECT renterID FROM room WHERE id = ?`, [roomId], (error, row) => {
//     if (error) {
//       return next(error);
//     }

//     if (!row) {
//       return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
//     }

//     if (row.renterID !== null) {
//       return res.status(400).json({ message: "ไม่สามารถลบห้องได้ เนื่องจากมีผู้เช่าอยู่" });
//     }

//     db.run(`DELETE FROM room WHERE id = ?`, [roomId], function (error) {
//       if (error) {
//         return next(error);
//       }

//       if (this.changes === 0) {
//         return res.status(404).json({ message: "ไม่พบห้องในระบบ" });
//       }
//       res.status(200).json({ message: "ลบห้อง สำเร็จ" });
//     });
//   });
// });
// app.put("/rooms/:roomId", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
//   }

//   const { roomId } = req.params;
//   if (!roomId) {
//     return res.status(400).json({ message: "โปรดกรอก รหัสห้อง" });
//   }

//   const { roomName, description, roomTypeId, floor, userId, roomImg } =
//     req.body;
//   console.log(roomImg);
//   if (roomName !== undefined) {
//     if (typeof roomName !== "string" || roomName.length < 3) {
//       return res.status(400).json({ message: "ไม่พบ roomName" });
//     }
//   }

//   if (description !== undefined) {
//     if (typeof description !== "string" || description.length < 3) {
//       return res.status(400).json({ message: "ไม่พบ description" });
//     }
//   }

//   if (roomTypeId !== undefined) {
//     if (typeof roomTypeId !== "string" || roomTypeId.length <= 0) {
//       return res.status(400).json({ message: "ไม่พบ roomTypeId" });
//     }
//   }

//   if (floor !== undefined) {
//     if (typeof floor !== "string" || floor.length <= 0) {
//       return res.status(400).json({ message: "ไม่พบ floor" });
//     }
//   }
//   if (roomImg !== undefined) {
//     if (typeof roomImg !== "string") {
//       return res.status(400).json({ message: "ไม่พบ รูปภาพ" });
//     }
//   }

//   const sql =
//     "UPDATE room SET roomName = ?, description = ?, roomTypeId = ?, floor = ?, roomImg = ? WHERE id = ?";
//   db.run(
//     sql,
//     [roomName, description, roomTypeId, floor, roomImg, roomId],
//     function (error) {
//       if (error) {
//         return next(error);
//       }
//       console.log("complete");
//       res.status(200).json({ message: "อัปเดตห้องสำเร็จ" });
//     }
//   );
// });
// app.put("/rooms/:roomId/clear", verifyToken, (req, res, next) => {
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

// app.put("/rooms/:roomId/assign", verifyToken, (req, res, next) => {
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
// app.put("/assignByq", verifyToken, (req, res, next) => {
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

// // -------------------- Chat --------------------

// app.get("/chat", verifyToken, (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "กรุณา login" });
//   }

//   db.all(
//     "SELECT id, message, timestamp FROM chatDataBase ORDER BY timestamp DESC",
//     [],
//     (error, chats) => {
//       if (error) {
//         return next(error);
//       }
//       res.status(200).json(chats);
//     }
//   );
// });

// app.post("/chat", verifyToken, (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "กรุณา login" });
//   }
//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ message: "กรุณากรอกข้อความ" });
//   }

//   db.run(
//     "INSERT INTO chatDataBase (message, timestamp) VALUES (?, datetime('now', '+7 hours'))",
//     [message],
//     function (error) {
//       if (error) {
//         return next(error);
//       }

//       db.get(
//         "SELECT * FROM chatDataBase WHERE id = ?",
//         [this.lastID],
//         (error, insertedChat) => {
//           if (error) {
//             return next(error);
//           }

//           if (!insertedChat) {
//             return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
//           }
//           res.status(201).json({ insertedChat: insertedChat });
//         }
//       );
//     }
//   );
// });

// // -------------------- Chat --------------------

// // -------------------- Queue --------------------
// app.post("/queue/:roomTypeId", verifyToken, (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "กรุณา login" });
//   }
//   const { roomTypeId } = req.params;
//   const { description, bookingDate, bookingTime } = req.body;
//   const queueDate = new Date();
//   const userId = req.user.id;

//   db.get(
//     "SELECT COUNT(id) as checkqueue FROM Queue WHERE userId = ?",
//     [userId],
//     (err, queueCheckResult) => {
//       if (err) {
//         return next(err);
//       }

//       if (queueCheckResult.checkqueue > 0) {
//         return res.status(409).json({ message: "คุณมีคิวอยู่แล้ว" });
//       }

//       db.get(
//         "SELECT COUNT(id) as vacantCount FROM room WHERE roomTypeId = ?",
//         [roomTypeId],
//         (err, vacantResult) => {
//           if (err) {
//             return next(err);
//           }

//           db.get(
//             "SELECT COUNT(id) as unavailableCount FROM room WHERE roomTypeId = ? AND renterID IS NOT NULL",
//             [roomTypeId],
//             (err, unavailableResult) => {
//               if (err) {
//                 return next(err);
//               }

//               db.get(
//                 "SELECT COUNT(id) as queueCount FROM Queue WHERE roomTypeId = ?",
//                 [roomTypeId],
//                 (err, queueResult) => {
//                   if (err) {
//                     return next(err);
//                   }

//                   const vacantCount = vacantResult.vacantCount;
//                   const unavailableCount = unavailableResult.unavailableCount;
//                   const queueCount = queueResult.queueCount;

//                   console.log(vacantCount, unavailableCount, queueCount);

//                   if (queueCount + unavailableCount >= vacantCount) {
//                     return res.status(409).json({ message: "ไม่สามารถจองคิวได้" });
//                   }

//                   const insertQueue = `INSERT INTO Queue (userId, roomTypeId, queueDate, description, bookingDate, bookingTime) VALUES (?, ?, ?, ?, ?, ?);`;
//                   db.run(
//                     insertQueue,
//                     [userId, roomTypeId, queueDate, description, bookingDate, bookingTime],
//                     function (error) {
//                       if (error) {
//                         return next(error);
//                       }
//                       res.status(201).json({ roomId: this.lastID });
//                     }
//                   );
//                 }
//               );
//             }
//           );
//         }
//       );
//     }
//   );
// });

// app.delete("/queue/del/:queueId", verifyToken, (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "กรุณา login" });
//   }
//   const { queueId } = req.params;

//   const deleteQuery = "DELETE FROM Queue WHERE id = ?";
//   console.log(deleteQuery + queueId);
//   db.run(deleteQuery, [queueId], function (error) {
//     if (error) {
//       return next(error);
//     }
//     if (this.changes === 0) {
//       return res.status(404).json({ message: "ไม่พบคิว" });
//     }
//     return res.status(200).json({ message: "ลบคิวสำเร็จ" });
//   });
// });

// app.get("/queue", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
//   }

//   const selectQuery = `
//   SELECT
//       q.id,
//       q.userId,
//       q.roomTypeId,
//       q.queueDate,
//       q.description,
//       q.bookingDate,
//       q.bookingTime,
//       u.firstname,
//       u.lastname,
//       u.email,
//       u.telephone
//   FROM Queue q
//   JOIN users u ON q.userId = u.id
//   ORDER BY q.queueDate
// `;
//   db.all(selectQuery, (error, queueEntries) => {
//     if (error) {
//       return next(error);
//     }
//     return res.status(200).json(queueEntries);
//   });
// });

// app.get("/queue/vacant/:type", verifyToken, (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "กรุณา login" });
//   }
//   const { type } = req.params;

//   const selectQuery = `
//     SELECT id, roomName FROM room WHERE roomTypeId = ? AND renterID IS NULL;
// `;
//   db.all(selectQuery, [type], (error, vacantroom) => {
//     if (error) {
//       return next(error);
//     }
//     return res.status(200).json(vacantroom);
//   });
// });

// app.get("/queue/check/:type", verifyToken, (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "กรุณา login" });
//   }
//   const { type } = req.params;

//   db.get(
//     "SELECT COUNT(id) as vacantCount FROM room WHERE roomTypeId = ?",
//     [type],
//     (err, vacantResult) => {
//       if (err) {
//         return next(err);
//       }

//       db.get(
//         "SELECT COUNT(id) as unavailableCount FROM room WHERE roomTypeId = ? AND renterID IS NOT NULL",
//         [type],
//         (err, unavailableResult) => {
//           if (err) {
//             return next(err);
//           }

//           db.get(
//             "SELECT COUNT(id) as queueCount FROM Queue WHERE roomTypeId = ?",
//             [type],
//             (err, queueResult) => {
//               if (err) {
//                 return next(err);
//               }

//               const vacantCount = vacantResult.vacantCount;
//               const unavailableCount = unavailableResult.unavailableCount;
//               const queueCount = queueResult.queueCount;

//               const result = {
//                 vacant: vacantCount,
//                 unavailable: unavailableCount,
//                 queue: queueCount,
//               };

//               if (queueCount + unavailableCount >= vacantCount) {
//                 res.status(409).json({ message: "คิวเต็ม" });
//               } else {
//                 res.status(200).json({ message: "คิวว่าง" });
//               }
//             }
//           );
//         }
//       );
//     }
//   );
// });
// // -------------------- Queue --------------------

// // -------------------- Tasks --------------------

// app.post("/tasks", verifyToken, (req, res) => {
//   const data = req.body;
//   try {
//     let roomid = req.user.room;
//     db.all("SELECT roomName FROM room WHERE id=?", [roomid], (err, row) => {
//       if (err) {
//         console.error("Query error:", err);
//         return res
//           .status(500)
//           .json({ message: "Error while querying room: " + err });
//       }

//       if (!row[0] || !row[0].roomName) {
//         return res.status(404).json({ message: "Room not found" });
//       }

//       let roomname = row[0].roomName;
//       console.log("Room Name:", roomname);

//       db.run(
//         `INSERT INTO task (roomid, taskname, tasktype, taskdate, description, taskprice, priceset, taskstatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           roomid,
//           `${data.taskname}`,
//           data.tasktype,
//           data.taskdate,
//           data.description,
//           data.taskprice || 0,
//           data.priceset ? 1 : 0,
//           0,
//         ],
//         function (err) {
//           if (err) {
//             console.error("Query error:", err);
//             return res
//               .status(500)
//               .json({ message: "Cannot INSERT task: " + err });
//           }

//           console.log("Inserted task with ID:", this.lastID);
//           res
//             .status(200)
//             .json({ message: "Task created!", taskID: this.lastID });
//         }
//       );
//     });
//   } catch (error) {
//     console.error("Error while creating task: ", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.get("/tasks", verifyToken, (req, res) => {
//   let roomidQuery = "";
//   if (req.query.roomid && !req.query.month) {
//     roomidQuery = req.query.roomid ? `WHERE roomid = ?` : "";
//   } else if (req.query.roomid && req.query.month) {
//     console.log(req.query.roomid, req.query.month);
//     roomidQuery = "WHERE roomid = ? AND strftime('%Y-%m', doneDate) = ?";
//   }

//   // Combine query string
//   const query = `
//       SELECT t.*, r.roomName 
//       FROM task t 
//       JOIN room r ON t.roomid = r.id 
//       ${roomidQuery}
//     `;

//   let params = req.query.roomid ? [req.query.roomid] : [];
//   if (req.query.roomid && req.query.month)
//     params.push(format(new Date(req.query.month), "yyyy-MM"));

//   db.all(query, params, (err, result) => {
//     if (err) {
//       console.error("Got Error:", err);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }

//     result.forEach((task) => {
//       if (task.priceset) {
//         delete task.priceset;
//       } else {
//         delete task.taskprice;
//       }
//     });

//     res.status(200).json(result);
//   });
// });

// app.get("/tasks/:taskid", verifyToken, (req, res) => {
//   db.all(
//     `SELECT * FROM task WHERE taskid=${req.params["taskid"]}`,
//     (ex, result) => {
//       if (ex) {
//         console.error("Got Error:", ex);
//         res.status(500).json({ message: "Internet Server Error" });
//       }
//       result.forEach((s) => {
//         if (s.priceset) {
//           delete s.priceset;
//         } else {
//           delete s.taskprice;
//         }
//       });
//       res.status(200).json(result);
//     }
//   );
// });

// app.put("/tasks/:taskid/setDone", verifyToken, (req, res) => {
//   db.run(
//     `UPDATE task SET taskstatus=1,doneDate=current_timestamp,taskprice=?,priceset=1 WHERE taskid=?`,
//     [req.body.price, req.params["taskid"]],
//     function(ex) {
//       if (ex) {
//         console.error(
//           `Got Error while setting Task ${req.params["taskid"]} status: ${ex} `
//         );
//         return res.status(500).json({ message: "Internet Server Error" });
//       }
//       console.log(this.changes);
//       if (this.changes == 0) {
//         return res.status(404).json({
//           message: `Task ${req.params["taskid"]} not found or it's already has been set.`,
//         });
//       }
//       // console.log(val)
//       return res.status(200).json({
//         message: `Task ${req.params["taskid"]} status has been set to TRUE`,
//       });
//     }
//   );
// });

// app.put("/tasks/:taskid/setTaskPrice", verifyToken, (req, res) => {
//   db.all(
//     `SELECT taskprice,priceset FROM task WHERE taskid=${req.params["taskid"]}`,
//     (ex, val) => {
//       if (ex) {
//         console.error(
//           `Get error during getting data to setTaskPrice using TASKID${req.params["taskid"]}: ${ex}`
//         );
//         res.status(500).json({ message: "Internet Server Error" });
//       }
//       console.log(val.length);
//       if (!!val.length) {
//         if (!Number.isNaN(req.body.taskprice)) {
//           conn.query(
//             `UPDATE task SET taskprice=${req.body.taskprice}, priceset=TRUE WHERE taskid=${req.params["taskid"]};`,
//             (ex1, val1) => {
//               if (ex1) {
//                 console.error(
//                   `Get error during setting data to setTaskPrice using TASKID${req.params["taskid"]}: ${ex1}`
//                 );
//                 res.status(500).json({ message: "Internet Server Error" });
//               }
//               return res.status(200).json({
//                 message: `Price of Task ${req.params["taskid"]} has been set.`,
//               });
//             }
//           );
//         }
//       } else {
//         return res
//           .status(404)
//           .json({ message: `Task ${req.params["taskid"]} not found.` });
//       }
//     }
//   );
// });
// // -------------------- Tasks --------------------

// // -------------------- Bills --------------------
// app.post("/bills", verifyToken, (req, res) => {
//   if (req.user.role != "admin")
//     return res
//       .status(403)
//       .json({ message: "You must be admin to access this" });
//   const data = req.body;

//   console.log(data.additionalFees);
//   db.run(
//     "INSERT INTO bill (RoomID, billMonth, DueDate, waterprice, electricprice, taskprice, roomprice, missDateCount, missfee, totalPrice, billStatus,additionalFees) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//     [
//       data.RoomID,
//       data.billMonth,
//       data.DueDate,
//       data.waterprice !== undefined ? data.waterprice : 0,
//       data.electricprice !== undefined ? data.electricprice : 0,
//       data.taskprice !== undefined ? data.taskprice : 0,
//       data.roomprice,
//       data.missDateCount !== undefined ? data.missDateCount : 0,
//       data.missfee !== undefined ? data.missfee : 0,
//       data.totalPrice !== undefined ? data.totalPrice : 0,
//       0, // billStatus
//       JSON.stringify(data.additionalFees || []),
//     ],
//     (ex) => {
//       if (ex) {
//         console.error(ex);
//         res.status(500).json({ message: "Internet Server Error" });
//       }
//       res.status(200).json({ message: "Bill created!", billid: this.lastID });
//     }
//   );
// });

// app.get("/bills", verifyToken, (req, res) => {
//   let query =
//     "SELECT b.*,r.roomName as roomNumber from bill b join room r ON (b.RoomID == r.id)";
//   let params = [];

//   if (req.query.roomid && req.user.role === "admin") {
//     query += " WHERE b.roomid = ?";
//     params.push(req.query.roomid);
//   } else if (req.user.role === "user") {
//     query += " WHERE b.roomid = ?";
//     params.push(req.user.room);
//   }
//   console.log(query);
//   db.all(query, params, (ex, result) => {
//     if (ex) {
//       console.error("Got Error:", ex);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }

//     result.forEach((a) => {
//       if (a.transactionimg) {
//         a.transactionimg =
//           "data:image/jpeg;base64," + a.transactionimg.toString("base64");
//       }
//     });

//     res.status(200).json(result);
//   });
// });

// app.get("/bills/paid", verifyToken, (req, res) => {
//   db.all(
//     "SELECT u.id,b.* FROM bill b JOIN users u ON (u.roomid = b.roomid) WHERE billstatus!=0" +
//       (req.query.roomid && req.user.role == "admin"
//         ? ` AND roomid=${req.query.roomid}`
//         : req.user.role == "user"
//         ? ` AND id=${req.user.id}`
//         : ""),
//     (ex, result) => {
//       if (ex) {
//         console.error("Got Error:", ex);
//         res.status(500).json({ message: "Internet Server Error" });
//       }
//       result.map((a) => {
//         a["transactionimg"] =
//           a["transactionimg"] && a["transactionimg"].toString("base64");
//       });
//       res.status(200).json(result);
//     }
//   );
// });

// app.put(
//   "/bills/:billid/paying",
//   verifyToken,
//   upload.single("TransactionImg"),
//   (req, res) => {
//     const { buffer } = req.file;
//     db.run(
//       `UPDATE bill SET transactionimg=?, billstatus=1 WHERE billid=${req.params["billid"]}`,
//       [buffer],
//       (ex) => {
//         if (ex) {
//           console.error("Got Error:", ex);
//           res.status(500).json({ message: "Internet Server Error" });
//         }
//         if (this.changes == 0)
//           res.status(404).json({
//             message: `Bill ${req.params["billid"]} not found or it's already been set.`,
//           });
//         res.status(200).json({
//           message: `Bill ${req.params["billid"]} has been set to paid.`,
//         });
//       }
//     );
//   }
// );

// app.put("/bills/:billid/confirmPayment", verifyToken, (req, res) => {
//   if (req.user.role != "admin")
//     return res
//       .status(403)
//       .json({ message: "You must be admin to access this" });
//   db.run(
//     `UPDATE bill SET billStatus=2,paidDate=CURRENT_TIMESTAMP WHERE billid=${req.params["billid"]}`,
//     (ex) => {
//       if (ex) {
//         console.error(ex);
//         res.status(500).json({ message: "Internet Server Error" });
//       }
//       if (this.changes == 0) {
//         res.status(404).json({
//           message: `Bill ${req.params["billid"]} not found or it's value has already been set`,
//         });
//       } else {
//         res.status(200).json({
//           message: `Bill ${req.params["billid"]} has been set to confirmed.`,
//         });
//       }
//     }
//   );
// });

// app.get("/bills/:billid/qr", verifyToken, (req, res) => {
//   db.all(
//     "SELECT totalPrice FROM bill WHERE billid=?",
//     [req.params["billid"]],
//     (ex, val) => {
//       if (ex) {
//         console.error(ex);
//         res.status(500).json({ message: "Internet Server Error" });
//       }
//       if (!val.length)
//         return res
//           .status(404)
//           .json({ message: `Bill ${req.params["billid"]} not found.` });
//       if (req.query.img) {
//         const passThrough = stream.PassThrough();

//         qr.toFileStream(
//           passThrough,
//           generatePayload(config.promptpayqr, {
//             amount: Number.parseFloat(val[0].totalPrice),
//           })
//         );

//         passThrough.pipe(res);
//         return;
//       }
//       qr.toBuffer(
//         generatePayload(config.promptpayqr, {
//           amount: Number.parseFloat(val[0].totalPrice),
//         })
//       ).then((v) => {
//         return res.status(200).json({
//           base64url: "data:image/png;base64," + v.toString("base64"),
//           promptpayid: config.promptpayqr,
//         });
//       });
//     }
//   );
// });
// // -------------------- Bills --------------------

// // -------------------- Main -------------------- 
// app.get("/main/room", verifyToken, (req, res, next) => {
//   console.log("Hi!");
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
//   }

//   const selectQuery = `SELECT COUNT(id) AS totalRooms FROM room;`;

//   db.get(selectQuery, (error, row) => { 
//     if (error) {
//       return next(error); 
//     }
//     if (!row) { 
//         return res.status(200).json({ totalRooms: 0 });
//     }
//     return res.status(200).json({ totalRooms: row.totalRooms });
//   });
// });

// app.get("/main/queue", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
//   }

//   const selectQuery = `SELECT COUNT(id) AS totalQueues FROM Queue;`;

//   db.get(selectQuery, (error, row) => {
//     if (error) {
//       return next(error);
//     }
//     if (!row) {
//         return res.status(200).json({ totalQueues: 0 });
//     }
//     return res.status(200).json({ totalQueues: row.totalQueues });
//   });
// });

// app.get("/main/vacant", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
//   }

//   const selectQuery = `SELECT count(id) AS totalTenants from room where renterID is not NULL;`;

//   db.get(selectQuery, (error, row) => {
//     if (error) {
//       return next(error);
//     }
//      if (!row) {
//         return res.status(200).json({ totalTenants: 0 });
//     }
//     return res.status(200).json({ totalTenants: row.totalTenants });
//   });
// });

// app.get("/main/bill", verifyToken, (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
//   }

//   const selectQuery = `SELECT count(BillID) AS unpaidBills from bill where billStatus!=2;`;

//   db.get(selectQuery, (error, row) => {
//     if (error) {
//       return next(error);
//     }
//      if (!row) {
//         return res.status(200).json({ unpaidBills: 0 });
//     }
//     return res.status(200).json({ unpaidBills: row.unpaidBills });
//   });
// });
// // -------------------- Main -------------------- 

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dormitory Management System API',
      version: '1.0.0',
      description: 'API documentation for Dormitory Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'], // สามารถเพิ่มไฟล์อื่นๆได้
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log("Before app.listen");
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
console.log("After app.listen");
