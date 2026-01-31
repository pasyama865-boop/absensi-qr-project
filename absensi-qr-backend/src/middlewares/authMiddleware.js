import asyncHandler from 'express-async-handler'; 
import jwt from 'jsonwebtoken';
import * as UserModel from '../models/userModel.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await UserModel.findUserById(decoded.id);
            
            if (!user) {
                res.status(401);
                throw new Error('Otorisasi gagal, pengguna tidak ditemukan di database.');
            }
            req.user = {
                id: user.user_id, 
                username: user.username,
                role: user.role
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
