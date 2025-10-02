const express = require("express");
const { db } = require("../db");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", (req, res, next) => {
  db.query(
    `SELECT id, roomtypeid, name, description, roomtypeimg FROM roomtype ORDER BY id DESC`,
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
    return res.status(400).json({ message: "โปรดระบุ ID ประเภทห้อง" });
  }

  db.query(
    `SELECT id, roomtypeid, name, description, roomtypeimg FROM roomtype WHERE id = ?`,
    [id],
    (error, results) => {
      if (error) {
        return next(error);
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ message: "ไม่พบประเภทห้องที่ระบุ" });
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

  const { roomtypeid, name, description, roomtypeimg } = req.body;

  if (!roomtypeid || typeof roomtypeid !== "string" || roomtypeid.length < 1) {
    return res.status(400).json({ message: "ข้อมูล รหัสประเภทห้อง ไม่ถูกต้อง" });
  }

  if (!name || typeof name !== "string" || name.length < 1) {
    return res.status(400).json({ message: "ข้อมูล ชื่อประเภทห้อง ไม่ถูกต้อง" });
  }

  if (!description || typeof description !== "string" || description.length < 1) {
    return res.status(400).json({ message: "ข้อมูล คำอธิบาย ไม่ถูกต้อง" });
  }

  db.query(
    `SELECT id FROM roomtype WHERE roomtypeid = ?`,
    [roomtypeid],
    (error, existing) => {
      if (error) {
        return next(error);
      }

      if (existing && existing.length > 0) {
        return res.status(409).json({ message: "รหัสประเภทห้องนี้มีในระบบแล้ว" });
      }

      const sql = `INSERT INTO roomtype (roomtypeid, name, description, roomtypeimg) VALUES (?, ?, ?, ?)`;

      db.query(
        sql,
        [roomtypeid, name, description, roomtypeimg],
        function (error, result) {
          if (error) {
            return next(error);
          }

          res.status(201).json({
            message: "เพิ่มประเภทห้องสำเร็จ",
            id: result.insertId,
            roomtypeid: roomtypeid
          });
        }
      );
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
    return res.status(400).json({ message: "โปรดระบุ ID ประเภทห้อง" });
  }

  const { roomtypeid, name, description, roomtypeimg } = req.body;

  if (roomtypeid !== undefined) {
    if (typeof roomtypeid !== "string" || roomtypeid.length < 1) {
      return res.status(400).json({ message: "ข้อมูล รหัสประเภทห้อง ไม่ถูกต้อง" });
    }
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.length < 1) {
      return res.status(400).json({ message: "ข้อมูล ชื่อประเภทห้อง ไม่ถูกต้อง" });
    }
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.length < 1) {
      return res.status(400).json({ message: "ข้อมูล คำอธิบาย ไม่ถูกต้อง" });
    }
  }

  const sql = `UPDATE roomtype SET roomtypeid = ?, name = ?, description = ?, roomtypeimg = ? WHERE id = ?`;

  db.query(
    sql,
    [roomtypeid, name, description, roomtypeimg, id],
    function (error, result) {
      if (error) {
        return next(error);
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบประเภทห้องที่ต้องการแก้ไข" });
      }

      res.status(200).json({ message: "อัปเดตประเภทห้องสำเร็จ" });
    }
  );
});

router.delete("/:id", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "โปรดระบุ ID ประเภทห้อง" });
  }

  db.query(
    `SELECT id FROM room WHERE roomTypeId = ?`,
    [id],
    (error, rooms) => {
      if (error) {
        return next(error);
      }

      if (rooms && rooms.length > 0) {
        return res.status(400).json({ 
          message: "ไม่สามารถลบประเภทห้องได้ เนื่องจากมีห้องที่ใช้ประเภทนี้อยู่" 
        });
      }

      db.query(`DELETE FROM roomtype WHERE id = ?`, [id], function (error, result) {
        if (error) {
          return next(error);
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "ไม่พบประเภทห้องที่ต้องการลบ" });
        }

        res.status(200).json({ message: "ลบประเภทห้องสำเร็จ" });
      });
    }
  );
});

module.exports = router;
