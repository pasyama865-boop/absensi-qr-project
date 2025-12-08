import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const userResult = await pool.query('SELECT user_id, username, password_hash, role FROM users WHERE username = $1', [username]);

        const user = userResult.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const token = generateToken(user.user_id, user.role);
            const { password_hash, ...userData } = user;

            res.status(200).json({
                ...userData,
                token: token,
                message: 'Login successful',
            });
        } else {
            res.status(401).json({ message: 'Username atau Password salah' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getMe = (req, res) => {
    res.status(200).json(req.user);
};