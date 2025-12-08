import React from 'react';
import { sidebarConfig } from '../../config/sidebarConfig';
import SidebarItem from './SidebarItem';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ role }) => {
  const { logout } = useAuth();
  const config = sidebarConfig[role] || [];
  
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 border-r border-gray-700 shadow-2xl overflow-y-auto">
      
      {/* App Title/Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-extrabold text-primary">Absensi QR</h1>
      </div>

      {/* Navigation Links (Scrollable area) */}
      <nav className="flex-1 p-4 space-y-4"> 
        {config.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-1">
            
            {/* Header Section (Kategori) */}
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-3 pt-2 pb-1">
              {section.section}
            </h3>
            
            {/* Daftar Item */}
            {section.items.map((item, itemIndex) => (
                <SidebarItem
                  key={itemIndex}
                  item={item}
                  onClick={handleLogout} 
                />
            ))}
          </div>
        ))}
      </nav>
      
      {/* Footer / Info */}
      <div className="p-4 border-t border-gray-700 text-xs text-center text-gray-500">
          © {new Date().getFullYear()} Muhamad ali pasha
      </div>
    </div>
  );
};

export default Sidebar;