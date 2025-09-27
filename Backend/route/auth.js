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
  const { userIdentifier, password } = req.body;
  if (!userIdentifier || !password) {
    return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
  }

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [userIdentifier, userIdentifier],
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

  db.query(sql, params, function (error, result) {
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

    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId],
      function (error, result) {
        if (error) {
          return next(error);
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        res.status(200).json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });
      }
    );
  });
});

module.exports = { router, createUser };