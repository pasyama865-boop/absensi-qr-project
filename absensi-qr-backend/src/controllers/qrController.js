import pool from '../config/db.js';
import QRCode from 'qrcode'; 


export const getSiswaForQR = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                s.siswa_id AS id,
                s.nisn,
                s.nama_siswa,
                k.nama_kelas,
                (s.qr_data_url IS NOT NULL) AS has_qr,
                s.qr_data_url
            FROM siswa s
            JOIN kelas k ON s.kelas_id = k.kelas_id
            ORDER BY k.grade, k.nama_kelas, s.nama_siswa ASC;
        `;
        
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error di getSiswaForQR:", error);
        next(error);
    }
};

export const generateQRCode = async (req, res, next) => {
    const { siswaId } = req.params;

    try {
        const siswaQuery = `SELECT nisn FROM siswa WHERE siswa_id = $1;`;
        const siswaResult = await pool.query(siswaQuery, [siswaId]);

        if (siswaResult.rowCount === 0) {
            return res.status(404).json({ message: "Siswa tidak ditemukan." });
        }
        const qrText = siswaResult.rows[0].nisn || siswaId; 
        const qrDataUrl = await QRCode.toDataURL(qrText, { 
            errorCorrectionLevel: 'H', 
            type: 'image/png',
            margin: 1,
            scale: 8
        });
        const updateQuery = `
            UPDATE siswa
            SET qr_data_url = $1
            WHERE siswa_id = $2
            RETURNING siswa_id, nisn, qr_data_url;
        `;
        
        const result = await pool.query(updateQuery, [qrDataUrl, siswaId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Gagal update QR: Siswa tidak ditemukan." });
        }

        res.status(200).json({
            message: "QR Code berhasil dibuat dan disimpan.",
            qr_data: result.rows[0]
        });

    } catch (error) {
        console.error("Error saat generate QR:", error);
        next(error); 
    }
};