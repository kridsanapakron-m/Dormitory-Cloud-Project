const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');

router.post("/:roomTypeId", (req, res, next) => {
  const { roomTypeId } = req.params;
  const { email, firstname, lastname, description, bookingDate, bookingTime } = req.body;
  const queueDate = new Date();

  if (!email || !firstname || !lastname) {
    return res.status(400).json({ message: "กรุณากรอก email, firstname และ lastname" });
  }

  db.query(
    "SELECT COUNT(id) as checkqueue FROM Queue WHERE email = ?",
    [email],
    (err, queueCheckResults) => {
      if (err) {
        return next(err);
      }

      if (queueCheckResults[0].checkqueue > 0) {
        return res.status(409).json({ message: "คุณมีคิวอยู่แล้ว" });
      }

      db.query(
        "SELECT COUNT(id) as vacantCount FROM room WHERE roomTypeId = ?",
        [roomTypeId],
        (err, vacantResults) => {
          if (err) {
            return next(err);
          }

          db.query(
            "SELECT COUNT(id) as unavailableCount FROM room WHERE roomTypeId = ? AND renterID IS NOT NULL",
            [roomTypeId],
            (err, unavailableResults) => {
              if (err) {
                return next(err);
              }

              db.query(
                "SELECT COUNT(id) as queueCount FROM Queue WHERE roomTypeId = ?",
                [roomTypeId],
                (err, queueResults) => {
                  if (err) {
                    return next(err);
                  }

                  const vacantCount = vacantResults[0].vacantCount;
                  const unavailableCount = unavailableResults[0].unavailableCount;
                  const queueCount = queueResults[0].queueCount;

                  console.log(vacantCount, unavailableCount, queueCount);

                  if (queueCount + unavailableCount >= vacantCount) {
                    return res.status(409).json({ message: "ไม่สามารถจองคิวได้" });
                  }

                  const insertQueue = `INSERT INTO Queue (email, firstname, lastname, roomTypeId, queueDate, description, bookingDate, bookingTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
                  db.query(
                    insertQueue,
                    [email, firstname, lastname, roomTypeId, queueDate, description, bookingDate, bookingTime],
                    function (error, result) {
                      if (error) {
                        return next(error);
                      }
                      res.status(201).json({ roomId: result.insertId });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

router.delete("/del/:queueId", verifyToken, (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "กรุณา login" });
  }
  const { queueId } = req.params;

  const deleteQuery = "DELETE FROM Queue WHERE id = ?";
  console.log(deleteQuery + queueId);
  db.query(deleteQuery, [queueId], function (error, result) {
    if (error) {
      return next(error);
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบคิว" });
    }
    return res.status(200).json({ message: "ลบคิวสำเร็จ" });
  });
});

router.get("/", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "เฉพาะผู้ดูแลระบบที่ใช้คำสั่งนี้ได้" });
  }

  const selectQuery = `
  SELECT
      q.id,
      q.userId,
      q.roomTypeId,
      q.queueDate,
      q.description,
      q.bookingDate,
      q.bookingTime,
      u.firstname,
      u.lastname,
      u.email,
      u.telephone
  FROM Queue q
  JOIN users u ON q.userId = u.id
  ORDER BY q.queueDate
`;
  db.query(selectQuery, (error, queueEntries) => {
    if (error) {
      return next(error);
    }
    return res.status(200).json(queueEntries);
  });
});

router.get("/vacant/:type", verifyToken, (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "กรุณา login" });
  }
  const { type } = req.params;

  const selectQuery = `
    SELECT id, roomName FROM room WHERE roomTypeId = ? AND renterID IS NULL;
`;
  db.query(selectQuery, [type], (error, vacantroom) => {
    if (error) {
      return next(error);
    }
    return res.status(200).json(vacantroom);
  });
});

router.get("/check/:type", verifyToken, (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "กรุณา login" });
  }
  const { type } = req.params;

  db.query(
    "SELECT COUNT(id) as vacantCount FROM room WHERE roomTypeId = ? AND available = 0",
    [type],
    (err, vacantResults) => {
      if (err) {
        return next(err);
      }

      db.query(
        "SELECT COUNT(id) as unavailableCount FROM room WHERE roomTypeId = ? AND available = 1",
        [type],
        (err, unavailableResults) => {
          if (err) {
            return next(err);
          }

          db.query(
            "SELECT COUNT(id) as queueCount FROM Queue WHERE roomTypeId = ?",
            [type],
            (err, queueResults) => {
              if (err) {
                return next(err);
              }

              const vacantCount = vacantResults[0].vacantCount;
              const unavailableCount = unavailableResults[0].unavailableCount;
              const queueCount = queueResults[0].queueCount;

              const result = {
                vacant: vacantCount,
                unavailable: unavailableCount,
                queue: queueCount,
              };

              if (queueCount + unavailableCount >= vacantCount) {
                res.status(409).json({ message: "คิวเต็ม" });
              } else {
                res.status(200).json({ message: "คิวว่าง" });
              }
            }
          );
        }
      );
    }
  );
});

router.get("/roomtypes", (req, res, next) => {
  const selectQuery = `
    SELECT roomtypeid, name, description, roomtypeimg FROM roomtype;
  `;

  db.query(selectQuery, (error, roomTypes) => {
    if (error) {
      return next(error);
    }
    return res.status(200).json(roomTypes);
  });
});

module.exports = router;