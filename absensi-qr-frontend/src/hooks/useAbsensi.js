import axios from 'axios';
import { useAuth } from './useAuth'; 

const API_URL = `${import.meta.env.VITE_API_URL || ''}`;

export const useAbsensi = () => {
    const { user } = useAuth();
    const recordAttendance = async (qrContent) => {
        if (!user?.token) {
            throw new Error('User not authenticated.');
        }

        const token = user.token;
        
        try {
            const response = await axios.post(`${API_URL}/absensi/scan`, 
                { qr_content: qrContent }, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
            
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Gagal terhubung ke server absensi.');
        }
    };

    const getRecap = async ({ startDate, endDate, kelasId } = {}) => {
        if (!user?.token) throw new Error('User not authenticated.');
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (kelasId) params.kelasId = kelasId;
        const res = await axios.get(`${API_URL}/absensi/recap`, {
            headers: { Authorization: `Bearer ${user.token}` },
            params
        });
        return res.data;
    };

    const getAnalytics = async ({ startDate, endDate, kelasId } = {}) => {
        if (!user?.token) throw new Error('User not authenticated.');
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (kelasId) params.kelasId = kelasId;
        const res = await axios.get(`${API_URL}/absensi/analytics`, {
            headers: { Authorization: `Bearer ${user.token}` },
            params
        });
        return res.data;
    };

    return { recordAttendance, getRecap, getAnalytics };
};