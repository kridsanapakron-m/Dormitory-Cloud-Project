const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/add', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    const { roomName, IncomingDate, parcel_img } = req.body;
    try {
        const result = await db.run(
            `INSERT INTO parcel (roomName, IncomingDate, parcel_img) VALUES (?, ?, ?)`,
            [roomName, IncomingDate, parcel_img]
        );
        res.status(201).json({ message: 'เพิ่มพัสดุสำเร็จ', id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถเพิ่มพัสดุได้'});
    }
});

router.get('/all', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    try {
        const parcels = await db.all(`SELECT * FROM parcel`);
        res.status(200).json(parcels);
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถดึงพัสดุได้'});
    }
});

router.delete('/delete/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    const { id } = req.params;
    try {
        await db.run(`DELETE FROM parcel WHERE id = ?`, [id]);
        res.status(200).json({ message: 'ลบพัสดุสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถลบพัสดุได้'});
    }
});

router.put('/edit/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    const { id } = req.params;
    const { roomName, IncomingDate, parcel_img } = req.body;
    try {
        await db.run(
            `UPDATE parcel SET roomName = ?, IncomingDate = ?, parcel_img = ? WHERE id = ?`,
            [roomName, IncomingDate, parcel_img, id]
        );
        res.status(200).json({ message: 'อัปเดตพัสดุสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถอัปเดตพัสดุได้'});
    }
});

router.get('/room/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    try {

        const user = await db.get(`SELECT RoomID FROM users WHERE id = ?`, [userId]);
        if (!user || !user.RoomID) {
            return res.status(404).json({ message: 'ห้องไม่พบสำหรับ userId ที่กำหนด' });
        }

        const parcels = await db.all(`SELECT * FROM parcel WHERE roomName = ?`, [user.RoomID]);
        res.status(200).json(parcels);
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถดึงพัสดุโดย userId ได้', details: error.message });
    }
});

//ดึงข้อมูลชื่อผู้ใช้งานที่มีห้อง เพื่อแสดงในหน้าพัสดุ
router.get('/users', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    try {
        const users = await db.all(`SELECT firstname, roomName FROM users`);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้'});
    }
});

module.exports = router;