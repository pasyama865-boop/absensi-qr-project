import pool from '../config/db.js';

export const findSiswaByNisnAndTa = async (nisn, taId, client = pool) => {
    const query = `
        SELECT s.siswa_id, s.nama_siswa, k.nama_kelas, s.ta_id
        FROM siswa s
        JOIN kelas k ON s.kelas_id = k.kelas_id
        WHERE s.nisn = $1 AND s.ta_id = $2;
    `;
    const res = await client.query(query, [nisn, taId]);
    return res.rows[0];
};
