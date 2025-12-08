import React, { useState } from 'react';

const FormModal = ({ isOpen, onClose, onSubmit }) => {
  const [nama, setNama] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
        const formData = {
        nama: nama,
        is_active: isActive 
    };
    
    await onSubmit(formData); 

    setIsSubmitting(false);
    setNama('');
    setIsActive(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
            Tambah Tahun Ajaran Baru
        </h3>

        <form onSubmit={handleSubmit}>
          
          {/* Input Nama Tahun Ajaran */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nama">
                Nama Tahun Ajaran (Contoh: 2025/2026 Ganjil)
            </label>
            <input
              type="text"
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Checkbox Status Aktif */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-900" htmlFor="isActive">
                Set Tahun Ajaran ini sebagai AKTIF
            </label>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
              disabled={isSubmitting || !nama}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;