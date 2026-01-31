import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { recordScanIn, getRecap, getAnalytics, exportRecapCsv } from '../controllers/absensiController.js';

const router = express.Router();

// Lindungi rute ini, hanya guru yang bisa melakukan scan
router.post('/scan', protect, authorize(['guru', 'admin']), recordScanIn);

// Rekap absensi 
router.get('/recap', protect, authorize(['admin','guru']), getRecap);

// Analytics sederhana per tanggal
router.get('/analytics', protect, authorize(['admin','guru']), getAnalytics);

// Export CSV
router.get('/export', protect, authorize(['admin','guru']), exportRecapCsv);

export default router;
