import asyncHandler from 'express-async-handler'; // Menggunakan asyncHandler untuk penanganan error yang lebih baik
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; 

// Fungsi untuk melindungi rute (memverifikasi JWT dan menambahkan req.user)
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Cek token di header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari format 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Query Database untuk mendapatkan info user dan peran
            const result = await pool.query('SELECT user_id, username, role FROM users WHERE user_id = $1', [decoded.id]);
            
            if (result.rows.length === 0) {
                res.status(401);
                throw new Error('Otorisasi gagal, pengguna tidak ditemukan di database.');
            }

            // FIX KRITIS: Memetakan user_id dari database menjadi 'id' untuk req.user
            // Controller mengharapkan req.user.id
            req.user = {
                id: result.rows[0].user_id, // Menggunakan 'id'
                username: result.rows[0].username,
                role: result.rows[0].role
            };
            
            next();

        } catch (error) {
            // Error ini akan ditangkap oleh asyncHandler jika ada kegagalan pada jwt.verify
            console.error('Token tidak valid:', error.message);
            res.status(401);
            throw new Error('Otorisasi gagal, token tidak valid atau kadaluwarsa.');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Tidak ada token, otorisasi ditolak.');
    }
});

// Fungsi untuk membatasi akses berdasarkan peran (role)
export const authorize = (roles) => {
    return (req, res, next) => {
        // Cek apakah req.user (dari middleware protect) tersedia
        if (!req.user || !req.user.role) {
            res.status(401);
            throw new Error('Pengguna tidak terautentikasi.');
        }
        
        // Cek apakah peran pengguna termasuk dalam peran yang diizinkan
        if (roles.includes(req.user.role)) {
            next(); // Lanjut ke controller
        } else {
            res.status(403); // Forbidden
            throw new Error('Anda tidak memiliki izin untuk mengakses rute ini.');
        }
    };
};