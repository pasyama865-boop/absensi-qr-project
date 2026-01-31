import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { createNotification, getMyNotifications, markNotificationAsRead, broadcastNotifications } from '../controllers/notificationsController.js';

const router = express.Router();

// Guru & Admin dapat membuat notifikasi untuk user
router.post('/', protect, authorize(['admin','guru']), createNotification);

// User mendapatkan notifikasi sendiri
router.get('/', protect, getMyNotifications);

router.put('/:id/read', protect, markNotificationAsRead);

// Broadcast ke semua siswa
router.post('/broadcast', protect, authorize(['admin','guru']), broadcastNotifications);

export default router;
