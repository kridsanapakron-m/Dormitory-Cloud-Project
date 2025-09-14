const express = require("express");
const { db } = require("../db");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", verifyToken, (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "กรุณา login" });
  }

  db.all(
    "SELECT id, message, timestamp FROM chatDataBase ORDER BY timestamp DESC",
    [],
    (error, chats) => {
      if (error) {
        return next(error);
      }
      res.status(200).json(chats);
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

  db.run(
    "INSERT INTO chatDataBase (message, timestamp) VALUES (?, datetime('now', '+7 hours'))",
    [message],
    function (error) {
      if (error) {
        return next(error);
      }

      db.get(
        "SELECT * FROM chatDataBase WHERE id = ?",
        [this.lastID],
        (error, insertedChat) => {
          if (error) {
            return next(error);
          }

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