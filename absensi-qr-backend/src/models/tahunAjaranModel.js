import pool from '../config/db.js';

export const getActiveTaId = async (client = pool) => {
    const res = await client.query("SELECT ta_id FROM tahun_ajaran WHERE is_active = TRUE LIMIT 1");
    if (res.rows.length === 0) {
        throw new Error("Tidak ada Tahun Ajaran yang aktif ditemukan.");
    }
    return res.rows[0].ta_id;
};
