import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    MagnifyingGlassIcon, 
    ClipboardDocumentListIcon, 
    ArrowPathIcon, 
    PrinterIcon,
    CalendarDaysIcon 
} from '@heroicons/react/24/outline';

// Menggunakan URL API dari environment variable
const API_REKAP_URL = `${import.meta.env.VITE_API_URL}/admin/rekap`;
const API_KELAS_URL = `${import.meta.env.VITE_API_URL}/admin/kelas`;

// Helper: Format Tanggal YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

const RekapAbsensi = () => {
    // --- STATE DATA ---
    const [dataRekap, setDataRekap] = useState([]);
    const [listKelas, setListKelas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- STATE FILTER ---
    const [filterType, setFilterType] = useState('monthly'); // 'range', 'monthly', 'yearly'
    const [selectedKelasId, setSelectedKelasId] = useState('');
    
    // State untuk Range Custom
    const [customStart, setCustomStart] = useState(formatDate(new Date()));
    const [customEnd, setCustomEnd] = useState(formatDate(new Date()));

    // State untuk Bulanan/Tahunan
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0 = Jan
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // --- 1. Fetch Daftar Kelas (Dropdown) ---
    const fetchKelas = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(API_KELAS_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const items = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setListKelas(items);
        } catch (err) {
            console.error("Gagal memuat daftar kelas", err);
        }
    }, []);

    useEffect(() => {
        fetchKelas();
    }, [fetchKelas]);

    // --- 2. Hitung Tanggal & Fetch Data ---
    const fetchRekap = async (e) => {
        if (e) e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Autentikasi diperlukan.");
            return;
        }

        setIsLoading(true);
        setError(null);

        // --- LOGIKA PERHITUNGAN TANGGAL BERDASARKAN TIPE FILTER ---
        let startDate, endDate;

        if (filterType === 'range') {
            startDate = customStart;
            endDate = customEnd;
        } else if (filterType === 'monthly') {
            // Awal bulan: Tanggal 1
            const firstDay = new Date(selectedYear, selectedMonth, 1);
            // Akhir bulan: Tanggal 0 bulan berikutnya
            const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
            // Timezone offset correction
            startDate = formatDate(new Date(firstDay.getTime() - (firstDay.getTimezoneOffset() * 60000)));
            endDate = formatDate(new Date(lastDay.getTime() - (lastDay.getTimezoneOffset() * 60000)));
        } else if (filterType === 'yearly') {
            startDate = `${selectedYear}-01-01`;
            endDate = `${selectedYear}-12-31`;
        }

        try {
            console.log(`Fetching Rekap: ${startDate} to ${endDate}, Kelas: ${selectedKelasId || 'All'}`);
            
            const response = await axios.get(API_REKAP_URL, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate,
                    endDate,
                    kelasId: selectedKelasId
                }
            });
            const items = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setDataRekap(items);
        } catch (err) {
            console.error("Gagal memuat rekap", err);
            setError("Gagal memuat data. Pastikan server berjalan.");
        } finally {
            setIsLoading(false);
        }
    };

    // Load default data (Bulan ini) saat pertama kali buka
    useEffect(() => {
        fetchRekap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // --- 3. Fungsi Cetak ---
    const handlePrint = () => {
        window.print();
    };

    // --- Helper UI ---
    const getPeriodeLabel = () => {
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        if (filterType === 'range') return `${customStart} s/d ${customEnd}`;
        if (filterType === 'monthly') return `${months[selectedMonth]} ${selectedYear}`;
        if (filterType === 'yearly') return `Tahun ${selectedYear}`;
        return '-';
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 no-print">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Laporan Rekap Absensi</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Kelola dan cetak laporan kehadiran siswa bulanan atau tahunan.
                    </p>
                </div>
                <button 
                    onClick={handlePrint}
                    className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition shadow-lg"
                >
                    <PrinterIcon className="w-5 h-5 mr-2" /> Cetak / PDF
                </button>
            </div>

            {/* --- FILTER SECTION (Disembunyikan saat Print) --- */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 no-print">
                <form onSubmit={fetchRekap} className="space-y-4">
                    
                    {/* Baris 1: Tipe Laporan & Kelas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Tipe Laporan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Laporan</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setFilterType('monthly')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${filterType === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Bulanan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterType('yearly')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${filterType === 'yearly' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Tahunan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterType('range')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${filterType === 'range' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Custom
                                </button>
                            </div>
                        </div>

                        {/* Filter Kelas (Selalu Muncul) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Kelas</label>
                            <select 
                                value={selectedKelasId}
                                onChange={(e) => setSelectedKelasId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">-- Tampilkan Semua Kelas --</option>
                                {listKelas.map((kelas) => (
                                    <option key={kelas.id} value={kelas.id}>Kelas {kelas.nama}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Baris 2: Input Tanggal Dinamis */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                        
                        {/* MODE: BULANAN */}
                        {filterType === 'monthly' && (
                            <>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                                    >
                                        {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                                            <option key={i} value={i}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                                    <input 
                                        type="number" 
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                                    />
                                </div>
                            </>
                        )}

                        {/* MODE: TAHUNAN */}
                        {filterType === 'yearly' && (
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Tahun Laporan</label>
                                <input 
                                    type="number" 
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                                    placeholder="Contoh: 2024"
                                />
                            </div>
                        )}

                        {/* MODE: CUSTOM RANGE */}
                        {filterType === 'range' && (
                            <>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                                    <input 
                                        type="date" 
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                                    <input 
                                        type="date" 
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                                    />
                                </div>
                            </>
                        )}

                        {/* Tombol Cari */}
                        <div>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-70 h-[42px]"
                            >
                                {isLoading ? (
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                                        Tampilkan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 no-print">
                    {error}
                </div>
            )}

            {/* --- TABEL DATA (Printable Area) --- */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 print-section overflow-hidden">
                {/* Header Laporan (Hanya Muncul di Print / Atas Tabel) */}
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-blue-600" />
                            HASIL REKAPITULASI ABSENSI
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                            Sistem Absensi QR Code Sekolah
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium border border-blue-200">
                            <CalendarDaysIcon className="w-4 h-4 mr-2" />
                            Periode: {getPeriodeLabel()}
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r">Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r">Kelas</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider bg-green-50 border-r">Hadir</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider bg-red-50 border-r">Absen</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-200">Total Hari</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Memuat data laporan...
                                    </td>
                                </tr>
                            ) : dataRekap.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                                        Tidak ada data absensi ditemukan untuk periode <strong>{getPeriodeLabel()}</strong>.
                                    </td>
                                </tr>
                            ) : (
                                dataRekap.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap border-r border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{item.nama_siswa}</span>
                                                <span className="text-xs text-blue-600">NISN: {item.nisn}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                            {item.nama_kelas}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-green-700 bg-green-50 border-r border-green-100">
                                            {item.total_hadir}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-red-700 bg-red-50 border-r border-red-100">
                                            {item.total_absen}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold text-gray-700 bg-gray-50">
                                            {item.total_absensi_dicatat}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer Print */}
                <div className="hidden print:block p-8 mt-4 text-right">
                    <p className="text-sm text-gray-600">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                    <p className="text-sm font-bold mt-10 underline">Mengetahui, Kepala Sekolah</p>
                </div>
            </div>

            {/* CSS KHUSUS PRINT */}
            <style>{`
                @media print {
                    @page { size: A4; margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    .no-print { display: none !important; }
                    .print-section { border: 1px solid #ddd !important; box-shadow: none !important; margin: 0; width: 100%; }
                    /* Pastikan background warna di tabel tercetak */
                    .bg-green-50 { background-color: #f0fdf4 !important; }
                    .bg-red-50 { background-color: #fef2f2 !important; }
                    .bg-gray-50 { background-color: #f9fafb !important; }
                    .bg-gray-100 { background-color: #f3f4f6 !important; }
                }
            `}</style>
        </div>
    );
};

export default RekapAbsensi;