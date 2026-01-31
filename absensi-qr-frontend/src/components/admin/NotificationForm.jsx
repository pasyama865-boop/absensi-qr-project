import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const NotificationForm = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Anda harus login sebagai admin');
    if (!title) return alert('Judul diperlukan');

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/notifications/broadcast`, { title, body }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle(''); setBody('');
      onCreated && onCreated(res.data);
      alert(`Notifikasi berhasil dibagikan ke ${res.data.createdCount} siswa`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal membuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">Bagikan Notifikasi ke Semua Siswa</h3>
      <div className="grid grid-cols-1 gap-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul notifikasi" className="border p-2 rounded" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Isi notifikasi (opsional)" className="border p-2 rounded" rows={3} />
      </div>

      <div className="mt-3 flex items-center space-x-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Notifikasi ke Semua Siswa'}</button>
        <button type="button" onClick={() => { setTitle(''); setBody(''); }} className="px-3 py-2 border rounded">Reset</button>
      </div>
    </form>
  );
};

export default NotificationForm;
