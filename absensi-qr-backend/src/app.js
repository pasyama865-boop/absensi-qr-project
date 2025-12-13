import './config/db.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guruRoutes from './routes/guruRoutes.js';
import siswaRoutes from './routes/siswaRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const corsOptions = {
    origin: [
        'http://localhost:5173',  
        'http://127.0.0.1:5173',   
        'http://localhost:5174',   
        'http://127.0.0.1:5174',   
        ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []) 
    ],
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
};

app.use(cors(corsOptions));
app.get('/', (req, res) => {
    res.json({ message: 'Absensi QR Code API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/siswa', siswaRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        success: false
    });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));