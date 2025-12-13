import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';


// 1. Dashboard
import { 
    getDashboardStats, 
    getMonthlyAttendanceTrend 
} from '../controllers/adminController.js';

// 2. Tahun Ajaran
import { 
    getAllTahunAjaran, 
    createTahunAjaran, 
    updateTahunAjaran, 
    deleteTahunAjaran 
} from '../controllers/tahunAjaranController.js'; 

// 3. Kelas & Wali Kelas
import {
    getAllKelas,
    createKelas,
    updateKelas,
    deleteKelas,
    getWaliKelasList,
    assignWaliKelas 
} from '../controllers/kelasController.js';

// 4. Siswa
import {
    getAllSiswa,
    createSiswa,
    updateSiswa,
    deleteSiswa,
    getSiswaByKelasId 
} from '../controllers/siswaController.js';

// 5. Guru
import {
    getAllGuru,
    createGuru,
    updateGuru,
    deleteGuru
} from '../controllers/guruController.js';

// 6. QR Code
import {
    getSiswaForQR,
    generateQRCode
} from '../controllers/qrController.js';

// 7. Absensi & Rekap
import { 
    getAttendanceLog,
    getRecap
} from '../controllers/absensiController.js';

// 8. Pengaturan (Settings)
import { 
    changePassword, 
    updateProfile, 
    getSystemSettings, 
    updateSystemSettings 
} from '../controllers/settingsController.js';


const router = express.Router();

// Middleware: Lindungi semua rute Admin
router.use(protect);
router.use(authorize(['admin']));


// RUTE DASHBOARD & REKAP

// Dashboard Stats Utama
router.get('/dashboard-stats', getDashboardStats);

// Tren Kehadiran Mingguan (untuk grafik dashboard)
router.get('/rekap/trend', getMonthlyAttendanceTrend);

// --- A. Tahun Ajaran ---
router.route('/tahun-ajaran')
    .get(getAllTahunAjaran)
    .post(createTahunAjaran);
router.route('/tahun-ajaran/:id')
    .put(updateTahunAjaran)
    .delete(deleteTahunAjaran);
router.put('/tahun-ajaran/activate/:id', (req, res) => res.status(200).json({ message: "TA activated (Placeholder)" }));


// --- B. Kelas & Wali Kelas ---
router.get('/wali-kelas-list', getWaliKelasList);
router.post('/kelas/assign-wali', assignWaliKelas);

router.route('/kelas')
    .get(getAllKelas)
    .post(createKelas);
router.route('/kelas/:id')
    .put(updateKelas)
    .delete(deleteKelas);


// --- C. Siswa ---
router.route('/siswa')
    .get(getAllSiswa)
    .post(createSiswa);

router.route('/siswa/:id')
    .put(updateSiswa)
    .delete(deleteSiswa);

router.get('/kelas/:id/siswa', getSiswaByKelasId);


// --- D. Guru ---
router.route('/guru')
    .get(getAllGuru)
    .post(createGuru);
router.route('/guru/:id')
    .put(updateGuru)
    .delete(deleteGuru);

router.get('/qr/list-siswa', getSiswaForQR);
router.post('/qr/generate/:siswaId', generateQRCode);


router.get('/kehadiran', getAttendanceLog);
router.get('/rekap', getRecap);

router.put('/settings/password', changePassword);
router.put('/settings/profile', updateProfile);
router.get('/settings/system', getSystemSettings);
router.put('/settings/system', updateSystemSettings);


export default router;