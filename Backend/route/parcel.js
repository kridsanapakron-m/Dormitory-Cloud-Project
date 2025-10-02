const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/add', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    const { roomName, IncomingDate, parcel_img } = req.body;

    if (IncomingDate) {
        CleanIncomingDate = IncomingDate.replace('Z', '').split('.')[0].replace('T', ' ');
    }

    db.query(
        `SELECT available FROM room WHERE roomName = ?`,
        [roomName],
        function (error, results) {
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
            
            // available = 1 ให้เพิ่มพัสดุได้
            db.query(
                `INSERT INTO parcel (roomName, IncomingDate, parcel_img) VALUES (?, ?, ?)`,
                [roomName, CleanIncomingDate, parcel_img],
                function (error, result) {
                    if (error) {
                        return res.status(500).json({ error: 'ไม่สามารถเพิ่มพัสดุได้'});
                    }
                    res.status(201).json({ message: 'เพิ่มพัสดุสำเร็จ', id: result.insertId });
                }
            );
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