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

  db.query(selectQuery, (error, results) => { 
    if (error) {
      return next(error); 
    }
    if (!results || results.length === 0) { 
        return res.status(200).json({ totalRooms: 0 });
    }
    return res.status(200).json({ totalRooms: results[0].totalRooms });
  });
});

router.get("/queue", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }

  const selectQuery = `SELECT COUNT(id) AS totalQueues FROM Queue;`;

  db.query(selectQuery, (error, results) => {
    if (error) {
      return next(error);
    }
    if (!results || results.length === 0) {
        return res.status(200).json({ totalQueues: 0 });
    }
    return res.status(200).json({ totalQueues: results[0].totalQueues });
  });
});

router.get("/vacant", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }

  const selectQuery = `SELECT count(id) AS totalTenants from room where renterID is not NULL;`;

  db.query(selectQuery, (error, results) => {
    if (error) {
      return next(error);
    }
     if (!results || results.length === 0) {
        return res.status(200).json({ totalTenants: 0 });
    }
    return res.status(200).json({ totalTenants: results[0].totalTenants });
  });
});

router.get("/bill", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบ" });
  }

  const selectQuery = `SELECT count(BillID) AS unpaidBills from bill where billStatus!=2;`;

  db.query(selectQuery, (error, results) => {
    if (error) {
      return next(error);
    }
     if (!results || results.length === 0) {
        return res.status(200).json({ unpaidBills: 0 });
    }
    return res.status(200).json({ unpaidBills: results[0].unpaidBills });
  });
});

module.exports = router;