import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { QrCodeIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, PlusCircleIcon, PrinterIcon } from '@heroicons/react/24/outline';

// URL API
const API_LIST_URL = `${import.meta.env.VITE_API_URL}/admin/qr/list-siswa`;
const API_GENERATE_URL = `${import.meta.env.VITE_API_URL}/admin/qr/generate`; // Akan disambung dengan /:siswaId

// ==========================================================
// 1. KOMPONEN MODAL UNTUK PREVIEW QR CODE
// ==========================================================
const QRPreviewModal = ({ isOpen, onClose, qrDataUrl, namaSiswa, nisn }) => {
    if (!isOpen || !qrDataUrl) return null;

    // Fungsi untuk mencetak isi QR modal
    const handlePrint = () => {
        const printContent = document.getElementById('qr-print-area').innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Refresh untuk mengembalikan state aplikasi
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">QR Code Absensi</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                {/* Area yang akan dicetak */}
                <div id="qr-print-area" className="p-6 text-center">
                    <p className="font-bold text-xl text-gray-800 mb-2">{namaSiswa}</p>
                    <p className="text-sm text-gray-600 mb-4">NISN: {nisn}</p>
                    
                    {/* Tampilkan QR Code */}
                    <div className="w-48 h-48 mx-auto p-2 border-4 border-gray-200 rounded-lg bg-white shadow-inner">
                        <img 
                            src={qrDataUrl} 
                            alt={`QR Code untuk ${namaSiswa}`} 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Simpan atau cetak kode ini untuk absensi.</p>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-between">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
                    >
                        <PrinterIcon className="w-5 h-5 mr-2" /> Cetak QR
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};


// ==========================================================
// 2. KOMPONEN UTAMA (GENERATOR)
// ==========================================================
const QRCodeGenerator = () => {
    // --- STATE UTAMA ---
    const [dataSiswa, setDataSiswa] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State Modal Preview
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQRData, setCurrentQRData] = useState({ url: null, nama: '', nisn: '' });

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            setError("Autentikasi diperlukan.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(API_LIST_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const items = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setDataSiswa(items);
            setError(null);
        } catch (err) {
            console.error("Gagal mengambil data siswa QR:", err);
            setError(err.response?.data?.message || "Gagal terhubung ke server.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HANDLER GENERATE QR ---
    const handleGenerateQR = async (siswaId, namaSiswa, nisn) => {
        if (!window.confirm(`Yakin ingin membuat ulang/mengganti QR Code untuk siswa ${namaSiswa} (NISN: ${nisn})?`)) {
            return;
        }

        const token = localStorage.getItem('token');
        // Cari siswa di state untuk menampilkan loading
        setDataSiswa(prev => prev.map(s => s.id === siswaId ? { ...s, isGenerating: true } : s));

        try {
            const response = await axios.post(`${API_GENERATE_URL}/${siswaId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            // Update state dengan data baru
            setDataSiswa(prev => prev.map(s => s.id === siswaId ? 
                { 
                    ...s, 
                    has_qr: true, 
                    qr_data_url: response.data.qr_data.qr_data_url, 
                    isGenerating: false 
                } 
                : s));
            
            alert(`QR Code untuk ${namaSiswa} berhasil dibuat!`);

            // Tampilkan preview setelah generate
            setCurrentQRData({ url: response.data.qr_data.qr_data_url, nama: namaSiswa, nisn: nisn });
            setIsModalOpen(true);

        } catch (err) {
            setDataSiswa(prev => prev.map(s => s.id === siswaId ? { ...s, isGenerating: false } : s));
            console.error("Gagal generate QR:", err);
            alert('Gagal membuat QR Code: ' + (err.response?.data?.message || 'Server error'));
        }
    };
    
    // --- HANDLER PREVIEW ---
    const handlePreviewQR = (qrDataUrl, namaSiswa, nisn) => {
        setCurrentQRData({ url: qrDataUrl, nama: namaSiswa, nisn: nisn });
        setIsModalOpen(true);
    };

    // --- RENDER ---
    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Generator Kode QR Absensi</h2>
                    <p className="text-gray-600 text-sm mt-1">Buat dan kelola Kode QR unik untuk setiap siswa.</p>
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
            {isLoading && <div className="text-center p-8 text-gray-500">Memuat data siswa...</div>}
            {error && <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">{error}</div>}

            {/* Tabel Data */}
            {!isLoading && !error && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NISN</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status QR</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataSiswa.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                            Tidak ada data siswa.
                                        </td>
                                    </tr>
                                ) : (
                                    dataSiswa.map((item, index) => (
                                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {item.nisn}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.nama_siswa}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.nama_kelas}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {item.has_qr ? (
                                                    <span className="inline-flex items-center text-green-600 font-semibold">
                                                        <CheckCircleIcon className="w-5 h-5 mr-1" /> Sudah Dibuat
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-red-500 font-semibold">
                                                        <XCircleIcon className="w-5 h-5 mr-1" /> Belum Dibuat
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center space-x-2">
                                                    
                                                    {/* Tombol Preview (jika QR sudah ada) */}
                                                    {item.has_qr && (
                                                        <button
                                                            onClick={() => handlePreviewQR(item.qr_data_url, item.nama_siswa, item.nisn)}
                                                            className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50"
                                                            title="Preview QR Code"
                                                        >
                                                            <QrCodeIcon className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    {/* Tombol Generate/Buat Ulang */}
                                                    <button
                                                        onClick={() => handleGenerateQR(item.id, item.nama_siswa, item.nisn)}
                                                        className={`p-1.5 rounded transition ${item.has_qr ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'}`}
                                                        title={item.has_qr ? "Buat Ulang QR Code" : "Buat QR Code"}
                                                        disabled={item.isGenerating}
                                                    >
                                                        {item.isGenerating ? (
                                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <PlusCircleIcon className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Modal Preview */}
            <QRPreviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                qrDataUrl={currentQRData.url}
                namaSiswa={currentQRData.nama}
                nisn={currentQRData.nisn}
            />

        </div>
    );
};

export default QRCodeGenerator;