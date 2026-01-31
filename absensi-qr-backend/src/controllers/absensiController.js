import pool from '../config/db.js';
import * as TahunAjaranModel from '../models/tahunAjaranModel.js';
import * as SiswaModel from '../models/siswaModel.js';
import * as AbsensiModel from '../models/absensiModel.js';
import { jsonToCsv } from '../utils/exportCsv.js';

export const recordScanIn = async (req, res, next) => {
    const { nisn } = req.body; 

    if (!nisn) {
        return res.status(400).json({ message: "NISN tidak valid atau hilang." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const activeTaId = await TahunAjaranModel.getActiveTaId(client);

        const siswa = await SiswaModel.findSiswaByNisnAndTa(nisn, activeTaId, client);

        if (!siswa) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Siswa tidak terdaftar di Tahun Ajaran aktif." });
        }
        
        const today = new Date().toISOString().slice(0, 10); 

        const existingAbsensi = await AbsensiModel.findAbsensiBySiswaAndDate(siswa.siswa_id, today, client);

        if (existingAbsensi) {
            await client.query('ROLLBACK');
            return res.status(409).json({ 
                message: `Anda sudah absen masuk hari ini pada pukul ${new Date(existingAbsensi.waktu_masuk).toLocaleTimeString('id-ID')}.`,
                siswa: siswa.nama_siswa,
                kelas: siswa.nama_kelas,
                status: 'already_scanned'
            });
        }

        const newAbsensi = await AbsensiModel.createAbsensi(siswa.siswa_id, 'Hadir', client);

        await client.query('COMMIT');

        res.status(201).json({
            message: `Absensi sukses! Selamat datang, ${siswa.nama_siswa}.`,
            siswa: siswa.nama_siswa,
            kelas: siswa.nama_kelas,
            waktu: new Date(newAbsensi.waktu_masuk).toLocaleTimeString('id-ID'),
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
        const logs = await AbsensiModel.getAttendanceLog(today);
        res.status(200).json(logs);
    } catch (error) {
        console.error("Database Error di getAttendanceLog:", error);
        next(error);
    }
};


export const getRecap = async (req, res, next) => {
    try {
        const { startDate, endDate, kelasId } = req.query; 
        const recap = await AbsensiModel.getRecap(startDate, endDate, kelasId);
        res.status(200).json(recap);
    } catch (error) {
        console.error("Database Error di getRecap:", error);
        next(error);
    }
};

export const getAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate, kelasId } = req.query;
        const params = [];
        let idx = 1;
        let where = [];
        if (startDate && endDate) {
            where.push(`DATE(a.waktu_masuk) BETWEEN $${idx} AND $${idx+1}`);
            params.push(startDate, endDate);
            idx += 2;
        }
        if (kelasId) {
            where.push(`k.kelas_id = $${idx}`);
            params.push(kelasId);
            idx++;
        }
        const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

        const query = `
            SELECT DATE(a.waktu_masuk) AS tanggal,
                SUM(CASE WHEN a.status_kehadiran = 'Hadir' THEN 1 ELSE 0 END) AS hadir,
                SUM(CASE WHEN a.status_kehadiran != 'Hadir' OR a.status_kehadiran IS NULL THEN 1 ELSE 0 END) AS absen
            FROM absensi a
            JOIN siswa s ON a.siswa_id = s.siswa_id
            JOIN kelas k ON s.kelas_id = k.kelas_id
            ${whereClause}
            GROUP BY DATE(a.waktu_masuk)
            ORDER BY DATE(a.waktu_masuk) ASC;
        `;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error di getAnalytics:', error);
        next(error);
    }
};

export const exportRecapCsv = async (req, res, next) => {
    try {
        const { startDate, endDate, kelasId } = req.query;
        const recap = await AbsensiModel.getRecap(startDate, endDate, kelasId);
        const csv = jsonToCsv(recap);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="recap_${Date.now()}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Error di exportRecapCsv:', error);
        next(error);
    }
};
