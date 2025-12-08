import React from 'react';
import { useAuth } from '../../hooks/useAuth'; 

const Header = ({ children }) => {
    const { user } = useAuth();
    
    return (
        <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
            {children}
            <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
                Dashboard {user?.role ? `(${user.role.toUpperCase()})` : ''}
            </h1>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                 {user?.username || 'Pengguna'}
                </span>
                {/* Tambahkan notifikasi atau avatar di sini */}
            </div>
        </header>
    );
};

export default Header;