const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db");
const config = require("../config");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();
const s3 = require("../service/s3");
require("dotenv").config();

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      room: user.RoomID,
      email: user.email,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const createUser = (username, password) => {
  return new Promise((resolve, reject) => {
    if (!username || !password) {
      return reject(new Error("กรุณากรอก username และ password"));
    }

    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (error, existingUsers) => {
        if (error) {
          return reject(error);
        }

        if (existingUsers.length > 0) {
          return reject(new Error("username นี้มีอยู่ในระบบแล้ว"));
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return reject(err);
          }

          const sql = `INSERT INTO users (username, password, email, firstname, lastname, dob, address, telephone, createat, RoomID, role, userImg)
                VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NOW(), NULL, 'user', NULL)`;

          db.query(sql, [username, hashedPassword], function (error, result) {
            if (error) {
              return reject(error);
            }
            resolve({ message: "สมัครสำเร็จ", userId: result.insertId });
          });
        });
      }
    );
  });
};

const resetUserPassword = (userId, newPassword = config.user.defaultPassword) => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject(new Error("กรุณาระบุ userId"));
    }

    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return reject(err);
      }

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId],
        function (error, result) {
          if (error) {
            return reject(error);
          }

          if (result.affectedRows === 0) {
            return reject(new Error("ไม่พบผู้ใช้"));
          }

          resolve({ 
            message: "รีเซ็ตรหัสผ่านสำเร็จ", 
            userId: userId,
            newPassword: newPassword 
          });
        }
      );
    });
  });
};

router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  // if (req.user.role !== "admin") {
  //   return res
  //     .status(403)
  //     .json({ message: "เฉพาะผู้ดูแลระบบที่สามารถใช้คำสั่งนี้ได้" });
  // }

  try {
    const result = await createUser(username, password);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === "username นี้มีอยู่ในระบบแล้ว") {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === "กรุณากรอก username และ password") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});
router.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
  }

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, username],
    (error, results) => {
      const user = results && results.length > 0 ? results[0] : null;
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(401).json({ message: "ไม่พบ username หรือ email" });
      }

      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (err) {
          return next(err);
        }

        if (!passwordMatch) {
          return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
        }

        const accessToken = generateAccessToken(user);
        res.cookie("token", accessToken, {
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 3600000,
          secure: process.env.NODE_ENV === "production",
        });
        console.log(user.RoomID);
        res.status(200).json({ role: user.role, room: user.RoomID });
      });
    }
  );
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

router.get("/users", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่สามารถใช้คำสั่งนี้ได้" });
  }

  db.query("SELECT id, firstname, lastname FROM users", (error, users) => {
    if (error) {
      return next(error);
    }
    res.status(200).json(users);
  });
});

router.get("/profile", verifyToken, (req, res, next) => {
  const userId = req.user.id;

  if (!req.user) {
    return res.status(403).json({ message: "โปรดเข้าสู่ระบบ" });
  }

  const sql = `SELECT users.firstname, users.lastname, users.address, users.telephone, users.email, users.userimg, users.RoomID, room.roomname,
    room.roomTypeId FROM users LEFT JOIN room ON users.RoomID = room.id WHERE users.id = ?`;

  db.query(sql, [userId], (error, results) => {
    const user = results && results.length > 0 ? results[0] : null;
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }
    res.status(200).json(user);
  });
});

router.get("/id/:uid", verifyToken, (req, res, next) => {
  const userId = req.params.uid;
  if (!req.user) {
    return res.status(403).json({ message: "โปรดเข้าสู่ระบบ" });
  }
  db.query(
    `SELECT firstname, lastname, address, telephone, email, userimg FROM users WHERE id = ?`,
    [userId],
    (error, results) => {
      const user = results && results.length > 0 ? results[0] : null;
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
      }

      res.status(200).json(user);
    }
  );
});

router.put("/edit", verifyToken, async (req, res, next) => {
  const userId = req.user.id;
  const { firstname, lastname, address, telephone, email, userImg } = req.body;

  try {
    const updateFields = [];
    const values = [];

    const fieldsToUpdate = { firstname, lastname, address, telephone, email };

    for (const key in fieldsToUpdate) {
      if (fieldsToUpdate[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(fieldsToUpdate[key]);
      }
    }

    if (userImg !== undefined && userImg !== null && userImg !== '') {

      if (userImg.startsWith('data:image')) {
        const base64Data = Buffer.from(
          userImg.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
        const type = userImg.split(";")[0].split("/")[1];
        const fileName = `users/user-${userId}-${Date.now()}.${type}`;
        
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileName,
          Body: base64Data,
          ContentEncoding: "base64",
          ContentType: `image/${type}`,
          ACL: "public-read",
        };
        
        const uploadResult = await s3.upload(params).promise();
        updateFields.push("userimg = ?");
        values.push(uploadResult.Location);
      } 
      else if (userImg.startsWith('http') && userImg.includes(process.env.AWS_S3_BUCKET_NAME)) {
        updateFields.push("userimg = ?");
        values.push(userImg);
      } 
      else {
        return res.status(400).json({ message: "ข้อมูล userImg ไม่ถูกต้อง (ต้องเป็น Base64 หรือ URL จากระบบ)" });
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'ไม่มีข้อมูลให้อัปเดต' });
    }

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
    values.push(userId);

    const result = await new Promise((resolve, reject) => {
        db.query(sql, values, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' });
    }

    res.status(200).json({ message: "บันทึกข้อมูลเสร็จสิ้น" });

  } catch (error) {
    next(error);
  }
});

router.put("/change-password", verifyToken, (req, res, next) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  db.query("SELECT password FROM users WHERE id = ?", [userId], (error, results) => {
    const user = results && results.length > 0 ? results[0] : null;
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้" });
    }

    bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
      if (err) {
        return next(err);
      }

      if (!isMatch) {
        return res.status(401).json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" });
      }

      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return next(err);
        }

        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, userId],
          function (error, result) {
            if (error) {
              return next(error);
            }

            res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
          }
        );
      });
    });
  });
});

router.put("/reset-password/:userId", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบที่สามารถใช้คำสั่งนี้ได้" });
  }

  const { userId } = req.params;

  try {
    const result = await resetUserPassword(userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "ไม่พบผู้ใช้") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "กรุณาระบุ userId") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

module.exports = { router, createUser, resetUserPassword };