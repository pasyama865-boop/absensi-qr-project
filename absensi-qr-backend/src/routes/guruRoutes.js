import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';

// PERBAIKAN: Memastikan import adalah named import yang sesuai
import { getGuruDashboardStats } from '../controllers/guruController.js'; 

const router = express.Router();

// Middleware: Semua rute di sini dilindungi dan hanya untuk role 'guru'
router.use(protect);
router.use(authorize(['guru']));

// Rute Dashboard Guru (GET /api/guru/dashboard)
router.get('/dashboard', getGuruDashboardStats); 

export default router;