import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Cog8ToothIcon, 
    UserCircleIcon, 
    LockClosedIcon, 
    ClockIcon,
    XMarkIcon 
} from '@heroicons/react/24/outline';

const API_BASE = `${import.meta.env.VITE_API_URL}/admin/settings`;

const Pengaturan = () => {
    // State Modals
    const [modalType, setModalType] = useState(null); // 'password', 'profile', 'time'
    const [isLoading, setIsLoading] = useState(false);
    
    // Data States
    const [systemSettings, setSystemSettings] = useState({ jam_masuk_mulai: '', jam_masuk_akhir: '' });
    
    // Form States
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [profileForm, setProfileForm] = useState({ username: '' });

    // Fetch Initial Settings saat halaman dibuka
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/system`, { headers: { Authorization: `Bearer ${token}` } });
            if(res.data) setSystemSettings(res.data);
        } catch (err) {
            console.error("Gagal load settings:", err);
        }
    };

    const closeModal = () => {
        setModalType(null);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };

    // --- HANDLERS (FUNGSI TOMBOL) ---

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return alert("Konfirmasi password baru tidak cocok!");
        }
        
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/password`, 
                { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Password berhasil diubah! Silakan login ulang untuk memverifikasi.");
            closeModal();
        } catch (err) {
            // TANGKAP ERROR DENGAN LEBIH BAIK
            console.error("Password Submit Error:", err.response || err);
            alert(err.response?.data?.message || `Gagal mengubah password. Status: ${err.response?.status || 'Network Error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/profile`, 
                { username: profileForm.username },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Profil berhasil diperbarui. Silakan login ulang nanti dengan username baru.");
            closeModal();
        } catch (err) {
            // TANGKAP ERROR DENGAN LEBIH BAIK
            console.error("Profile Submit Error:", err.response || err);
            alert(err.response?.data?.message || `Gagal update profil. Status: ${err.response?.status || 'Network Error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTimeSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE}/system`, 
                systemSettings,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Pengaturan waktu berhasil disimpan!");
            closeModal();
            fetchSettings(); // Refresh data tampilan
        } catch (err) {
            // TANGKAP ERROR DENGAN LEBIH BAIK
            console.error("Time Submit Error:", err.response || err);
            alert(err.response?.data?.message || `Gagal menyimpan pengaturan waktu. Status: ${err.response?.status || 'Network Error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Cog8ToothIcon className="w-8 h-8 mr-2 text-indigo-600" />
                Pengaturan Sistem Admin
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. KARTU GANTI PASSWORD */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                    <LockClosedIcon className="w-10 h-10 text-red-500 mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Keamanan Akun</h3>
                    <p className="text-gray-600 mb-4 text-sm">Ganti kata sandi akun Admin Anda secara berkala untuk menjaga keamanan.</p>
                    <button 
                        onClick={() => setModalType('password')}
                        className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition w-full"
                    >
                        Ganti Password
                    </button>
                </div>

                {/* 2. KARTU EDIT PROFIL */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                    <UserCircleIcon className="w-10 h-10 text-blue-500 mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Profil Admin</h3>
                    <p className="text-gray-600 mb-4 text-sm">Perbarui Username admin yang digunakan untuk login ke dashboard.</p>
                    <button 
                        onClick={() => setModalType('profile')}
                        className="text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition w-full"
                    >
                        Edit Username
                    </button>
                </div>
                
                {/* 3. KARTU ATUR WAKTU */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                    <ClockIcon className="w-10 h-10 text-green-500 mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Waktu Absensi</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                        Jam Masuk Saat Ini:<br/>
                        <span className="font-bold text-lg text-gray-800">
                            {systemSettings.jam_masuk_mulai?.slice(0,5)} - {systemSettings.jam_masuk_akhir?.slice(0,5)}
                        </span>
                    </p>
                    <button 
                        onClick={() => setModalType('time')}
                        className="text-sm font-medium text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition w-full"
                    >
                        Atur Jam Masuk
                    </button>
                </div>
            </div>

            {/* --- MODALS --- */}
            {modalType && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
                            <h3 className="text-lg font-bold text-gray-800">
                                {modalType === 'password' && 'Ganti Password'}
                                {modalType === 'profile' && 'Edit Profil Admin'}
                                {modalType === 'time' && 'Atur Waktu Absensi'}
                            </h3>
                            <button onClick={closeModal}><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
                        </div>

                        <div className="p-6">
                            {/* FORM PASSWORD */}
                            {modalType === 'password' && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Password Lama</label>
                                        <input type="password" required className="w-full border rounded p-2"
                                            value={passwordForm.oldPassword}
                                            onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                                        <input type="password" required className="w-full border rounded p-2"
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                                        <input type="password" required className="w-full border rounded p-2"
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
                                        {isLoading ? 'Menyimpan...' : 'Simpan Password'}
                                    </button>
                                </form>
                            )}

                            {/* FORM PROFIL */}
                            {modalType === 'profile' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Username Baru</label>
                                        <input type="text" required className="w-full border rounded p-2"
                                            value={profileForm.username}
                                            onChange={e => setProfileForm({...profileForm, username: e.target.value})}
                                            placeholder="admin_baru"
                                        />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                                        {isLoading ? 'Menyimpan...' : 'Simpan Profil'}
                                    </button>
                                </form>
                            )}

                            {/* FORM WAKTU */}
                            {modalType === 'time' && (
                                <form onSubmit={handleTimeSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Jam Mulai Masuk</label>
                                        <input type="time" required className="w-full border rounded p-2"
                                            value={systemSettings.jam_masuk_mulai}
                                            onChange={e => setSystemSettings({...systemSettings, jam_masuk_mulai: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Batas Akhir Masuk (Terlambat)</label>
                                        <input type="time" required className="w-full border rounded p-2"
                                            value={systemSettings.jam_masuk_akhir}
                                            onChange={e => setSystemSettings({...systemSettings, jam_masuk_akhir: e.target.value})}
                                        />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
                                        {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pengaturan;