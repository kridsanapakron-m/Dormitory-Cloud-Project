const express = require("express");
const { db } = require("../db");
const config = require("../config");
const { verifyToken } = require("../middleware/auth.middleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const stream = require("stream");
const qr = require("qrcode");
const generatePayload = require("promptpay-qr");
const router = express.Router();

router.post("/", verifyToken, (req, res) => {
  if (req.user.role != "admin")
    return res
      .status(403)
      .json({ message: "You must be admin to access this" });
  const data = req.body;

  console.log(data.additionalFees);
  db.run(
    "INSERT INTO bill (RoomID, billMonth, DueDate, waterprice, electricprice, taskprice, roomprice, missDateCount, missfee, totalPrice, billStatus,additionalFees) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.RoomID,
      data.billMonth,
      data.DueDate,
      data.waterprice !== undefined ? data.waterprice : 0,
      data.electricprice !== undefined ? data.electricprice : 0,
      data.taskprice !== undefined ? data.taskprice : 0,
      data.roomprice,
      data.missDateCount !== undefined ? data.missDateCount : 0,
      data.missfee !== undefined ? data.missfee : 0,
      data.totalPrice !== undefined ? data.totalPrice : 0,
      0, // billStatus
      JSON.stringify(data.additionalFees || []),
    ],
    (ex) => {
      if (ex) {
        console.error(ex);
        res.status(500).json({ message: "Internet Server Error" });
      }
      res.status(200).json({ message: "Bill created!", billid: this.lastID });
    }
  );
});

router.get("/", verifyToken, (req, res) => {
  let query =
    "SELECT b.*,r.roomName as roomNumber from bill b join room r ON (b.RoomID == r.id)";
  let params = [];

  if (req.query.roomid && req.user.role === "admin") {
    query += " WHERE b.roomid = ?";
    params.push(req.query.roomid);
  } else if (req.user.role === "user") {
    query += " WHERE b.roomid = ?";
    params.push(req.user.room);
  }
  console.log(query);
  db.all(query, params, (ex, result) => {
    if (ex) {
      console.error("Got Error:", ex);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    result.forEach((a) => {
      if (a.transactionimg) {
        a.transactionimg =
          "data:image/jpeg;base64," + a.transactionimg.toString("base64");
      }
    });

    res.status(200).json(result);
  });
});

router.get("/paid", verifyToken, (req, res) => {
  db.all(
    "SELECT u.id,b.* FROM bill b JOIN users u ON (u.roomid = b.roomid) WHERE billstatus!=0" +
      (req.query.roomid && req.user.role == "admin"
        ? ` AND roomid=${req.query.roomid}`
        : req.user.role == "user"
        ? ` AND id=${req.user.id}`
        : ""),
    (ex, result) => {
      if (ex) {
        console.error("Got Error:", ex);
        res.status(500).json({ message: "Internet Server Error" });
      }
      result.map((a) => {
        a["transactionimg"] =
          a["transactionimg"] && a["transactionimg"].toString("base64");
      });
      res.status(200).json(result);
    }
  );
});

router.put(
  "/:billid/paying",
  verifyToken,
  upload.single("TransactionImg"),
  (req, res) => {
    const { buffer } = req.file;
    db.run(
      `UPDATE bill SET transactionimg=?, billstatus=1 WHERE billid=${req.params["billid"]}`,
      [buffer],
      (ex) => {
        if (ex) {
          console.error("Got Error:", ex);
          res.status(500).json({ message: "Internet Server Error" });
        }
        if (this.changes == 0)
          res.status(404).json({
            message: `Bill ${req.params["billid"]} not found or it's already been set.`,
          });
        res.status(200).json({
          message: `Bill ${req.params["billid"]} has been set to paid.`,
        });
      }
    );
  }
);

router.put("/:billid/confirmPayment", verifyToken, (req, res) => {
  if (req.user.role != "admin")
    return res
      .status(403)
      .json({ message: "You must be admin to access this" });
  db.run(
    `UPDATE bill SET billStatus=2,paidDate=CURRENT_TIMESTAMP WHERE billid=${req.params["billid"]}`,
    (ex) => {
      if (ex) {
        console.error(ex);
        res.status(500).json({ message: "Internet Server Error" });
      }
      if (this.changes == 0) {
        res.status(404).json({
          message: `Bill ${req.params["billid"]} not found or it's value has already been set`,
        });
      } else {
        res.status(200).json({
          message: `Bill ${req.params["billid"]} has been set to confirmed.`,
        });
      }
    }
  );
});

router.get("/:billid/qr", verifyToken, (req, res) => {
  db.all(
    "SELECT totalPrice FROM bill WHERE billid=?",
    [req.params["billid"]],
    (ex, val) => {
      if (ex) {
        console.error(ex);
        res.status(500).json({ message: "Internet Server Error" });
      }
      if (!val.length)
        return res
          .status(404)
          .json({ message: `Bill ${req.params["billid"]} not found.` });
      if (req.query.img) {
        const passThrough = stream.PassThrough();

        qr.toFileStream(
          passThrough,
          generatePayload(config.promptpayqr, {
            amount: Number.parseFloat(val[0].totalPrice),
          })
        );

        passThrough.pipe(res);
        return;
      }
      qr.toBuffer(
        generatePayload(config.promptpayqr, {
          amount: Number.parseFloat(val[0].totalPrice),
        })
      ).then((v) => {
        return res.status(200).json({
          base64url: "data:image/png;base64," + v.toString("base64"),
          promptpayid: config.promptpayqr,
        });
      });
    }
  );
});

module.exports = router;