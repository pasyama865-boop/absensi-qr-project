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

// Middleware Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- KONFIGURASI CORS (DIPERBAIKI) ---
// Menggunakan array string jauh lebih stabil daripada callback function.
// Kode ini mengizinkan port 5173 DAN 5174 untuk menghindari error saat port default sibuk.
const corsOptions = {
    origin: [
        'http://localhost:5173',   // Vite Default
        'http://127.0.0.1:5173',   // Vite IP
        'http://localhost:5174',   // Vite (jika port 5173 sibuk)
        'http://127.0.0.1:5174',   // Vite IP (port 5174)
        // Tambahkan URL dari .env jika ada
        ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []) 
    ],
    credentials: true, // Izinkan cookie/token session
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Izinkan method standard
    allowedHeaders: ['Content-Type', 'Authorization'] // Izinkan header auth
};

app.use(cors(corsOptions));
// ----------------------------------------

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Absensi QR Code API is running' });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/siswa', siswaRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        success: false
    });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));