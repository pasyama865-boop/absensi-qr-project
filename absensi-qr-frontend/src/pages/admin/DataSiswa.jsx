import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    PencilIcon, 
    TrashIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    UserIcon, 
    ArrowPathIcon,
    KeyIcon, 
    XMarkIcon
} from '@heroicons/react/24/outline';

const getApiUrl = (endpoint) => {
    let baseUrl = 'http://localhost:5000/api';
    try {
        if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
            baseUrl = import.meta.env.VITE_API_URL;
        }
    } catch (error) { 
        console.warn("Using default API URL due to environment reading error:", error);
    }
    return `${baseUrl}/admin/${endpoint}`;
};

const API_SISWA_URL = getApiUrl('siswa');
const API_KELAS_URL = getApiUrl('kelas');


const SiswaFormModal = ({ isOpen, onClose, onSubmit, initialData, listKelas }) => {
    const [formData, setFormData] = useState({
        nisn: initialData?.nisn || '',
        nama_siswa: initialData?.nama_siswa || '',
        kelas_id: initialData?.kelas_id || '',
        password: '', 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData, initialData ? initialData.id : null);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    const isEditMode = !!initialData;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        {isEditMode ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200" aria-label="Tutup">
                         <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* NISN */}
                    <div>
                        <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">NISN</label>
                        <input 
                            type="text" 
                            name="nisn"
                            required
                            value={formData.nisn}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 outline-none"
                            placeholder="Nomor Induk Siswa Nasional"
                        />
                    </div>
                    {/* Nama Lengkap */}
                    <div>
                        <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">Nama Lengkap</label>
                        <input 
                            type="text" 
                            name="nama_siswa"
                            required
                            value={formData.nama_siswa}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 outline-none"
                            placeholder="Nama Siswa"
                        />
                    </div>
                    {/* Kelas */}
                    <div>
                        <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">Kelas</label>
                        <select
                            name="kelas_id"
                            required
                            value={formData.kelas_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {listKelas.map(k => (
                                <option key={k.id} value={k.id}>{k.nama || k.nama_kelas}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* FIELD PASSWORD BARU */}
                    <div>
                        <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                             <KeyIcon className="w-4 h-4 text-gray-400" />
                            Password
                        </label>
                        <input 
                            type="text" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 outline-none bg-yellow-50"
                            placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah" : "Password (Opsional)"}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {isEditMode ? "* Isi field ini hanya jika Anda ingin mengganti password." : "* Jika dikosongkan, password akan diatur otomatis (biasanya sama dengan NISN)."}
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-70"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DataSiswa = () => {
    const [dataSiswa, setDataSiswa] = useState([]);
    const [listKelas, setListKelas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSiswa, setEditingSiswa] = useState(null);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        setIsLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            
            console.log("Mencoba fetch Siswa dari:", API_SISWA_URL);
            console.log("Mencoba fetch Kelas dari:", API_KELAS_URL);

            const [siswaRes, kelasRes] = await Promise.all([
                axios.get(API_SISWA_URL, { headers }),
                axios.get(API_KELAS_URL, { headers })
            ]);
            
            const kelasMap = kelasRes.data.reduce((map, k) => {
                map[k.id] = k.nama || k.nama_kelas;
                return map;
            }, {});

            const siswaWithKelasName = siswaRes.data.map(s => ({
                ...s,
                nama_kelas: kelasMap[s.kelas_id] || 'Belum Ditetapkan'
            }));


            setDataSiswa(siswaWithKelasName);
            setListKelas(kelasRes.data);
        } catch (err) {
            console.error("Error fetching data:", err.message, err.response?.data);
            alert(`Gagal memuat data. Periksa server backend (port 5000). Detail: ${err.message}`); 
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Create / Update Logic
    const handleSave = async (formData, id) => {
        const token = localStorage.getItem('token');
        try {
            const payload = {
                nisn: formData.nisn,
                nama_siswa: formData.nama_siswa,
                kelas_id: formData.kelas_id,
            };

            if (formData.password) {
                payload.password = formData.password;
            }


            if (id) {
                await axios.put(`${API_SISWA_URL}/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Data siswa diperbarui!");
            } else {
                await axios.post(API_SISWA_URL, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Siswa berhasil ditambahkan!");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menyimpan data siswa.");
        }
    };

    // Delete Logic
    const handleDelete = async (id, nama) => {
        // Konfirmasi yang lebih jelas
        if (!window.confirm(`PERINGATAN: Menghapus siswa ${nama} akan menghapus AKUN LOGIN dan DATA ABSENSI mereka secara permanen.\n\nLanjutkan?`)) return;
        
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_SISWA_URL}/${id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            // Refresh data setelah sukses
            fetchData();
            alert("Siswa berhasil dihapus.");
            
        } catch (err) {
            console.error("Gagal menghapus:", err);
            
            const pesanError = err.response?.data?.message || "Terjadi kesalahan server saat menghapus siswa.";
            alert(`Gagal: ${pesanError}`);
        }
    };

    // Logic Pencarian (Search)
    const filteredSiswa = dataSiswa.filter(s => 
        (s.nama_siswa?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.nisn || '').includes(searchTerm) ||
        (s.nama_kelas?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Master Data Siswa</h2>
                    <p className="text-gray-600">Kelola data siswa, NISN, dan penempatan kelas.</p>
                </div>
                
                {/* Search & Add Button */}
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={fetchData} 
                        className="p-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 shadow-sm transition"
                        title="Refresh Data"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <div className="relative flex-grow md:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari Nama / NISN / Kelas..." 
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-indigo-500 outline-none shadow-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => { setEditingSiswa(null); setIsModalOpen(true); }}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md whitespace-nowrap"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" /> Tambah Siswa
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">NISN</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nama Siswa</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kelas</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={4} className="text-center py-10 text-gray-500">
                                <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500"/>
                                Memuat data siswa...
                            </td></tr>
                        ) : filteredSiswa.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-10 text-gray-500 italic">
                                {searchTerm ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada data siswa.'}
                            </td></tr>
                        ) : (
                            filteredSiswa.map((siswa) => (
                                <tr key={siswa.id} className="hover:bg-indigo-50/20 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{siswa.nisn}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        {siswa.nama_siswa}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                            {siswa.nama_kelas}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => { setEditingSiswa(siswa); setIsModalOpen(true); }} 
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                                title="Edit Siswa"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(siswa.id, siswa.nama_siswa)} 
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition"
                                                title="Hapus Siswa"
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

            {/* Modal Tambah/Edit (Menggunakan KEY untuk reset state otomatis) */}
            <SiswaFormModal 
                key={editingSiswa?.id || 'new'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                initialData={editingSiswa}
                listKelas={listKelas}
            />
        </div>
    );
};

export default DataSiswa;