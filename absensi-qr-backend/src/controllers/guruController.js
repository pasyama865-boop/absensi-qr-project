import pool from '../config/db.js';
import bcrypt from 'bcryptjs';


export const getAllGuru = async (req, res, next) => {
    try {
        const query = `
            SELECT 
            g.guru_id AS id, g.nip, g.nama_guru, g.no_telp, u.username
            FROM guru g
            JOIN users u ON g.guru_id = u.user_id
            ORDER BY g.nama_guru ASC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getAllGuru:", error.message);
        next(error);
    }
};

export const createGuru = async (req, res, next) => {
    const { nip, nama, no_telp, username, password } = req.body;

    if (!nip || !nama || !username || !password) {
        return res.status(400).json({ message: "NIP, Nama, Username, dan Password wajib diisi." });
    }

    const client = await pool.connect(); 

    try {
        await client.query('BEGIN');
        const checkDupl = await client.query(
            'SELECT user_id FROM users WHERE username = $1 UNION SELECT guru_id FROM guru WHERE nip = $2', 
            [username, nip]
        );
        if (checkDupl.rows.length > 0) {
            throw new Error("Username atau NIP sudah terdaftar.");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userQuery = `
            INSERT INTO users (username, password_hash, role)
            VALUES ($1, $2, 'guru')
            RETURNING user_id;
        `;
        const userRes = await client.query(userQuery, [username, hashedPassword]);
        const newUserId = userRes.rows[0].user_id;
        const guruQuery = `
            INSERT INTO guru (guru_id, nip, nama_guru, no_telp)
            VALUES ($1, $2, $3, $4)
            RETURNING guru_id, nama_guru;
        `;
        await client.query(guruQuery, [newUserId, nip, nama, no_telp || null]);
        await client.query('COMMIT');

        res.status(201).json({
            message: "Data Guru dan Akun berhasil dibuat.",
            data: { id: newUserId, nama, nip }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        if (error.message.includes("terdaftar")) {
            return res.status(400).json({ message: error.message });
        }
        console.error("Database Error di createGuru:", error.message);
        next(error);
    } finally {
        client.release();
    }
};

export const updateGuru = async (req, res, next) => {
    const { id } = req.params;
    const { nip, nama, no_telp, username, password } = req.body; 

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const guruQuery = `
            UPDATE guru 
            SET nip = $1, nama_guru = $2, no_telp = $3
            WHERE guru_id = $4
        `;
        await client.query(guruQuery, [nip, nama, no_telp || null, id]);

        if (username || password) {
            let updateFields = [];
            let values = [];
            let idx = 1;

            if (username) {
                const checkUser = await client.query("SELECT user_id FROM users WHERE username = $1 AND user_id != $2", [username, id]);
                if (checkUser.rows.length > 0) {
                    throw new Error("Username sudah digunakan.");
                }
                updateFields.push(`username = $${idx++}`);
                values.push(username);
            }
            
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updateFields.push(`password_hash = $${idx++}`);
                values.push(hashedPassword);
            }

            if (updateFields.length > 0) {
                values.push(id); 
                const userQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = $${idx}`;
                await client.query(userQuery, values);
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: "Data guru dan akun login berhasil diperbarui." });

    } catch (error) {
        await client.query('ROLLBACK');
        if (error.message.includes("Username sudah digunakan.")) {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === '23505') {
            return res.status(400).json({ message: "NIP sudah digunakan guru lain." });
        }
        console.error("Database Error di updateGuru:", error.message);
        next(error);
    } finally {
        client.release();
    }
};

export const deleteGuru = async (req, res, next) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM users WHERE user_id = $1';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Guru tidak ditemukan." });
        }

        res.status(200).json({ message: "Data guru dan akun berhasil dihapus." });

    } catch (error) {
        console.error("Database Error di deleteGuru:", error.message);
        if (error.code === '23503') {
            return res.status(409).json({ message: "Tidak bisa menghapus: Guru ini masih aktif sebagai Wali Kelas." });
        }
        next(error);
    }
};


export const getGuruDashboardStats = async (req, res, next) => {
    const userId = req.user?.id; 

    if (!userId) {
        return res.status(401).json({ message: "ID Guru tidak ditemukan. Sesi tidak valid." });
    }
    
    try {
        const client = await pool.connect();
        try {
            const guruRes = await client.query(`
                SELECT guru_id, nama_guru, nip 
                FROM guru 
                WHERE guru_id = $1
            `, [userId]);

            if (guruRes.rows.length === 0) {
                return res.status(404).json({ message: "Data profil guru tidak ditemukan. Silakan hubungi Admin untuk sinkronisasi data profil." });
            }
            const guru = guruRes.rows[0];

            const taRes = await client.query("SELECT ta_id, is_active FROM tahun_ajaran WHERE is_active = TRUE LIMIT 1");
            
            let waliKelasInfo = null;

            if (taRes.rows.length > 0) {
                const taId = taRes.rows[0].ta_id;

                const waliRes = await client.query(`
                    SELECT wk.kelas_id, k.nama_kelas, k.grade
                    FROM wali_kelas wk
                    JOIN kelas k ON wk.kelas_id = k.kelas_id
                    WHERE wk.guru_id = $1 AND wk.ta_id = $2
                `, [userId, taId]);

                if (waliRes.rows.length > 0) {
                    const kelasInfo = waliRes.rows[0];
                    const kelasId = kelasInfo.kelas_id;
                    const siswaCount = await client.query("SELECT COUNT(*) FROM siswa WHERE kelas_id = $1", [kelasId]);
                    const absensiRes = await client.query(`
                        SELECT status_kehadiran, COUNT(*)
                        FROM absensi a
                        JOIN siswa s ON a.siswa_id = s.siswa_id
                        WHERE s.kelas_id = $1 
                          AND a.waktu_masuk::date = CURRENT_DATE 
                        GROUP BY status_kehadiran
                    `, [kelasId]); 
                    
                    const stats = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0, Terlambat: 0 };
                    absensiRes.rows.forEach(row => {
                        if (stats[row.status_kehadiran] !== undefined) {
                            stats[row.status_kehadiran] = parseInt(row.count);
                        }
                    });

                    waliKelasInfo = {
                        nama_kelas: kelasInfo.nama_kelas,
                        total_siswa: parseInt(siswaCount.rows[0].count),
                        kehadiran_hari_ini: stats
                    };
                }
            }

            res.json({
                guru: guru,
                is_wali_kelas: !!waliKelasInfo,
                kelas_info: waliKelasInfo
            });

        } catch(error) {
             console.error("[FATAL SQL ERROR]: Gagal memproses data dashboard guru:", error.message);
             res.status(500).json({ 
                message: "Internal Server Error: Gagal memproses data dashboard guru.", 
                detail: error.message 
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Koneksi DB Error:", error);
        next(error);
    }
};