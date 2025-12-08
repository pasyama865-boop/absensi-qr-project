import pool from '../config/db.js';

const getActiveTaId = async (client) => {
    const res = await client.query("SELECT ta_id FROM tahun_ajaran WHERE is_active = TRUE LIMIT 1");
    if (res.rows.length === 0) {
        throw new Error("Tidak ada Tahun Ajaran yang aktif ditemukan.");
    }
    return res.rows[0].ta_id;
};


export const recordScanIn = async (req, res, next) => {
    const { qr_uuid } = req.body; 

    if (!qr_uuid) {
        return res.status(400).json({ message: "Kode QR tidak valid atau hilang." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const activeTaId = await getActiveTaId(client);

        const checkSiswaQuery = `
            SELECT s.siswa_id, s.nama_siswa, k.nama_kelas, s.ta_id
            FROM siswa s
            JOIN kelas k ON s.kelas_id = k.kelas_id
            WHERE s.siswa_id = $1 AND s.ta_id = $2;
        `;
        const siswaRes = await client.query(checkSiswaQuery, [qr_uuid, activeTaId]);

        if (siswaRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Siswa tidak terdaftar di Tahun Ajaran aktif." });
        }
        
        const siswa = siswaRes.rows[0];
        const today = new Date().toISOString().slice(0, 10); 

        const checkAbsensiQuery = `
            SELECT absensi_id, waktu_masuk
            FROM absensi
            WHERE siswa_id = $1 AND DATE(waktu_masuk) = $2;
        `;
        const existingAbsensi = await client.query(checkAbsensiQuery, [siswa.siswa_id, today]);

        if (existingAbsensi.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ 
                message: `Anda sudah absen masuk hari ini pada pukul ${new Date(existingAbsensi.rows[0].waktu_masuk).toLocaleTimeString('id-ID')}.`,
                siswa: siswa.nama_siswa,
                kelas: siswa.nama_kelas,
                status: 'already_scanned'
            });
        }

        const insertQuery = `
            INSERT INTO absensi (siswa_id, waktu_masuk, status_kehadiran)
            VALUES ($1, NOW(), 'Hadir')
            RETURNING waktu_masuk;
        `;
        const insertRes = await client.query(insertQuery, [siswa.siswa_id]);

        await client.query('COMMIT');

        res.status(201).json({
            message: `Absensi sukses! Selamat datang, ${siswa.nama_siswa}.`,
            siswa: siswa.nama_siswa,
            kelas: siswa.nama_kelas,
            waktu: new Date(insertRes.rows[0].waktu_masuk).toLocaleTimeString('id-ID'),
            status: 'success'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error saat mencatat absensi:", error);
        next(error);
    } finally {
        client.release();
    }
};

export const getAttendanceLog = async (req, res, next) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        
        const query = `
            SELECT 
                a.absensi_id AS id,
                s.nisn,
                s.nama_siswa,
                k.nama_kelas,
                a.waktu_masuk, -- PASTIKAN INI SAMA DENGAN DATABASE
                a.status_kehadiran,
                a.keterangan
            FROM absensi a
            JOIN siswa s ON a.siswa_id = s.siswa_id
            JOIN kelas k ON s.kelas_id = k.kelas_id
            WHERE DATE(a.waktu_masuk) = $1
            ORDER BY a.waktu_masuk DESC;
        `;
        const result = await pool.query(query, [today]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getAttendanceLog:", error);
        next(error);
    }
};


export const getRecap = async (req, res, next) => {
    try {
        const { startDate, endDate, kelasId } = req.query; 
        
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
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getRecap:", error);
        next(error);
    }
};