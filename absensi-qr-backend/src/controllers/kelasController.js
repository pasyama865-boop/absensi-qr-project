import pool from '../config/db.js';

// --- HELPER UNTUK MENDAPATKAN TA_ID AKTIF ---
const getActiveTaId = async () => {
    let client;
    try {
        client = await pool.connect();
        // Ambil TA_ID yang aktif
        const res = await client.query("SELECT ta_id FROM tahun_ajaran WHERE is_active = TRUE LIMIT 1");
        if (res.rows.length === 0) {
            // MELEMPAR ERROR JELAS
            throw new Error("Tidak ada Tahun Ajaran yang aktif ditemukan. Harap atur Tahun Ajaran aktif.");
        }
        return res.rows[0].ta_id;
    } catch (error) {
        // Jika ada error database di sini (misalnya tabel tahun_ajaran hilang), throw
        throw error;
    } finally {
        // PENTING: Pastikan koneksi dilepas
        if (client) client.release();
    }
};

// @desc    Mendapatkan semua data Kelas beserta Wali Kelas (READ)
// @route   GET /api/admin/kelas
export const getAllKelas = async (req, res, next) => {
    try {
        // PERBAIKAN: Join Wali Kelas hanya untuk TA aktif
        const query = `
            SELECT 
                k.kelas_id AS id,
                k.nama_kelas AS nama,
                k.grade,
                wk.wali_kelas_id,
                g.nama_guru AS wali_kelas_name,
                wk.guru_id AS current_wali_id 
            FROM kelas k
            LEFT JOIN wali_kelas wk 
                ON k.kelas_id = wk.kelas_id 
                AND wk.ta_id = (SELECT ta_id FROM tahun_ajaran WHERE is_active = TRUE LIMIT 1) 
            LEFT JOIN guru g ON wk.guru_id = g.guru_id
            ORDER BY k.grade, k.nama_kelas ASC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getAllKelas:", error);
        next(error);
    }
};

// @desc    Menambah Kelas Baru (CREATE)
// @route   POST /api/admin/kelas
export const createKelas = async (req, res, next) => {
    const { nama_kelas, grade } = req.body;
    if (!nama_kelas || !grade) {
        return res.status(400).json({ message: "Nama kelas dan Grade wajib diisi." });
    }

    try {
        const query = `
            INSERT INTO kelas (nama_kelas, grade)
            VALUES ($1, $2)
            RETURNING kelas_id, nama_kelas;
        `;
        const result = await pool.query(query, [nama_kelas, grade]);
        res.status(201).json({ 
            message: "Kelas berhasil ditambahkan.", 
            data: result.rows[0] 
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "Nama kelas sudah ada." });
        }
        console.error("Database Error di createKelas:", error);
        next(error);
    }
};

// @desc    Update Data Kelas (UPDATE)
// @route   PUT /api/admin/kelas/:id
export const updateKelas = async (req, res, next) => {
    const { id } = req.params;
    const { nama_kelas, grade } = req.body;
    
    try {
        const query = `
            UPDATE kelas 
            SET nama_kelas = $1, grade = $2
            WHERE kelas_id = $3
            RETURNING kelas_id, nama_kelas;
        `;
        const result = await pool.query(query, [nama_kelas, grade, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Kelas tidak ditemukan." });
        }

        res.status(200).json({
            message: "Data kelas berhasil diperbarui.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Database Error di updateKelas:", error);
        if (error.code === '23505') {
            return res.status(400).json({ message: "Nama kelas sudah digunakan." });
        }
        next(error);
    }
};

// @desc    Hapus Data Kelas (DELETE)
// @route   DELETE /api/admin/kelas/:id
export const deleteKelas = async (req, res, next) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM kelas WHERE kelas_id = $1';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Kelas tidak ditemukan." });
        }

        res.status(200).json({ message: "Kelas berhasil dihapus." });

    } catch (error) {
        console.error("Database Error di deleteKelas:", error);
        if (error.code === '23503') { 
            return res.status(409).json({ message: "Tidak bisa dihapus: Kelas ini masih memiliki siswa atau penugasan Wali Kelas yang aktif." });
        }
        next(error);
    }
};

// @desc    Menugaskan Wali Kelas ke Kelas tertentu (PLOT)
// @route   POST /api/admin/kelas/assign-wali
export const assignWaliKelas = async (req, res, next) => {
    const { kelas_id, guru_id } = req.body;
    
    if (!kelas_id || !guru_id) {
        return res.status(400).json({ message: "Kelas dan Guru harus dipilih." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        // 1. Ambil Tahun Ajaran Aktif (Critical point)
        const activeTaId = await getActiveTaId(); 

        // 2. Cek apakah penugasan sudah ada untuk kelas dan TA aktif ini
        const checkQuery = `
            SELECT wali_kelas_id 
            FROM wali_kelas 
            WHERE kelas_id = $1 AND ta_id = $2;
        `;
        const existingWali = await client.query(checkQuery, [kelas_id, activeTaId]);

        let message;
        
        if (existingWali.rows.length > 0) {
            // 3a. UPDATE (Ganti Wali Kelas)
            const updateQuery = `
                UPDATE wali_kelas 
                SET guru_id = $1, updated_at = NOW()
                WHERE wali_kelas_id = $2;
            `;
            await client.query(updateQuery, [guru_id, existingWali.rows[0].wali_kelas_id]);
            message = "Wali Kelas berhasil diganti.";
        } else {
            // 3b. INSERT
            const insertQuery = `
                INSERT INTO wali_kelas (guru_id, kelas_id, ta_id)
                VALUES ($1, $2, $3);
            `;
            await client.query(insertQuery, [guru_id, kelas_id, activeTaId]);
            message = "Wali Kelas berhasil ditugaskan.";
        }

        await client.query('COMMIT');
        res.status(200).json({ message });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Database Error di assignWaliKelas:", error);
        
        // CATCH KHUSUS UNTUK ERROR DARI HELPER TA
        if (error.message.includes("Tahun Ajaran")) {
            return res.status(400).json({ message: error.message });
        }
        
        // CATCH UNTUK FOREIGN KEY (Guru, Kelas, atau TA ID yang dikirim tidak valid)
        if (error.code === '23503') { 
             return res.status(400).json({ message: "Gagal: Data Guru atau Kelas tidak ditemukan di database (Foreign Key Error)." });
        }

        // Error generic lain, tampilkan pesan standar
        res.status(500).json({ message: "Server error. Mohon periksa log backend." });
        next(error);
    } finally {
        client.release();
    }
};

// @desc    Mendapatkan daftar Guru yang bisa menjadi Wali Kelas (READ)
// @route   GET /api/admin/wali-kelas-list
export const getWaliKelasList = async (req, res, next) => { 
    try {
        const simpleQuery = `
            SELECT 
                g.guru_id AS id,
                g.nama_guru AS nama,
                g.nip
            FROM guru g
            ORDER BY g.nama_guru ASC;
        `;
        const result = await pool.query(simpleQuery);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getWaliKelasList:", error);
        next(error);
    }
};