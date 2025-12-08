import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TrashIcon, PencilIcon, UserGroupIcon, PlusCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';

// URL API Guru
const API_URL = `${import.meta.env.VITE_API_URL}/admin/guru`;

// ==========================================================
// 1. KOMPONEN MODAL FORM GURU
// Didefinisikan di atas untuk mencegah error calling/hoisting
// ==========================================================
const GuruFormModal = ({ onClose, onSubmit, initialData }) => {
    const isEdit = !!initialData;

    // --- INISIALISASI STATE (Hanya berjalan sekali saat Modal dibuka/Mount) ---
    const defaultNip = initialData?.nip || '';
    const defaultNama = initialData?.nama_guru || '';
    const defaultNoTelp = initialData?.no_telp || '';
    const defaultUsername = initialData?.username || '';
    
    // State Form
    const [nip, setNip] = useState(defaultNip);
    const [nama, setNama] = useState(defaultNama);
    const [noTelp, setNoTelp] = useState(defaultNoTelp);
    const [username, setUsername] = useState(defaultUsername);
    const [password, setPassword] = useState(''); // Password hanya diisi saat mode Tambah
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- HANDLER SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi wajib
        if (!nip || !nama || !username || (!isEdit && !password)) {
            alert("NIP, Nama, Username, dan Password (untuk mode Tambah) wajib diisi!");
            return;
        }

        setIsSubmitting(true);
        const formData = {
            nip,
            nama: nama, 
            no_telp: noTelp || null,
            username,
            password: isEdit ? undefined : password, // Hanya kirim password saat mode Tambah
        };

        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                {/* Header Modal */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">
                        {isEdit ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                    </h3>
                    <button onClick={onClose} type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* NIP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                            <input
                                type="text"
                                value={nip}
                                onChange={(e) => setNip(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="NIP Guru"
                                required
                                disabled={isEdit} // NIP (Primary ID Guru) biasanya tidak boleh diubah
                            />
                        </div>

                        {/* Nama Guru */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Nama Guru"
                                required
                            />
                        </div>

                        {/* No Telp */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon (Opsional)</label>
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={noTelp}
                                    onChange={(e) => setNoTelp(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Contoh: 0812xxxxxx"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username Login</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Username untuk login"
                                required
                            />
                        </div>

                        {/* Password (Hanya untuk Tambah) */}
                        {!isEdit && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Password awal"
                                    required
                                />
                            </div>
                        )}
                        {/* Note Edit Password */}
                        {isEdit && (
                             <p className="text-sm text-gray-500 md:col-span-2 mt-[-10px]">
                                * Untuk mengubah password, silakan gunakan menu Reset Password terpisah.
                            </p>
                        )}
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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Guru')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================================
// 2. KOMPONEN UTAMA (DATA GURU)
// ==========================================================
const DataGuru = () => {
    // --- STATE UTAMA ---
    const [dataGuru, setDataGuru] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

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
            const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
            
            const items = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setDataGuru(items);
            setError(null);
        } catch (err) {
            console.error("Gagal mengambil data Guru:", err);
            setError(err.response?.data?.message || "Gagal terhubung ke server.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HANDLERS ---
    const handleOpenModal = (itemToEdit = null) => {
        setEditingItem(itemToEdit);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    // --- CRUD ACTION ---
    const handleSubmitForm = async (formData) => {
        const token = localStorage.getItem('token');
        const isEdit = !!editingItem;
        
        const config = {
            method: isEdit ? 'put' : 'post',
            url: isEdit ? `${API_URL}/${editingItem.id}` : API_URL,
            data: formData,
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            await axios(config);
            handleCloseModal();
            fetchData(); 
            alert(`Data Guru berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`);
        } catch (err) {
            console.error("Gagal menyimpan:", err);
            const msg = err.response?.data?.message || 'Server error saat menyimpan data.';
            alert(`Gagal: ${msg}`);
        }
    };

    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Yakin ingin menghapus guru "${nama}"?\nAkun user guru ini juga akan terhapus. Pastikan guru ini tidak memiliki relasi sebagai Wali Kelas atau data Absensi.`)) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
            alert('Data guru berhasil dihapus!');
        } catch (err) {
            console.error("Gagal menghapus:", err);
            alert('Gagal menghapus: ' + (err.response?.data?.message || 'Server error'));
        }
    };

    // --- RENDER ---
    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Master Data Guru</h2>
                    <p className="text-gray-600 text-sm mt-1">Kelola data guru dan akun login.</p>
                </div>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition flex items-center focus:outline-none"
                >
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    + Tambah Guru
                </button>
            </div>

            {/* Loading & Error */}
            {isLoading && (
                <div className="text-center p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <span className="text-gray-500">Memuat data guru...</span>
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
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIP</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Guru</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No. Telp</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataGuru.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                            Belum ada data guru.
                                        </td>
                                    </tr>
                                ) : (
                                    dataGuru.map((item, index) => (
                                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {item.nip}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.nama_guru}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.no_telp || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50"
                                                        title="Edit Guru"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id, item.nama_guru)}
                                                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                                        title="Hapus Guru"
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
                <GuruFormModal
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitForm}
                    initialData={editingItem}
                />
            )}
        </div>
    );
};

export default DataGuru;