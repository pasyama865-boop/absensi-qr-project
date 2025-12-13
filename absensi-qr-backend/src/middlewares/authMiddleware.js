import asyncHandler from 'express-async-handler'; 
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; 

export const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const result = await pool.query('SELECT user_id, username, role FROM users WHERE user_id = $1', [decoded.id]);
            
            if (result.rows.length === 0) {
                res.status(401);
                throw new Error('Otorisasi gagal, pengguna tidak ditemukan di database.');
            }
            req.user = {
                id: result.rows[0].user_id, 
                username: result.rows[0].username,
                role: result.rows[0].role
            };
            
            next();

        } catch (error) {
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

export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(401);
            throw new Error('Pengguna tidak terautentikasi.');
        }
        
        if (roles.includes(req.user.role)) {
            next(); 
        } else {
            res.status(403); 
            throw new Error('Anda tidak memiliki izin untuk mengakses rute ini.');
        }
    };
};