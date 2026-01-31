import pool from '../config/db.js';

export const createNotification = async (userId, title, body) => {
    const query = `
        INSERT INTO notifications (user_id, title, body, is_read, created_at)
        VALUES ($1, $2, $3, false, NOW())
        RETURNING notification_id, user_id, title, body, is_read, created_at;
    `;
    const res = await pool.query(query, [userId, title, body]);
    return res.rows[0];
};

export const getNotificationsByUser = async (userId, limit = 50) => {
    const query = `
        SELECT notification_id, user_id, title, body, is_read, created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2;
    `;
    const res = await pool.query(query, [userId, limit]);
    return res.rows;
};

export const markAsRead = async (notificationId) => {
    const query = `
        UPDATE notifications SET is_read = true WHERE notification_id = $1 RETURNING *;
    `;
    const res = await pool.query(query, [notificationId]);
    return res.rows[0];
};

export const createNotificationsForAllStudents = async (title, body) => {
    const query = `
        INSERT INTO notifications (user_id, title, body, is_read, created_at)
        SELECT user_id, $1, $2, false, NOW() FROM users WHERE role = 'siswa'
        RETURNING notification_id, user_id, title, body, is_read, created_at;
    `;
    const res = await pool.query(query, [title, body]);
    return res.rows;
};
