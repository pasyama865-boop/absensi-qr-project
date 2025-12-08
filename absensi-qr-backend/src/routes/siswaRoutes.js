import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/my-qr', protect, authorize(['siswa']), (req, res) => {
    res.json({ message: "Siswa QR Code data" });
});


export default router;