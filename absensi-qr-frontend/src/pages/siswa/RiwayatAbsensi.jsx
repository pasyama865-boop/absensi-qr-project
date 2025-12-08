import React, { useState, useEffect } from 'react';

const DUMMY_RIWAYAT = [
    { id: 1, tanggal: '2025-10-20', waktu: '07:15', mata_pelajaran: 'Matematika', status: 'Hadir', keterangan: null },
    { id: 2, tanggal: '2025-10-20', waktu: '10:00', mata_pelajaran: 'Fisika', status: 'Hadir', keterangan: null },
    { id: 3, tanggal: '2025-10-19', waktu: '07:10', mata_pelajaran: 'Bahasa Indonesia', status: 'Terlambat', keterangan: 'Kena macet' },
    { id: 4, tanggal: '2025-10-18', waktu: '07:05', mata_pelajaran: 'Kimia', status: 'Sakit', keterangan: 'Surat dokter' },
];

const RiwayatAbsensi = () => {
    const [riwayat, setRiwayat] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Diaktifkan kembali

    useEffect(() => {
        const fetchRiwayat = () => {
            setIsLoading(true);

            try {
                setTimeout(() => {
                    setRiwayat(DUMMY_RIWAYAT); 
                    setError(null);
                    setIsLoading(false);
                }, 1000);

            } catch (err) {
                console.error("Fetch Error:", err); 
                setError(err.message || "Gagal memuat riwayat absensi."); 
                setIsLoading(false);
            }
        };

        fetchRiwayat();
        
    }, []); 

    const getStatusClasses = (status) => {
        switch (status) {
            case 'Hadir': return 'bg-green-100 text-green-800';
            case 'Terlambat': return 'bg-yellow-100 text-yellow-800';
            case 'Sakit': return 'bg-blue-100 text-blue-800';
            case 'Izin': return 'bg-indigo-100 text-indigo-800';
            case 'Alpha': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Riwayat Absensi Saya</h2>
            
            {isLoading ? (
                <div className="text-center p-10">Memuat data...</div>
            ) : error ? ( 
                <div className="text-center p-10 text-red-500">{error}</div>
            ) : riwayat.length === 0 ? (
                <div className="text-center p-10 text-gray-500 border rounded-lg bg-white">
                    Anda belum memiliki riwayat absensi.
                </div>
            ) : (
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* ... (Tabel Riwayat) ... */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {riwayat.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.tanggal}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.waktu}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.mata_pelajaran}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.keterangan || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RiwayatAbsensi;