const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db");
const config = require("../config");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      room: user.RoomID,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

router.post("/register", verifyToken, (req, res, next) => {
  const { username, password } = req.body;
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่สามารถใช้คำสั่งนี้ได้" });
  }

  if (!username || !password) {
    return res.status(400).json({ message: "กรุณากรอก username และ password" });
  }

  db.all(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (error, existingUsers) => {
      if (error) {
        return next(error);
      }

      if (existingUsers.length > 0) {
        return res.status(409).json({ message: "username นี้มีอยู่ในระบบแล้ว" });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return next(err);
        }

        const sql = `INSERT INTO users (username, password, email, firstname, lastname, dob, address, telephone, createat, RoomID, role, userImg)
              VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, NULL, datetime('now'), NULL, 'user', NULL)`;

        db.run(sql, [username, hashedPassword], function (error) {
          if (error) {
            return next(error);
          }
          res.status(201).json({ message: "สมัครสำเร็จ", userId: this.lastID });
        });
      });
    }
  );
});
router.post("/login", (req, res, next) => {
  const { userIdentifier, password } = req.body;
  if (!userIdentifier || !password) {
    return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
  }

  db.get(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [userIdentifier, userIdentifier],
    (error, user) => {
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

  db.all("SELECT id, firstname, lastname FROM users", (error, users) => {
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

  db.get(sql, [userId], (error, user) => {
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
  db.get(
    `SELECT firstname, lastname, address, telephone, email, userimg FROM users WHERE id = ?`,
    [userId],
    (error, user) => {
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

router.put("/edit", verifyToken, (req, res, next) => {
  const userId = req.user.id;
  const { firstname, lastname, address, telephone, email, userImg } = req.body;
  let sql =
    "UPDATE users SET firstname = ?, lastname = ?, address = ?, telephone = ?, email = ?";
  const params = [firstname, lastname, address, telephone, email];

  if (typeof userImg === "string") {
    sql += ", userimg = ?";
    params.push(userImg);
  }
  sql += " WHERE id = ?";
  params.push(userId);

  db.run(sql, params, function (error) {
    if (error) {
      return next(error);
    }
    res.status(200).json({ message: "บันทึกข้อมูลเสร็จสิ้น" });
  });
});

router.put("/change-password", verifyToken, (req, res, next) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  db.get("SELECT password FROM users WHERE id = ?", [userId], (error, user) => {
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

        db.run(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, userId],
          function (error) {
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

router.put("/reset-password/:userId", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบที่สามารถใช้คำสั่งนี้ได้" });
  }

  const { userId } = req.params;
  const defaultPassword = "Cisco123!";

  bcrypt.hash(defaultPassword, 10, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }

    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId],
      function (error) {
        if (error) {
          return next(error);
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        res.status(200).json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });
      }
    );
  });
});

module.exports = router;