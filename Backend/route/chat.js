const express = require("express");
const { db } = require("../db");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", verifyToken, (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "กรุณา login" });
  }

  db.query(
    "SELECT id, message, timestamp FROM chatDataBase ORDER BY timestamp DESC",
    (error, results) => {
      if (error) {
        return next(error);
      }
      res.status(200).json(results);
    }
  );
});

router.post("/", verifyToken, (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "กรุณา login" });
  }
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "กรุณากรอกข้อความ" });
  }

  db.query(
    "INSERT INTO chatDataBase (message, timestamp) VALUES (?, NOW())",
    [message],
    function (error, result) {
      if (error) {
        return next(error);
      }

      db.query(
        "SELECT * FROM chatDataBase WHERE id = ?",
        [result.insertId],
        (error, results) => {
          if (error) {
            return next(error);
          }

          const insertedChat = results && results.length > 0 ? results[0] : null;
          if (!insertedChat) {
            return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
          }
          res.status(201).json({ insertedChat: insertedChat });
        }
      );
    }
  );
});

module.exports = router;