import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { recordScanIn } from '../controllers/absensiController.js';

const router = express.Router();

// Lindungi rute ini, hanya guru yang bisa melakukan scan
router.post('/scan', protect, authorize(['guru', 'admin']), recordScanIn);

export default router;
