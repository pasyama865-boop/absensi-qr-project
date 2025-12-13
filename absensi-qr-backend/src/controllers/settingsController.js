import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const changePassword = async (req, res, next) => {
    const old_password = req.body.old_password || req.body.oldPassword;
    const new_password = req.body.new_password || req.body.newPassword;
    
    console.log("Debug req.user:", req.user);

    const userId = req.user?.id || req.user?.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Sesi tidak valid. ID User tidak ditemukan." });
    }

    if (!old_password || !new_password) {
        return res.status(400).json({ message: "Password lama dan baru wajib diisi." });
    }

    const client = await pool.connect();

    try {
        const userRes = await client.query('SELECT password_hash FROM users WHERE user_id = $1', [userId]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan di database." });
        }

        const currentHash = userRes.rows[0].password_hash;
        const isMatch = await bcrypt.compare(old_password, currentHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Password lama salah." });
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(new_password, salt);

        await client.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [newHash, userId]);

        res.status(200).json({ message: "Password berhasil diubah." });

    } catch (error) {
        console.error("Error changePassword:", error);
        next(error);
    } finally {
        client.release();
    }
};

export const updateProfile = async (req, res, next) => {
    const { username } = req.body;
    const userId = req.user?.id || req.user?.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Sesi tidak valid." });
    }

    if (!username) {
        return res.status(400).json({ message: "Username wajib diisi." });
    }

    const client = await pool.connect();

    try {
        const checkRes = await client.query(
            "SELECT user_id FROM users WHERE username = $1 AND user_id != $2", 
            [username, userId]
        );

        if (checkRes.rows.length > 0) {
            return res.status(400).json({ message: "Username sudah digunakan oleh pengguna lain." });
        }

        await client.query("UPDATE users SET username = $1 WHERE user_id = $2", [username, userId]);

        res.status(200).json({ message: "Profil (Username) berhasil diperbarui." });
    } catch (error) {
        console.error("Error updateProfile:", error);
        next(error);
    } finally {
        client.release();
    }
};

export const getSystemSettings = async (req, res, next) => {
    res.status(200).json({ 
        jam_masuk_mulai: "06:00",
        jam_masuk_akhir: "08:00",
        toleransi_terlambat: 15
    });
};

export const updateSystemSettings = async (req, res, next) => {
    const { jam_masuk_mulai, jam_masuk_akhir } = req.body;
        
    res.status(200).json({ 
        message: "Pengaturan sistem berhasil disimpan.",
        data: { jam_masuk_mulai, jam_masuk_akhir }
    });
};