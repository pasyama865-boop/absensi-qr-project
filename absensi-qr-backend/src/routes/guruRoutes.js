import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';

import { getGuruDashboardStats } from '../controllers/guruController.js'; 

const router = express.Router();

router.use(protect);
router.use(authorize(['guru']));

router.get('/dashboard', getGuruDashboardStats); 

export default router;