const express = require("express");
const { db } = require("../db");
const { verifyToken } = require("../middleware/auth.middleware");
const validator = require("validator");
const router = express.Router();

router.get("/", (req, res, next) => {
  db.query(
    `SELECT * FROM landingpage ORDER BY id DESC`,
    (error, results) => {
      if (error) {
        return next(error);
      }
      res.status(200).json(results);
    }
  );
});

router.get("/:id", (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "โปรดระบุ ID" });
  }

  db.query(
    `SELECT * FROM landingpage WHERE id = ?`,
    [id],
    (error, results) => {
      if (error) {
        return next(error);
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ message: "ไม่พบข้อมูล" });
      }

      res.status(200).json(results[0]);
    }
  );
});

router.post("/", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { 
    system_name, 
    location, 
    phone, 
    email, 
    facebook, 
    instagram, 
    google_map 
  } = req.body;

  if (!system_name || typeof system_name !== "string" || system_name.length < 1) {
    return res.status(400).json({ message: "ข้อมูล ชื่อระบบ ไม่ถูกต้อง" });
  }

  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ message: "รูปแบบ email ไม่ถูกต้อง" });
  }

  const sql = `INSERT INTO landingpage (system_name, location, phone, email, facebook, instagram, google_map) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [system_name, location, phone, email, facebook, instagram, google_map],
    function (error, result) {
      if (error) {
        return next(error);
      }

      res.status(201).json({
        message: "เพิ่มข้อมูลสำเร็จ",
        id: result.insertId
      });
    }
  );
});


router.put("/:id", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "โปรดระบุ ID" });
  }

  const { 
    system_name, 
    location, 
    phone, 
    email, 
    facebook, 
    instagram, 
    google_map 
  } = req.body;

  if (system_name !== undefined) {
    if (typeof system_name !== "string" || system_name.length < 1) {
      return res.status(400).json({ message: "ข้อมูล ชื่อระบบ ไม่ถูกต้อง" });
    }
  }

  if (email !== undefined && email !== null && email !== "") {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "รูปแบบ email ไม่ถูกต้อง" });
    }
  }

  const sql = `UPDATE landingpage SET 
               system_name = ?, location = ?, phone = ?, 
               email = ?, facebook = ?, instagram = ?, google_map = ?
               WHERE id = ?`;

  db.query(
    sql,
    [system_name, location, phone, email, facebook, instagram, google_map, id],
    function (error, result) {
      if (error) {
        return next(error);
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการแก้ไข" });
      }

      res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ" });
    }
  );
});

router.delete("/:id", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "โปรดระบุ ID" });
  }

  db.query(`DELETE FROM landingpage WHERE id = ?`, [id], function (error, result) {
    if (error) {
      return next(error);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ" });
    }

    res.status(200).json({ message: "ลบข้อมูลสำเร็จ" });
  });
});

module.exports = router;

