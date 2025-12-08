import pool from '../config/db.js';

const getActiveTaId = async () => {
    const res = await pool.query("SELECT ta_id FROM tahun_ajaran WHERE is_active = TRUE LIMIT 1");
    if (res.rows.length === 0) {
        throw new Error("Tidak ada Tahun Ajaran yang aktif ditemukan.");
    }
    return res.rows[0].ta_id;
};

export const getAllPlotting = async (req, res, next) => {
    try {
        const activeTaId = await getActiveTaId();

        const query = `
            SELECT 
                wk.wali_kelas_id AS id,
                k.kelas_id,
                k.nama_kelas,
                k.grade,
                wk.guru_id,
                g.nama_guru,
                ta.ta_id,
                ta.nama_ta
            FROM wali_kelas wk
            JOIN kelas k ON wk.kelas_id = k.kelas_id
            JOIN guru g ON wk.guru_id = g.guru_id
            JOIN tahun_ajaran ta ON wk.ta_id = ta.ta_id
            WHERE wk.ta_id = $1
            ORDER BY k.grade, k.nama_kelas ASC;
        `;
        const result = await pool.query(query, [activeTaId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getAllPlotting:", error);
        next(error);
    }
};
export const createPlotting = async (req, res, next) => {
    const { kelas_id, guru_id } = req.body;

    if (!kelas_id || !guru_id) {
        return res.status(400).json({ message: "Kelas dan Guru wajib dipilih." });
    }

    try {
        const activeTaId = await getActiveTaId();
        const checkQuery = "SELECT wali_kelas_id FROM wali_kelas WHERE kelas_id = $1 AND ta_id = $2";
        const checkRes = await pool.query(checkQuery, [kelas_id, activeTaId]);
        if (checkRes.rows.length > 0) {
            return res.status(400).json({ message: "Kelas ini sudah memiliki Wali Kelas untuk Tahun Ajaran aktif." });
        }

        const query = `
            INSERT INTO wali_kelas (kelas_id, guru_id, ta_id)
            VALUES ($1, $2, $3)
            RETURNING wali_kelas_id;
        `;
        const values = [kelas_id, guru_id, activeTaId];
        await pool.query(query, values);

        res.status(201).json({ message: "Wali Kelas berhasil ditugaskan." });

    } catch (error) {
        console.error("Database Error di createPlotting:", error);
        if (error.code === '23503') { 
             return res.status(400).json({ message: "Guru atau Kelas tidak valid." });
        }
        next(error);
    }
};
export const deletePlotting = async (req, res, next) => {
    const { id } = req.params;

    try {
        const query = "DELETE FROM wali_kelas WHERE wali_kelas_id = $1";
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Penugasan Wali Kelas tidak ditemukan." });
        }

        res.status(200).json({ message: "Tugas Wali Kelas berhasil dicabut." });

    } catch (error) {
        console.error("Database Error di deletePlotting:", error);
        next(error);
    }
};
export const getAvailableKelas = async (req, res, next) => {
    try {
        const activeTaId = await getActiveTaId();

        const query = `
            SELECT 
                k.kelas_id AS id, 
                k.nama_kelas AS nama 
            FROM kelas k
            LEFT JOIN wali_kelas wk ON k.kelas_id = wk.kelas_id AND wk.ta_id = $1
            WHERE wk.kelas_id IS NULL
            ORDER BY k.grade, k.nama_kelas ASC;
        `;
        const result = await pool.query(query, [activeTaId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getAvailableKelas:", error);
        next(error);
    }
};
export const getAvailableGuru = async (req, res, next) => {
    try {
        const activeTaId = await getActiveTaId();

        const query = `
            SELECT 
                g.guru_id AS id, 
                g.nama_guru AS nama 
            FROM guru g
            LEFT JOIN wali_kelas wk ON g.guru_id = wk.guru_id AND wk.ta_id = $1
            WHERE wk.guru_id IS NULL
            ORDER BY g.nama_guru ASC;
        `;
        const result = await pool.query(query, [activeTaId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getAvailableGuru:", error);
        next(error);
    }
};