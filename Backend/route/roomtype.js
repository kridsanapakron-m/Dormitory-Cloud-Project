const express = require("express");
const { db } = require("../db");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();
const s3 = require("../service/s3");
require("dotenv").config();

router.get("/", (req, res, next) => {
  db.query(
    `SELECT id, roomtypeid, name, description, roomtypeimg, roomprice FROM roomtype ORDER BY id DESC`,
    (error, results) => {
      if (error) {
        return next(error);
      }
      res.status(200).json(results);
    }
  );
});
router.get("/roomtypes", (req, res, next) => {
  db.query(
    `SELECT id, roomtypeid FROM roomtype ORDER BY id DESC`,
    (error, results) => {
      if (error) {
        return next(error);
      }
      res.status(200).json(results);
    }
  );
});

router.get("/price", (req, res, next) => {
  db.query(
    `SELECT id, roomtypeid, roomprice FROM roomtype ORDER BY id DESC`,
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
    `SELECT id, roomtypeid, name, description, roomtypeimg, roomprice FROM roomtype WHERE id = ?`,
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

router.post("/", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { roomtypeid, name, description, roomtypeimg, roomprice } = req.body;

  if (!roomtypeid || typeof roomtypeid !== "string" || roomtypeid.length < 1) {
    return res.status(400).json({ message: "ข้อมูล รหัสประเภทห้อง ไม่ถูกต้อง" });
  }
  if (!name || typeof name !== "string" || name.length < 1) {
    return res.status(400).json({ message: "ข้อมูล ชื่อประเภทห้อง ไม่ถูกต้อง" });
  }
  if (!description || typeof description !== "string" || description.length < 1) {
    return res.status(400).json({ message: "ข้อมูล คำอธิบาย ไม่ถูกต้อง" });
  }
  if (!roomtypeimg) {
      return res.status(400).json({ message: "กรุณาแนบรูปภาพประเภทห้อง" });
  }

  try {
    const existing = await new Promise((resolve, reject) => {
      db.query(
        `SELECT id FROM roomtype WHERE roomtypeid = ?`,
        [roomtypeid],
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });

    if (existing.length > 0) {
      return res.status(409).json({ message: "รหัสประเภทห้องนี้มีในระบบแล้ว" });
    }

    const base64Data = Buffer.from(
      roomtypeimg.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = roomtypeimg.split(";")[0].split("/")[1];
    const fileName = `roomtypes/${roomtypeid}-${Date.now()}.${type}`;

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

    const result = await new Promise((resolve, reject) => {
      const sql = `INSERT INTO roomtype (roomtypeid, name, description, roomtypeimg, roomprice) VALUES (?, ?, ?, ?, ?)`;
      db.query(
        sql,
        [roomtypeid, name, description, imageUrl, roomprice],
        function (error, result) {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });

    res.status(201).json({
      message: "เพิ่มประเภทห้องสำเร็จ",
      id: result.insertId,
      roomtypeid: roomtypeid,
      imageUrl: imageUrl
    });

  } catch (error) {
    next(error);
  }
});

router.put("/:id", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "โปรดระบุ ID ประเภทห้อง" });
  }

  const { roomtypeid, name, description, roomtypeimg, roomprice } = req.body;

  try {
    const updateFields = [];
    const values = [];

    if (roomtypeid !== undefined) {
      if (typeof roomtypeid !== "string" || roomtypeid.length < 1) {
        return res.status(400).json({ message: "ข้อมูล รหัสประเภทห้อง ไม่ถูกต้อง" });
      }
      updateFields.push("roomtypeid = ?");
      values.push(roomtypeid);
    }
    if (name !== undefined) {
      if (typeof name !== "string" || name.length < 1) {
        return res.status(400).json({ message: "ข้อมูล ชื่อประเภทห้อง ไม่ถูกต้อง" });
      }
      updateFields.push("name = ?");
      values.push(name);
    }
    if (description !== undefined) {
      if (typeof description !== "string" || description.length < 1) {
        return res.status(400).json({ message: "ข้อมูล คำอธิบาย ไม่ถูกต้อง" });
      }
      updateFields.push("description = ?");
      values.push(description);
    }
    if (roomprice !== undefined) {
      updateFields.push("roomprice = ?");
      values.push(roomprice);
    }

    if (roomtypeimg !== undefined && roomtypeimg !== null && roomtypeimg !== '') {
      if (roomtypeimg.startsWith('data:image')) {
        const base64Data = Buffer.from(
          roomtypeimg.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
        const type = roomtypeimg.split(";")[0].split("/")[1];
        const fileName = `roomtypes/type-${id}-${Date.now()}.${type}`;
        
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileName,
          Body: base64Data,
          ContentEncoding: "base64",
          ContentType: `image/${type}`,
          ACL: "public-read",
        };
        
        const uploadResult = await s3.upload(params).promise();
        updateFields.push("roomtypeimg = ?");
        values.push(uploadResult.Location);
      } 
      else if (roomtypeimg.startsWith('http') && roomtypeimg.includes(process.env.AWS_S3_BUCKET_NAME)) {
        updateFields.push("roomtypeimg = ?");
        values.push(roomtypeimg);
      } 
      else {
        return res.status(400).json({ message: "ข้อมูล roomtypeimg ไม่ถูกต้อง" });
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'ไม่มีข้อมูลให้อัปเดต' });
    }

    const sql = `UPDATE roomtype SET ${updateFields.join(", ")} WHERE id = ?`;
    values.push(id);

    const result = await new Promise((resolve, reject) => {
      db.query(sql, values, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบประเภทห้องที่ต้องการแก้ไข" });
    }

    res.status(200).json({ message: "อัปเดตประเภทห้องสำเร็จ" });

  } catch (error) {
    next(error);
  }
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
