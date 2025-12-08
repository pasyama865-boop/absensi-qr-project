import express from 'express';
import { recordScanIn } from '../controllers/absensiController.js';

const router = express.Router();

// Rute Absensi Masuk (Tidak perlu otentikasi JWT)
router.post('/scan-in', recordScanIn); 

export default router;