import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const getActiveTaId = async (client) => {
    const queryExecutor = client || pool;
    const res = await queryExecutor.query("SELECT ta_id FROM tahun_ajaran WHERE is_active = TRUE LIMIT 1");
    if (res.rows.length === 0) throw new Error("Tahun Ajaran aktif tidak ditemukan. Harap aktifkan Tahun Ajaran di menu pengaturan.");
    return res.rows[0].ta_id;
};

export const getAllSiswa = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                s.siswa_id AS id,
                s.nisn,
                s.nama_siswa,
                s.qr_data_url,
                s.kelas_id,
                k.nama_kelas,
                k.grade
            FROM siswa s
            LEFT JOIN kelas k ON s.kelas_id = k.kelas_id
            ORDER BY k.grade ASC, k.nama_kelas ASC, s.nama_siswa ASC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error getAllSiswa:", error);
        next(error);
    }
};

export const getSiswaByKelasId = async (req, res, next) => {
    const { id } = req.params;
    try {
        const query = `SELECT siswa_id AS id, nisn, nama_siswa FROM siswa WHERE kelas_id = $1 ORDER BY nama_siswa ASC`;
        const result = await pool.query(query, [id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error getSiswaByKelasId:", error);
        next(error);
    }
};

export const createSiswa = async (req, res, next) => {
    const { nisn, nama_siswa, kelas_id } = req.body;

    if (!nisn || !nama_siswa || !kelas_id) {
        return res.status(400).json({ message: "NISN, Nama, dan Kelas wajib diisi." });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const ta_id = await getActiveTaId(client);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nisn, salt);
        const userCheck = await client.query("SELECT user_id FROM users WHERE username = $1", [nisn]);
        if (userCheck.rows.length > 0) {
            throw new Error("NISN sudah terdaftar sebagai User.");
        }

        const userQuery = `
            INSERT INTO users (username, password_hash, role)
            VALUES ($1, $2, 'siswa')
            RETURNING user_id;
        `;
        const userRes = await client.query(userQuery, [nisn, hashedPassword]);
        const newUserId = userRes.rows[0].user_id;
        const siswaQuery = `
            INSERT INTO siswa (siswa_id, nisn, nama_siswa, kelas_id, ta_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING siswa_id, nama_siswa;
        `;
        await client.query(siswaQuery, [newUserId, nisn, nama_siswa, kelas_id, ta_id]);
        await client.query('COMMIT');
        res.status(201).json({ message: "Siswa dan Akun Login berhasil ditambahkan." });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error createSiswa:", error);

        if (error.message.includes("NISN sudah terdaftar")) {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === '23505') {
            return res.status(400).json({ message: "NISN sudah digunakan." });
        }
        if (error.message.includes("Tahun Ajaran")) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    } finally {
        client.release();
    }
};
export const updateSiswa = async (req, res, next) => {
    const { id } = req.params;
    const { nisn, nama_siswa, kelas_id } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = `
            UPDATE siswa 
            SET nisn = $1, nama_siswa = $2, kelas_id = $3
            WHERE siswa_id = $4
        `;
        const result = await client.query(query, [nisn, nama_siswa, kelas_id, id]);
        
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Siswa tidak ditemukan." });
        }
        await client.query("UPDATE users SET username = $1 WHERE user_id = $2", [nisn, id]);
        await client.query('COMMIT');
        res.status(200).json({ message: "Data siswa berhasil diperbarui." });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updateSiswa:", error);
        if (error.code === '23505') return res.status(400).json({ message: "NISN sudah digunakan siswa lain." });
        next(error);
    } finally {
        client.release();
    }
};
export const deleteSiswa = async (req, res, next) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM absensi WHERE siswa_id = $1', [id]);
        const result = await client.query('DELETE FROM users WHERE user_id = $1', [id]);

        if (result.rowCount === 0) {
            const resSiswa = await client.query('DELETE FROM siswa WHERE siswa_id = $1', [id]);
            if (resSiswa.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: "Siswa tidak ditemukan." });
            }
        }

        await client.query('COMMIT'); 
        res.status(200).json({ message: "Siswa dan data terkait berhasil dihapus." });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error("Error deleteSiswa:", error);
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: "Gagal menghapus: Siswa ini masih memiliki data terkait yang tidak bisa dihapus otomatis." 
            });
        }
        next(error);
    } finally {
        client.release();
    }
};