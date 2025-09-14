const express = require("express");
const { db } = require("../db");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/room", verifyToken, (req, res, next) => {
  console.log("Hi!");
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }

  const selectQuery = `SELECT COUNT(id) AS totalRooms FROM room;`;

  db.get(selectQuery, (error, row) => { 
    if (error) {
      return next(error); 
    }
    if (!row) { 
        return res.status(200).json({ totalRooms: 0 });
    }
    return res.status(200).json({ totalRooms: row.totalRooms });
  });
});

router.get("/queue", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }

  const selectQuery = `SELECT COUNT(id) AS totalQueues FROM Queue;`;

  db.get(selectQuery, (error, row) => {
    if (error) {
      return next(error);
    }
    if (!row) {
        return res.status(200).json({ totalQueues: 0 });
    }
    return res.status(200).json({ totalQueues: row.totalQueues });
  });
});

router.get("/vacant", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }

  const selectQuery = `SELECT count(id) AS totalTenants from room where renterID is not NULL;`;

  db.get(selectQuery, (error, row) => {
    if (error) {
      return next(error);
    }
     if (!row) {
        return res.status(200).json({ totalTenants: 0 });
    }
    return res.status(200).json({ totalTenants: row.totalTenants });
  });
});

router.get("/bill", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }

  const selectQuery = `SELECT count(BillID) AS unpaidBills from bill where billStatus!=2;`;

  db.get(selectQuery, (error, row) => {
    if (error) {
      return next(error);
    }
     if (!row) {
        return res.status(200).json({ unpaidBills: 0 });
    }
    return res.status(200).json({ unpaidBills: row.unpaidBills });
  });
});

module.exports = router;