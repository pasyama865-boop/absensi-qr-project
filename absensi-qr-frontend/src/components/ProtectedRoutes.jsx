// src/components/ProtectedRoutes.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// import useAuth from '../hooks/useAuth'; // Anda harus menggunakan hook ini

const ProtectedRoutes = ({ allowedRoles }) => {
    
    // --- Ganti dengan penggunaan useAuth yang sebenarnya ---
    // const { isAuthenticated, user, isLoading } = useAuth();
    
    // Placeholder sementara: Asumsikan Anda mendapatkan peran dari user context
    const isAuthenticated = true; // Ganti ini setelah implementasi useAuth
    const user = { role: 'admin' }; // Ganti ini setelah implementasi useAuth
    const isLoading = false;
    // ----------------------------------------------------

    if (isLoading) {
        return <div className="p-10 text-center text-gray-700">Memuat otentikasi...</div>;
    }

    // 1. Cek Otentikasi
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Cek Peran (Jika role pengguna ada dalam allowedRoles)
    const userHasAccess = allowedRoles && user && allowedRoles.includes(user.role);

    if (!userHasAccess) {
        // Jika tidak memiliki peran yang diizinkan
        return <Navigate to="/unauthorized" replace />;
    }

    // Lanjutkan ke rute anak (Layout dan halaman)
    return <Outlet />; 
};

export default ProtectedRoutes;