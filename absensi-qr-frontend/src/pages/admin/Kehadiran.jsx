import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// PASTIKAN SEMUA IKON INI ADA
import { ClockIcon, CheckCircleIcon, ArrowPathIcon, XCircleIcon } from '@heroicons/react/24/outline'; 

const API_URL = `${import.meta.env.VITE_API_URL}/admin/kehadiran`;

// Helper untuk format waktu
const formatTime = (isoString) => {
    if (!isoString) return '-';
    // Menggunakan toLocaleTimeString untuk menampilkan jam
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const Kehadiran = () => {
    const [dataAbsensi, setDataAbsensi] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            setError("Autentikasi diperlukan. Silakan login kembali.");
            return;
        }

        setIsLoading(true);
        try {
            // Memanggil API yang akan mengambil data absensi HARI INI
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            // Pastikan data adalah array
            const items = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setDataAbsensi(items);
            setError(null);
        } catch (err) {
            console.error("Gagal mengambil data Kehadiran:", err);
            // Menangkap dan menampilkan error dari backend
            setError(err.response?.data?.message || "Gagal terhubung ke server.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- RENDER ---
    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Log Kehadiran Harian</h2>
                    <p className="text-gray-600 text-sm mt-1 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1 text-blue-500" />
                        Status Absensi Hari Ini: <span className="font-semibold ml-1">{todayDate}</span>
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="mt-4 md:mt-0 px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition flex items-center"
                    disabled={isLoading}
                >
                    <ArrowPathIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* Loading & Error */}
            {isLoading && <div className="text-center p-8 text-gray-500">Memuat log absensi...</div>}
            {error && <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">{error}</div>}

            {/* Tabel Data */}
            {!isLoading && !error && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Masuk</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NISN</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataAbsensi.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                            Belum ada absensi masuk yang tercatat hari ini.
                                        </td>
                                    </tr>
                                ) : (
                                    dataAbsensi.map((item, index) => (
                                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {formatTime(item.waktu_masuk)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                {item.nisn}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.nama_siswa}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.nama_kelas}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {item.status_kehadiran === 'Hadir' ? (
                                                    <span className="inline-flex items-center text-green-600 font-bold">
                                                        <CheckCircleIcon className="w-5 h-5 mr-1" /> Hadir
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-red-600 font-bold">
                                                        <XCircleIcon className="w-5 h-5 mr-1" /> {item.status_kehadiran || 'Tidak Tercatat'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kehadiran;