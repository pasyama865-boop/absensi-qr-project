import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TrashIcon, UserPlusIcon, AcademicCapIcon, HomeModernIcon } from '@heroicons/react/24/outline';

// URL API
const API_URL = `${import.meta.env.VITE_API_URL}/admin/wali-kelas-plotting`;
const AVAILABLE_KELAS_URL = `${import.meta.env.VITE_API_URL}/admin/wali-kelas-available-kelas`;
const AVAILABLE_GURU_URL = `${import.meta.env.VITE_API_URL}/admin/wali-kelas-available-guru`;

// ==========================================================
// 1. KOMPONEN MODAL PLOTTING (CREATE)
// ==========================================================
const PlottingFormModal = ({ onClose, onSubmit, listKelas, listGuru }) => {
    // State yang akan dikirim ke backend
    const [kelasId, setKelasId] = useState('');
    const [guruId, setGuruId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!kelasId || !guruId) {
            alert("Harap pilih Kelas dan Guru yang akan ditugaskan.");
            return;
        }

        setIsSubmitting(true);
        const formData = {
            kelas_id: parseInt(kelasId, 10),
            guru_id: guruId
        };

        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                {/* Header Modal */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Tugaskan Wali Kelas Baru</h3>
                    <button onClick={onClose} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        
                        {/* Dropdown Kelas Tersedia */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas Kosong</label>
                            <select
                                value={kelasId}
                                onChange={(e) => setKelasId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                                required
                                disabled={listKelas.length === 0}
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {listKelas.map(k => (
                                    <option key={k.id} value={k.id}>{k.nama}</option>
                                ))}
                            </select>
                            {listKelas.length === 0 && <p className="text-sm text-red-500 mt-1">Semua kelas sudah memiliki wali kelas untuk TA aktif.</p>}
                        </div>

                        {/* Dropdown Guru Tersedia */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Guru</label>
                            <select
                                value={guruId}
                                onChange={(e) => setGuruId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                                required
                                disabled={listGuru.length === 0}
                            >
                                <option value="">-- Pilih Guru --</option>
                                {listGuru.map(g => (
                                    <option key={g.id} value={g.id}>{g.nama}</option>
                                ))}
                            </select>
                            {listGuru.length === 0 && <p className="text-sm text-red-500 mt-1">Semua guru sudah bertugas sebagai wali kelas.</p>}
                        </div>

                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md focus:outline-none ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting || listKelas.length === 0 || listGuru.length === 0}
                        >
                            {isSubmitting ? 'Menugaskan...' : 'Tugaskan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ==========================================================
// 2. KOMPONEN UTAMA (DATA PLOTTING)
// ==========================================================
const PlottingWaliKelas = () => {
    // --- STATE UTAMA ---
    const [dataPlotting, setDataPlotting] = useState([]);
    const [listKelasAvailable, setListKelasAvailable] = useState([]); 
    const [listGuruAvailable, setListGuruAvailable] = useState([]);       
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal hanya untuk CREATE/Tambah

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
            // 1. Ambil Data Plotting (READ)
            const [plottingRes, kelasRes, guruRes] = await Promise.all([
                axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(AVAILABLE_KELAS_URL, { headers: { Authorization: `Bearer ${token}` } }), // Kelas yang BELUM ada Wali
                axios.get(AVAILABLE_GURU_URL, { headers: { Authorization: `Bearer ${token}` } }) // Guru yang BELUM jadi Wali
            ]);

            const plottingItems = Array.isArray(plottingRes.data) ? plottingRes.data : (plottingRes.data.data || []);
            setDataPlotting(plottingItems);

            const kelasItems = Array.isArray(kelasRes.data) ? kelasRes.data : (kelasRes.data.data || []);
            setListKelasAvailable(kelasItems);

            const guruItems = Array.isArray(guruRes.data) ? guruRes.data : (guruRes.data.data || []);
            setListGuruAvailable(guruItems);

            setError(null);
        } catch (err) {
            console.error("Gagal mengambil data plotting:", err);
            setError(err.response?.data?.message || "Gagal terhubung ke server.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HANDLERS ---
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // --- CRUD ACTION ---
    // 1. CREATE (Tugaskan Wali Kelas)
    const handleSubmitForm = async (formData) => {
        const token = localStorage.getItem('token');
        
        try {
            await axios.post(API_URL, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            handleCloseModal();
            fetchData(); // Refresh data
            alert(`Plotting berhasil dilakukan!`);
        } catch (err) {
            console.error("Gagal menyimpan plotting:", err);
            const msg = err.response?.data?.message || 'Server error saat menyimpan plotting.';
            alert(`Gagal menugaskan: ${msg}`);
        }
    };

    // 2. DELETE (Cabut Tugas Wali Kelas)
    const handleDelete = async (id, namaKelas, namaGuru) => {
        if (!window.confirm(`Yakin ingin mencabut tugas Wali Kelas dari Guru ${namaGuru} untuk Kelas ${namaKelas}?`)) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
            alert('Tugas Wali Kelas berhasil dicabut!');
        } catch (err) {
            console.error("Gagal menghapus plotting:", err);
            alert('Gagal mencabut tugas: ' + (err.response?.data?.message || 'Server error'));
        }
    };

    // --- RENDER ---
    const taAktif = dataPlotting.length > 0 ? dataPlotting[0].nama_ta : 'Tidak Diketahui';

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Plotting Wali Kelas</h2>
                    <p className="text-gray-600 text-sm mt-1">Penugasan Wali Kelas untuk **Tahun Ajaran Aktif**: 
                        <span className="font-semibold text-blue-600"> {taAktif}</span>
                    </p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition flex items-center focus:outline-none"
                >
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    + Tugaskan Wali Kelas
                </button>
            </div>

            {/* Loading & Error */}
            {isLoading && (
                <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-gray-500">Memuat data plotting...</span>
                </div>
            )}
            
            {error && (
                <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* Tabel Data */}
            {!isLoading && !error && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Wali Kelas Ditugaskan</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tahun Ajaran</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataPlotting.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">
                                            Belum ada Wali Kelas yang ditugaskan di TA ini.
                                        </td>
                                    </tr>
                                ) : (
                                    dataPlotting.map((item, index) => (
                                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                                <HomeModernIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                                {item.nama_kelas} (Grade {item.grade})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 flex items-center">
                                                <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
                                                {item.nama_guru}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.nama_ta}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleDelete(item.id, item.nama_kelas, item.nama_guru)}
                                                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                                        title="Cabut Tugas"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
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

            {/* MODAL FORM (CONDITIONAL RENDERING) */}
            {isModalOpen && (
                <PlottingFormModal
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitForm}
                    listKelas={listKelasAvailable} // Kelas yang belum ada wali
                    listGuru={listGuruAvailable} // Guru yang belum jadi wali
                />
            )}
        </div>
    );
};

export default PlottingWaliKelas;