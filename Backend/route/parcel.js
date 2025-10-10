const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');
const s3 = require("../service/s3");
require("dotenv").config();
router.post('/add', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    const { roomName, IncomingDate, parcel_img } = req.body;

    if (!parcel_img) {
        return res.status(400).json({ error: 'กรุณาแนบรูปภาพพัสดุ' });
    }

    if (IncomingDate) {
        CleanIncomingDate = IncomingDate.replace('Z', '').split('.')[0].replace('T', ' ');
    }
    
    db.query(
        `SELECT available FROM room WHERE roomName = ?`,
        [roomName],
        async function (error, results) {
            if (error) {
                return res.status(500).json({ error: 'ไม่สามารถตรวจสอบสถานะห้องได้' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'ไม่พบห้องที่ระบุ' });
            }
            
            const room = results[0];
            if (room.available === 0) {
                return res.status(400).json({ error: 'ไม่สามารถเพิ่มพัสดุได้ เนื่องจากห้องนี้ไม่มีผู้เช่า' });
            }
            
            try {
                const photoBase64 = parcel_img;
                const base64Data = Buffer.from(
                    photoBase64.replace(/^data:image\/\w+;base64,/, ""),
                    "base64"
                );

                const type = photoBase64.split(";")[0].split("/")[1];
                const fileName = `parcels/${roomName}-${Date.now()}.${type}`;

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

                db.query(
                    `INSERT INTO parcel (roomName, IncomingDate, parcel_img) VALUES (?, ?, ?)`,
                    [roomName, CleanIncomingDate, imageUrl],
                    function (error, result) {
                        if (error) {
                            console.error("Database Insert Error:", error);
                            return res.status(500).json({ error: 'ไม่สามารถเพิ่มพัสดุได้'});
                        }
                        res.status(201).json({ message: 'เพิ่มพัสดุสำเร็จ', id: result.insertId, imageUrl: imageUrl });
                    }
                );

            } catch (s3Error) {
                console.error("Error uploading to S3:", s3Error);
                return res.status(500).json({ error: 'ไม่สามารถอัปโหลดรูปภาพไปยัง S3 ได้' });
            }
        }
    );

});
router.get('/all', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    
    db.query(`SELECT * FROM parcel`, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'ไม่สามารถดึงพัสดุได้'});
        }
        res.status(200).json(results);
    });
});

router.delete('/delete/:id', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    const { id } = req.params;
    
    db.query(`DELETE FROM parcel WHERE id = ?`, [id], function (error, result) {
        if (error) {
            return res.status(500).json({ error: 'ไม่สามารถลบพัสดุได้'});
        }
        res.status(200).json({ message: 'ลบพัสดุสำเร็จ' });
    });
});

router.put('/edit/:id', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    const { id } = req.params;
    const { roomName, IncomingDate, parcel_img } = req.body;
    
    db.query(
        `UPDATE parcel SET roomName = ?, IncomingDate = ?, parcel_img = ? WHERE id = ?`,
        [roomName, IncomingDate, parcel_img, id],
        function (error, result) {
            if (error) {
                return res.status(500).json({ error: 'ไม่สามารถอัปเดตพัสดุได้'});
            }
            res.status(200).json({ message: 'อัปเดตพัสดุสำเร็จ' });
        }
    );
});

router.get('/room', verifyToken, (req, res) => {
    const userId = req.user.id;
    
    db.query(`SELECT RoomID FROM users WHERE id = ?`, [userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'ไม่สามารถดึงพัสดุโดย userId ได้', details: error.message });
        }
        
        const user = results.length > 0 ? results[0] : null;
        if (!user || !user.RoomID) {
            return res.status(404).json({ message: 'ห้องไม่พบสำหรับ userId ที่กำหนด' });
        }

        db.query(`SELECT roomName FROM room WHERE id = ?`, [user.RoomID], (error, results) => {
            if (error) return res.status(500).json({ error: error.message });

            const room = results[0];
            if (!room) {
                return res.status(404).json({ message: 'ไม่พบชื่อห้องจาก RoomID' });
            }

            db.query(`SELECT * FROM parcel WHERE roomName = ?`, [room.roomName], (error, results) => {
                if (error) return res.status(500).json({ error: error.message });

                res.status(200).json(results);
            });
        });
    });
});

//ดึงข้อมูลชื่อผู้ใช้งานที่มีห้อง เพื่อแสดงในหน้าพัสดุ
router.get('/users', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    
    db.query(`SELECT firstname, roomName FROM users`, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้'});
        }
        res.status(200).json(results);
    });
});

module.exports = router;