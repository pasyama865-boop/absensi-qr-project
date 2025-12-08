import axios from 'axios';
import { useAuth } from './useAuth'; 

const API_URL = `${import.meta.env.VITE_API_URL}/guru/absensi`;

export const useAbsensi = () => {
    const { user } = useAuth();
    const recordAttendance = async (qrContent) => {
        if (!user?.token) {
            throw new Error('User not authenticated.');
        }

        const token = user.token;
        
        try {
            const response = await axios.post(`${API_URL}/scan`, 
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
    
    return { recordAttendance };
};