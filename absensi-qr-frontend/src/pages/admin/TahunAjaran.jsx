import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import FormModal from '../../components/FormModal'; 
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'; 

const API_URL = `${import.meta.env.VITE_API_URL}/admin/tahun-ajaran`; 

const TahunAjaran = () => {
  const user = { token: 'TOKEN_DUMMY_ADMIN' };     
  const [dataTahunAjaran, setDataTahunAjaran] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingItem, setEditingItem] = useState(null);
  const handleOpenModal = (itemToEdit = null) => {
    setEditingItem(itemToEdit);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null); // Reset item yang di-edit
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token') || user.token; 
    
    if (!token) {
        setIsLoading(false);
        setError("Autentikasi diperlukan. Silakan login kembali.");
        return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDataTahunAjaran(Array.isArray(response.data) ? response.data : response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil data Tahun Ajaran:", err);
      setError(err.response?.data?.message || "Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  }, [user.token]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  const handleSubmitForm = async (formData) => {
    const token = localStorage.getItem('token') || user.token;
    const isEdit = !!editingItem;
    const url = isEdit ? `${API_URL}/${editingItem.id}` : API_URL;
    const method = isEdit ? axios.put : axios.post;
    
    try {
        await method(url, formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        handleCloseModal();
        await fetchData(); 
        alert(`Tahun Ajaran berhasil di${isEdit ? 'perbarui' : 'tambahkan'}!`);
    } catch (err) {
        alert('Gagal menyimpan data: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Tahun Ajaran "${nama}"?`)) {
        return;
    }
    
    const token = localStorage.getItem('token') || user.token;
    
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        await fetchData();
        alert('Tahun Ajaran berhasil dihapus!');
    } catch (err) {
        alert('Gagal menghapus data: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Master Data Tahun Ajaran</h2>
      
      {/* Tombol Tambah DENGAN ONCLICK HANDLER */}
      <button 
        onClick={() => handleOpenModal(null)} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition mb-6"
      >
        + Tambah Tahun Ajaran Baru
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center p-8 text-gray-600">
          Memuat data...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Ajaran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataTahunAjaran.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data Tahun Ajaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                dataTahunAjaran.map((item) => (
                  // Item.id harus unik
                  <tr key={item.id}> 
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.nama || 'Nama TA Tidak Ada'} 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded-full hover:bg-indigo-50"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, item.nama)} 
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Komponen Modal yang akan tampil */}
      <FormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm} 
        initialData={editingItem} 
      />

    </div>
  );
};

export default TahunAjaran;