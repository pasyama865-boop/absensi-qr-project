import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    PencilIcon, 
    TrashIcon, 
    PlusIcon, 
    UserIcon,
    ArrowPathIcon,
    AcademicCapIcon,
    UsersIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';

// URL API Backend
const API_KELAS_URL = `${import.meta.env.VITE_API_URL}/admin/kelas`;
const API_WALI_LIST_URL = `${import.meta.env.VITE_API_URL}/admin/wali-kelas-list`;
const API_ASSIGN_WALI_URL = `${import.meta.env.VITE_API_URL}/admin/kelas/assign-wali`;
// API untuk mendapatkan siswa per kelas (Pastikan Anda sudah membuat rute ini di backend)
const API_SISWA_BY_KELAS = (kelasId) => `${import.meta.env.VITE_API_URL}/admin/kelas/${kelasId}/siswa`; 

// --- 1. KOMPONEN MODAL EDIT/TAMBAH KELAS (DENGAN DAFTAR SISWA) ---
const EditKelasModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    // State form diinisialisasi langsung dari props (aman karena pakai key di parent)
    const [formData, setFormData] = useState({
        nama_kelas: initialData?.nama || '',
        grade: initialData?.grade || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State untuk Daftar Siswa (Hanya untuk Edit Mode)
    const [relatedSiswa, setRelatedSiswa] = useState([]);
    const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);

    // Effect: Fetch Siswa hanya jika dalam mode Edit
    useEffect(() => {
        if (initialData && initialData.id && isOpen) {
            const fetchRelatedSiswa = async () => {
                setIsLoadingSiswa(true);
                const token = localStorage.getItem('token');
                try {
                    const res = await axios.get(API_SISWA_BY_KELAS(initialData.id), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setRelatedSiswa(res.data);
                } catch (err) {
                    console.error("Gagal memuat siswa terkait:", err);
                    setRelatedSiswa([]);
                } finally {
                    setIsLoadingSiswa(false);
                }
            };
            fetchRelatedSiswa();
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Kirim grade sebagai integer
        const dataToSend = { ...formData, grade: parseInt(formData.grade) };
        await onSubmit(dataToSend, initialData ? initialData.id : null);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    const isEditMode = !!initialData;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
            {/* Ukuran modal melebar (max-w-4xl) jika Edit Mode untuk memuat daftar siswa */}
            <div className={`bg-white rounded-xl shadow-2xl w-full ${isEditMode ? 'max-w-4xl' : 'max-w-sm'} overflow-hidden transition-all`}>
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        {isEditMode ? `Edit Kelas & Siswa` : 'Tambah Kelas Baru'}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
                </div>
                
                <div className={`p-6 ${isEditMode ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                    
                    {/* BAGIAN KIRI: FORM EDIT KELAS */}
                    <div className={isEditMode ? 'border-r md:pr-6 border-gray-200' : ''}>
                        <div className="flex items-center mb-4 text-gray-800 font-bold border-b pb-2">
                            <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-500" />
                            <h4>Informasi Kelas</h4>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                                <input 
                                    type="text" name="nama_kelas" required
                                    value={formData.nama_kelas} onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 outline-none"
                                    placeholder="Contoh: X IPA 1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade / Tingkat</label>
                                <input 
                                    type="number" name="grade" required
                                    value={formData.grade} onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 outline-none"
                                    placeholder="Contoh: 10"
                                    min="1"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* BAGIAN KANAN: DAFTAR SISWA (Hanya Tampil saat Edit) */}
                    {isEditMode && (
                        <div>
                            <div className="flex items-center mb-4 text-gray-800 font-bold border-b pb-2">
                                <UsersIcon className="w-5 h-5 mr-2 text-green-600" />
                                <h4>Daftar Siswa ({relatedSiswa.length})</h4>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-200 h-64 overflow-y-auto p-2">
                                {isLoadingSiswa ? (
                                    <div className="flex justify-center items-center h-full text-gray-500">
                                        <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Memuat...
                                    </div>
                                ) : relatedSiswa.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                                        <UsersIcon className="w-8 h-8 mb-2 opacity-50" />
                                        <p>Belum ada siswa di kelas ini.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-1">
                                        {relatedSiswa.map((siswa) => (
                                            <li key={siswa.id} className="bg-white p-2 rounded shadow-sm border border-gray-100 flex justify-between items-center text-sm">
                                                <span className="font-medium text-gray-800 truncate w-2/3">{siswa.nama_siswa}</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">NISN: {siswa.nisn}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                *Untuk menambah/menghapus siswa, silakan ke menu <strong>Data Siswa</strong>.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 2. KOMPONEN MODAL PENUGASAN WALI KELAS (Plotting) ---
const AssignWaliModal = ({ isOpen, onClose, kelasId, kelasName, currentWaliId, listGuru, onAssignmentSuccess }) => {
    // State diinisialisasi langsung (aman karena pakai key di parent)
    const [selectedGuruId, setSelectedGuruId] = useState(String(currentWaliId || '')); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const guruIdToSend = String(selectedGuruId);
        
        if (!guruIdToSend) {
            alert("Harap pilih guru untuk ditugaskan.");
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                API_ASSIGN_WALI_URL,
                { kelas_id: parseInt(kelasId), guru_id: guruIdToSend }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(response.data.message);
            onAssignmentSuccess(); 
            onClose();

        } catch (err) {
            console.error("Gagal menugaskan Wali Kelas:", err.response || err);
            alert(`Gagal menugaskan: ${err.response?.data?.message || 'Server error'}. Pastikan Tahun Ajaran Aktif.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        Tugaskan Wali Kelas
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-gray-700 text-sm">
                        Siapa yang akan menjadi Wali Kelas untuk <br/>
                        <span className="font-bold text-lg text-indigo-700">{kelasName}</span>?
                    </p>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Guru</label>
                        <select
                            value={selectedGuruId}
                            onChange={(e) => setSelectedGuruId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 outline-none bg-white"
                            required
                        >
                            <option value="">-- Pilih Guru --</option>
                            {listGuru && listGuru.map(guru => (
                                <option key={guru.id} value={guru.id}>{guru.nama} ({guru.nip})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-70"
                        >
                            {isSubmitting ? 'Simpan Penugasan' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- 3. KOMPONEN UTAMA HALAMAN ---
const DataKelas = () => {
    const [dataKelas, setDataKelas] = useState([]);
    const [listGuru, setListGuru] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State Modal
    const [isKelasModalOpen, setIsKelasModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // State Data yang sedang diedit/ditugaskan
    const [editingKelas, setEditingKelas] = useState(null);
    const [kelasToAssign, setKelasToAssign] = useState(null);

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        setIsLoading(true);
        try {
            const [kelasRes, guruRes] = await Promise.all([
                axios.get(API_KELAS_URL, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(API_WALI_LIST_URL, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            setDataKelas(kelasRes.data);
            setListGuru(guruRes.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Gagal memuat data. Pastikan backend berjalan dan Anda login.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- CRUD HANDLERS ---
    const handleSaveKelas = async (formData, id) => {
        const token = localStorage.getItem('token');
        try {
            if (id) {
                await axios.put(`${API_KELAS_URL}/${id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Data kelas berhasil diperbarui!");
            } else {
                await axios.post(API_KELAS_URL, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Kelas baru berhasil ditambahkan!");
            }
            setIsKelasModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Terjadi kesalahan saat menyimpan.");
        }
    };

    const handleDeleteKelas = async (id, nama) => {
        if (!window.confirm(`Yakin hapus kelas ${nama}? Semua siswa di kelas ini akan kehilangan asosiasi kelas.`)) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_KELAS_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            alert("Kelas berhasil dihapus.");
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menghapus.");
        }
    };

    // --- MODAL TRIGGERS ---
    const handleOpenKelasModal = (kelas = null) => {
        setEditingKelas(kelas);
        setIsKelasModalOpen(true);
    };

    const handleOpenAssignModal = (kelas) => {
        setKelasToAssign(kelas);
        setIsAssignModalOpen(true);
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Master Data Kelas & Wali Kelas</h2>
                    <p className="text-gray-600">Kelola daftar kelas dan penugasan Wali Kelas aktif.</p>
                </div>
                <button 
                    onClick={() => handleOpenKelasModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition"
                >
                    <PlusIcon className="w-5 h-5 mr-2" /> Tambah Kelas
                </button>
            </div>

            {isLoading ? (
                <div className="text-center p-10 text-gray-500">
                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                    Memuat data...
                </div>
            ) : error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
            ) : (
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Wali Kelas Aktif</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataKelas.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">Belum ada data kelas.</td>
                                    </tr>
                                ) : (
                                    dataKelas.map((kelas) => (
                                        <tr key={kelas.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{kelas.nama}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{kelas.grade}</td>
                                            <td className="px-6 py-4 text-sm font-semibold">
                                                {kelas.wali_kelas_name ? (
                                                    <div className="flex items-center text-indigo-600">
                                                        <UserIcon className="w-4 h-4 mr-1" /> {kelas.wali_kelas_name}
                                                    </div>
                                                ) : (
                                                    <span className="text-yellow-600 italic">Belum ditugaskan</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    
                                                    {/* TOMBOL TUGASKAN (Plotting) */}
                                                    <button 
                                                        onClick={() => handleOpenAssignModal(kelas)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                                                        title="Tugaskan Wali Kelas"
                                                    >
                                                        <AcademicCapIcon className="w-5 h-5" />
                                                    </button>

                                                    {/* TOMBOL EDIT KELAS (Info & Siswa) */}
                                                    <button 
                                                        onClick={() => handleOpenKelasModal(kelas)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Edit Kelas & Lihat Siswa"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>

                                                    {/* TOMBOL HAPUS */}
                                                    <button 
                                                        onClick={() => handleDeleteKelas(kelas.id, kelas.nama)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                        title="Hapus Kelas"
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

            {/* Modal Tambah/Edit Kelas (Menggunakan KEY untuk reset state otomatis saat data berubah) */}
            <EditKelasModal 
                key={`edit-modal-${editingKelas?.id || 'new'}`} 
                isOpen={isKelasModalOpen} 
                onClose={() => setIsKelasModalOpen(false)} 
                onSubmit={handleSaveKelas}
                initialData={editingKelas}
            />

            {/* Modal Penugasan Wali Kelas */}
            <AssignWaliModal
                key={`assign-modal-${kelasToAssign?.id || 'none'}`}
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                kelasId={kelasToAssign?.id ? String(kelasToAssign.id) : null} 
                kelasName={kelasToAssign?.nama}
                currentWaliId={kelasToAssign?.current_wali_id} 
                listGuru={listGuru}
                onAssignmentSuccess={fetchData} 
            />
        </div>
    );
};

export default DataKelas;