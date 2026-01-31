import pool from '../config/db.js';

export const findAbsensiBySiswaAndDate = async (siswaId, date, client = pool) => {
    const query = `
        SELECT absensi_id, waktu_masuk
        FROM absensi
        WHERE siswa_id = $1 AND DATE(waktu_masuk) = $2;
    `;
    const res = await client.query(query, [siswaId, date]);
    return res.rows[0];
};

export const createAbsensi = async (siswaId, status, client = pool) => {
    const query = `
        INSERT INTO absensi (siswa_id, waktu_masuk, status_kehadiran)
        VALUES ($1, NOW(), $2)
        RETURNING waktu_masuk;
    `;
    const res = await client.query(query, [siswaId, status]);
    return res.rows[0];
};

export const getAttendanceLog = async (date) => {
    const query = `
        SELECT 
            a.absensi_id AS id,
            s.nisn,
            s.nama_siswa,
            k.nama_kelas,
            a.waktu_masuk,
            a.status_kehadiran,
            a.keterangan
        FROM absensi a
        JOIN siswa s ON a.siswa_id = s.siswa_id
        JOIN kelas k ON s.kelas_id = k.kelas_id
        WHERE DATE(a.waktu_masuk) = $1
        ORDER BY a.waktu_masuk DESC;
    `;
    const result = await pool.query(query, [date]);
    return result.rows;
};

export const getRecap = async (startDate, endDate, kelasId) => {
    let filterConditions = ['1=1'];
    const queryParams = [];
    let paramIndex = 1;

    if (startDate && endDate) {
        filterConditions.push(`DATE(a.waktu_masuk) BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
        queryParams.push(startDate, endDate);
        paramIndex += 2;
    }

    if (kelasId) {
        filterConditions.push(`k.kelas_id = $${paramIndex}`);
        queryParams.push(kelasId);
        paramIndex++;
    }

    const whereClause = filterConditions.length > 0 ? 'WHERE ' + filterConditions.join(' AND ') : '';

    const query = `
        SELECT 
            s.nisn,
            s.nama_siswa,
            k.nama_kelas,
            SUM(CASE WHEN a.status_kehadiran = 'Hadir' THEN 1 ELSE 0 END) AS total_hadir,
            SUM(CASE WHEN a.status_kehadiran IS NULL OR a.status_kehadiran != 'Hadir' THEN 1 ELSE 0 END) AS total_absen,
            COUNT(a.absensi_id) AS total_absensi_dicatat
        FROM siswa s
        JOIN kelas k ON s.kelas_id = k.kelas_id
        LEFT JOIN absensi a ON s.siswa_id = a.siswa_id
        ${whereClause}
        GROUP BY s.nisn, s.nama_siswa, k.nama_kelas
        ORDER BY k.nama_kelas, s.nama_siswa ASC;
    `;
    
    const result = await pool.query(query, queryParams);
    return result.rows;
};
