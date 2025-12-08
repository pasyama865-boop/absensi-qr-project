// src/pages/siswa/MyQrCode.jsx

import React from 'react';
import QRCode from 'react-qr-code'; // Komponen QR Code
import { useAuth } from '../../hooks/useAuth'; // Hook untuk mengambil data user

const MyQrCode = () => {
    const { user } = useAuth();
        const qrValue = user?.id ? String(user.id) : 'INVALID_USER_ID';

    return (
        <div className="p-4 md:p-8 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">QR Code Absensi Saya</h2>
            
            <div className="bg-white p-6 border-4 border-primary rounded-xl shadow-xl">
                {user?.id ? (
                    <QRCode 
                        value={qrValue} 
                        size={256}      
                        level="H"      
                        bgColor="#ffffff"
                        fgColor="#0A0A0A"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                ) : (
                    <p className="text-red-500 text-center">Gagal memuat ID pengguna untuk QR Code.</p>
                )}
            </div>

            <p className="mt-6 text-lg font-medium text-gray-600">
                Tunjukkan kode ini saat melakukan absensi.
            </p>
            <p className="text-sm text-gray-500">
                Data yang dienkripsi: <span className="font-mono text-primary">{qrValue}</span>
            </p>
        </div>
    );
};

export default MyQrCode;