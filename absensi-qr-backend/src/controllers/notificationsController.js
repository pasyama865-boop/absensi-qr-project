import asyncHandler from 'express-async-handler';
import * as NotificationModel from '../models/notificationModel.js';

export const createNotification = asyncHandler(async (req, res) => {
    const { userId, title, body } = req.body;
    if (!userId || !title) {
        return res.status(400).json({ message: 'userId dan title diperlukan' });
    }

    const notification = await NotificationModel.createNotification(userId, title, body || '');
    res.status(201).json(notification);
});

export const getMyNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const notifications = await NotificationModel.getNotificationsByUser(userId);
    res.json(notifications);
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await NotificationModel.markAsRead(id);
    if (!updated) return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    res.json(updated);
});

export const broadcastNotifications = asyncHandler(async (req, res) => {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ message: 'Title diperlukan' });

    const created = await NotificationModel.createNotificationsForAllStudents(title, body || '');
    res.status(201).json({ createdCount: created.length, created });
});
