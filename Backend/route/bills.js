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
const { sendEmail } = require("../service/send-email");
const s3 = require("../service/s3");
require("dotenv").config();

router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "You must be admin to access this" });
  }
  const promiseDb = db.promise();
  try {
    const data = req.body;

    // ✅ แปลง billMonth -> YYYY-MM-01
    const bm = new Date(data.billMonth);
    const billMonth = `${bm.getFullYear()}-${String(bm.getMonth() + 1).padStart(2, "0")}-01`;

    // ✅ แปลง DueDate -> YYYY-MM-DD HH:mm:ss
    const dd = new Date(data.DueDate);
    const dueDate = `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}-${String(dd.getDate()).padStart(2, "0")} ${String(dd.getHours()).padStart(2, "0")}:${String(dd.getMinutes()).padStart(2, "0")}:${String(dd.getSeconds()).padStart(2, "0")}`;

    const insertQuery = `INSERT INTO bill 
      (RoomID, billMonth, DueDate, waterprice, electricprice, taskprice, roomprice, missDateCount, missfee, totalPrice, billStatus, additionalFees) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
    const [insertResult] = await promiseDb.query(insertQuery, [
      data.RoomID,
      billMonth,
      dueDate,
      data.waterprice ?? 0,
      data.electricprice ?? 0,
      data.taskprice ?? 0,
      data.roomprice,
      data.missDateCount ?? 0,
      data.missfee ?? 0,
      data.totalPrice ?? 0,
      0, // billStatus
      JSON.stringify(data.additionalFees || [])
    ]);

    const findTenantQuery = `SELECT email FROM users WHERE RoomID = ?`;
    const [tenants] = await promiseDb.query(findTenantQuery, [data.RoomID]);

    if (tenants.length > 0 && tenants[0].email) {
      const tenantEmail = tenants[0].email;

      const billingMonthFormatted = new Date(billMonth).toLocaleString('th-TH', {
        month: 'long',
        year: 'numeric',
      });
      const total = parseFloat(data.roomprice ?? 0) + 
              parseFloat(data.waterprice ?? 0) + 
              parseFloat(data.electricprice ?? 0) + 
              parseFloat(data.taskprice ?? 0);

      const totalPriceFormatted = total.toFixed(2);

      await sendEmail({
        to: tenantEmail,
        subject: `แจ้งบิลค่าหอพักประจำเดือน ${billingMonthFormatted}`,
        html: `
          <h2>ใบแจ้งค่าหอพักประจำเดือน</h2>
          <p>ทางหอพักขอแจ้งรายละเอียดบิลค่าหอพักประจำเดือน <strong>${billingMonthFormatted}</strong> ดังนี้:</p>
          <ul>
            <li><strong>ค่าห้องพัก:</strong> ${data.roomprice} บาท</li>
            <li><strong>ค่าน้ำ:</strong> ${data.waterprice ?? 0} บาท</li>
            <li><strong>ค่าไฟ:</strong> ${data.electricprice ?? 0} บาท</li>
            <li><strong>ค่าบริการอื่นๆ รวม:</strong> ${data.taskprice ?? 0} บาท</li>
            <li><strong>รวมทั้งหมด:</strong> <strong>${totalPriceFormatted}</strong> บาท</li>
          </ul>
          <p>กรุณาชำระค่าหอพักภายในวันที่กำหนด หากชำระแล้วโปรดเก็บหลักฐานไว้เพื่อยืนยัน</p>
          <br>
          <p>ขอบคุณที่ใช้บริการ,<br>ทีมงานระบบจัดการหอพัก</p>
        `,
      });
      return res.status(200).json({ message: "Bill created and email sent successfully!"});
    } else {
      return res.status(200).json({ message: "Bill created, but no tenant email found to send notification."});
    }

  } catch (error) {
    console.error(error);
    if (error instanceof TypeError || error.message.includes("Invalid Date")) {
        return res.status(400).json({ message: "Invalid date format provided." });
    }
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


router.get("/", verifyToken, (req, res) => {
  let query =
    "SELECT b.*,r.roomName as roomNumber from bill b join room r ON (b.RoomID = r.id)";
  let params = [];

  if (req.query.roomid && req.user.role === "admin") {
    query += " WHERE b.roomid = ?";
    params.push(req.query.roomid);
  } else if (req.user.role === "user") {
    query += " WHERE b.roomid = ?";
    params.push(req.user.room);
  }
  console.log(query);
  db.query(query, params, (ex, result) => {
    if (ex) {
      console.error("Got Error:", ex);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    result.forEach((a) => {
      if (a.transactionimg) {
        if (!a.transactionimg.startsWith("data:")) {
          a.transactionimg = "data:image/jpeg;base64," + a.transactionimg;
        }
      }
    });

    res.status(200).json(result);
  });
});

router.get("/paid", verifyToken, (req, res) => {
  db.query(
    "SELECT u.id,b.* FROM bill b JOIN users u ON (u.RoomID = b.RoomID) WHERE billstatus!=0" +
    (req.query.roomid && req.user.role == "admin"
      ? ` AND RoomID=${req.query.roomid}`
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

router.put("/:billid/paying", verifyToken, async (req, res, next) => {
  const { transactionImgBase64 } = req.body;
  const { billid } = req.params;

  if (!transactionImgBase64) {
    return res.status(400).json({ message: "กรุณาแนบหลักฐานการชำระเงิน" });
  }


  if (typeof transactionImgBase64 !== 'string' || !transactionImgBase64.startsWith('data:image')) {
    return res.status(400).json({ message: "รูปแบบรูปภาพไม่ถูกต้อง (ต้องเป็น Base64)" });
  }

  try {

    const base64Data = Buffer.from(
      transactionImgBase64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = transactionImgBase64.split(";")[0].split("/")[1];
    const fileName = `transactions/bill-${billid}-${Date.now()}.${type}`;

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
      db.query(
        `UPDATE bill SET transactionimg=?, billstatus=1 WHERE billid=?`,
        [imageUrl, billid],
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `ไม่พบบิล ${billid}` });
    }

    return res.status(200).json({
      message: `อัปเดตสถานะบิล ${billid} เป็นชำระแล้วเรียบร้อย`,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.put("/:billid/confirmPayment", verifyToken, (req, res) => {
  if (req.user.role != "admin")
    return res
      .status(403)
      .json({ message: "You must be admin to access this" });
  db.query(
    `UPDATE bill SET billStatus=2,paidDate=CURRENT_TIMESTAMP WHERE billid=${req.params["billid"]}`,
    (ex, result) => {
      if (ex) {
        console.error(ex);
        res.status(500).json({ message: "Internet Server Error" });
      }
      if (result.affectedRows == 0) {
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
  db.query(
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