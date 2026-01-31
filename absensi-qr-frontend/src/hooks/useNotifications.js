import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/notifications`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Gagal mengambil notifikasi', err);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    const markAsRead = async (id) => {
        if (!user?.token) return null;
        try {
            await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNotifications(prev => prev.map(n => n.notification_id == id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Gagal menandai notifikasi', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return { notifications, loading, fetchNotifications, markAsRead, unreadCount };
};

export default useNotifications;
