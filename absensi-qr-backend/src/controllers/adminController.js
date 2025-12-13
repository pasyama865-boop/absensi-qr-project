import pool from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        const client = await pool.connect();
        try {
            const siswaRes = await client.query('SELECT COUNT(*) FROM siswa');
            const guruRes = await client.query('SELECT COUNT(*) FROM guru');
            const kelasRes = await client.query('SELECT COUNT(*) FROM kelas');
            const petugasRes = await client.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");

            const today = new Date().toISOString().slice(0, 10);
            
            const absensiRes = await client.query(`
                SELECT status_kehadiran, COUNT(*) 
                FROM absensi 
                WHERE DATE(waktu_masuk) = $1
                GROUP BY status_kehadiran
            `, [today]);

            const getCount = (status) => {
                const row = absensiRes.rows.find(r => r.status_kehadiran === status);
                return row ? parseInt(row.count) : 0;
            };

            const hadirSiswa = getCount('Hadir') + getCount('Terlambat'); 
            const sakitSiswa = getCount('Sakit');
            const izinSiswa = getCount('Izin');
            const alphaSiswa = getCount('Alpha');

            const tanggalHariIni = new Date().toLocaleDateString('id-ID', { 
                day: 'numeric', month: 'long', year: 'numeric' 
            });

            res.status(200).json({
                totalSiswa: parseInt(siswaRes.rows[0].count),
                totalGuru: parseInt(guruRes.rows[0].count),
                totalKelas: parseInt(kelasRes.rows[0].count),
                totalPetugas: parseInt(petugasRes.rows[0].count),
                
                // Data Absensi Siswa Hari Ini
                hadirSiswa,
                sakitSiswa,
                izinSiswa,
                alphaSiswa,

                // Data Absensi Guru Hari Ini
                hadirGuru: 0, 
                sakitGuru: 0, 
                izinGuru: 0, 
                alphaGuru: 0,

                tanggalHariIni
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Database Error di getDashboardStats:", error);
        res.status(500).json({ message: "Gagal memuat statistik dashboard." });
    }
};

export const getMonthlyAttendanceTrend = async (req, res, next) => {
    try {
        const client = await pool.connect();
        try {
            const totalSiswaRes = await client.query('SELECT COUNT(*) FROM siswa');
            const totalSiswa = parseInt(totalSiswaRes.rows[0].count) || 1;
            const query = `
                WITH last_7_days AS (
                    SELECT generate_series(
                        CURRENT_DATE - INTERVAL '6 days',
                        CURRENT_DATE,
                        '1 day'::interval
                    )::date AS date
                )
                SELECT 
                    TO_CHAR(d.date, 'DD Mon') as display_date,
                    d.date as full_date,
                    COUNT(a.absensi_id) as jumlah_hadir
                FROM last_7_days d
                LEFT JOIN absensi a ON DATE(a.waktu_masuk) = d.date 
                    AND (a.status_kehadiran = 'Hadir' OR a.status_kehadiran = 'Terlambat')
                GROUP BY d.date
                ORDER BY d.date ASC;
            `;

            const trendRes = await client.query(query);
            const trendData = trendRes.rows.map(row => ({
                date: row.display_date, 
                persentaseHadir: (parseInt(row.jumlah_hadir) / totalSiswa).toFixed(2), 
                jumlahHadir: parseInt(row.jumlah_hadir)
            }));

            res.status(200).json(trendData);

        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Database Error di getMonthlyAttendanceTrend:", error);
        res.status(500).json({ message: "Gagal memuat tren kehadiran." });
    }
};