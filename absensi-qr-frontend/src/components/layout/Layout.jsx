import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from '../shared/Header';
import { Bars3Icon } from '@heroicons/react/24/outline';

const Layout = ({ role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50"> 
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <Sidebar role={role} />
      </aside>

      {/* Mobile Sidebar (Responsive) */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div className="w-64 h-full bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <Sidebar role={role} />
        </div>
      </div>

      {/* Main Content Area */}
      {/* PERBAIKAN: Gunakan flex-col h-full untuk menampung Header dan Main */}
      <div className="flex flex-col flex-1 overflow-hidden h-full"> 
        
        {/* Header/Navbar (Tinggi ditentukan oleh konten) */}
        <Header>
            <button 
                className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Bars3Icon className="w-6 h-6" />
            </button>
        </Header>

        {/* Page Content (Mengisi sisa ruang yang tersedia) */}
        {/* PERBAIKAN RECHARTS: main H-FULL + FLEX-GROW untuk mengisi sisa ruang setelah header */}
        <main className="flex-grow overflow-x-hidden overflow-y-auto p-4 md:p-8 h-full"> 
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;