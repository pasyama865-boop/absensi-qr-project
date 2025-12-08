import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import ProtectedRoute from './components/shared/ProtectedRoute'; 
import Layout from './components/layout/Layout'; 
import LoginPage from './pages/auth/LoginPage';


// --- Import Semua Halaman Admin (Lazy Loading) ---
const DashboardAdmin = lazy(() => import('./pages/admin/DashboardAdmin'));
const DataGuru = lazy(() => import('./pages/admin/DataGuru')); 
const Kehadiran = lazy(() => import('./pages/admin/Kehadiran'));
const RekapAbsensi = lazy(() => import('./pages/admin/RekapAbsensi'));
const TahunAjaran = lazy(() => import('./pages/admin/TahunAjaran'));
const DataSiswa = lazy(() => import('./pages/admin/DataSiswa'));
const WaliKelas = lazy(() => import('./pages/admin/WaliKelas')); 
const DataKelas = lazy(() => import('./pages/admin/DataKelas'));
const QRCodeGenerator = lazy(() => import('./pages/admin/QRCodeGenerator'));
const Pengaturan = lazy(() => import('./pages/admin/Pengaturan'));


// --- Import Halaman Guru dan Siswa ---
const DashboardGuru = lazy(() => import('./pages/guru/DashboardGuru'));
const DashboardSiswa = lazy(() => import('./pages/siswa/DashboardSiswa'));
const MyQrCode = lazy(() => import('./pages/siswa/MyQrCode'));
const RiwayatAbsensi = lazy(() => import('./pages/siswa/RiwayatAbsensi')); 


function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div className="p-10 text-center">Memuat Halaman...</div>}>
          <Routes>
            
            {/* 1. Redirect Default & Public Route */}
            <Route path="/" element={<Navigate to="/login" replace />} /> 
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<h1 className="text-3xl text-center mt-20 text-red-600">403 Akses Ditolak</h1>} />


            {/* 2. Protected Routes */}

            {/* Protected Routes - ADMIN (Menggunakan Layout/Sidebar) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<Layout role="admin" />}>
                <Route index element={<DashboardAdmin />} /> {/* /admin */}
                
                {/* Rute Admin Lengkap dari Sidebar */}
                <Route path="kehadiran" element={<Kehadiran />} />
                <Route path="rekap" element={<RekapAbsensi />} />
                <Route path="tahun-ajaran" element={<TahunAjaran />} />
                <Route path="siswa" element={<DataSiswa />} />
                <Route path="guru" element={<DataGuru />} /> {/* Rute Guru di Admin */}
                <Route path="wali-kelas" element={<WaliKelas />} />
                <Route path="kelas" element={<DataKelas />} />
                <Route path="qr-generator" element={<QRCodeGenerator />} />
                <Route path="pengaturan" element={<Pengaturan />} />

              </Route>
            </Route>

            {/* Protected Routes - GURU (Perbaikan: TIDAK MENGGUNAKAN LAYOUT) */}
            <Route element={<ProtectedRoute allowedRoles={['guru']} />}>
              {/* Rute Dashboard Guru Langsung dimuat (FULLSCREEN) */}
              <Route path="/guru" element={<DashboardGuru />} /> 
              
              {/* Rute Scanner Guru (Juga dimuat FULLSCREEN) */}
            </Route>
            
            {/* Protected Routes - SISWA */}
            <Route element={<ProtectedRoute allowedRoles={['siswa']} />}>
              <Route path="/siswa" element={<Layout role="siswa" />}>
                <Route index element={<DashboardSiswa />} />
                <Route path="my-qr" element={<MyQrCode />} />
                <Route path="riwayat" element={<RiwayatAbsensi />} /> 
              </Route>
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<h1 className="text-3xl text-center mt-20">404 Not Found</h1>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;