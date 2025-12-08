import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ item, onClick }) => {
  const Icon = item.icon;

  return (
    <NavLink 
      to={item.path} 
      className={({ isActive }) => 
        `flex items-center p-3 text-sm font-medium transition-all duration-300 cursor-pointer 
        ${
          isActive 
            ? 'bg-primary text-white shadow-xl rounded-xl' 
            : 'text-gray-300 hover:bg-gray-700 rounded-lg group'
        }`
      }
      onClick={item.isLogout ? onClick : null}
      end 
    >
      {({ isActive }) => (
        <>
          {/* Ikon: Teks abu-abu terang untuk inaktif */}
          <Icon className={`w-5 h-5 mr-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
          
          {/* Nama Menu */}
          <span>{item.name}</span>
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;