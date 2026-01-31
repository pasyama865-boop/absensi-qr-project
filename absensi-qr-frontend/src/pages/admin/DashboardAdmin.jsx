import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  HomeIcon, UserGroupIcon, AcademicCapIcon,
  ClipboardDocumentListIcon, UserIcon, ArrowPathIcon
} from '@heroicons/react/24/solid';
import NotificationForm from '../../components/admin/NotificationForm';

// URL API Backend
const API_STATS_URL = `${import.meta.env.VITE_API_URL}/admin/dashboard-stats`;
const API_TREND_URL = `${import.meta.env.VITE_API_URL}/admin/rekap/trend`;

//  HELPER UTILS 
const getColors = (baseColorHex) => {
    const hexToRgb = (hex) => {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    };
    const rgb = hexToRgb(baseColorHex);
    return {
        stopColor1: `rgba(${rgb}, 0.8)`, 
        stopColor2: `rgba(${rgb}, 0.1)`, 
        lineColor: baseColorHex 
    };
};

//  COMPONENTS 
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white shadow-lg rounded-lg border border-gray-200 text-sm">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-gray-600">Kehadiran: <span className="font-semibold text-lg text-indigo-600">{`${(payload[0].value * 100).toFixed(0)}%`}</span></p>
        </div>
      );
    }
    return null;
};

const StatCard = (props) => {
  const { icon: IconComponent, title, value, bgColor, loading } = props;
  return (
    <div className={`p-6 rounded-xl shadow-xl text-white ${bgColor} transition-transform transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <IconComponent className="w-8 h-8 opacity-75" />
        <ClipboardDocumentListIcon className="w-6 h-6 opacity-40" />
      </div>
      <h3 className="text-3xl font-extrabold mt-4">
        {loading ? <span className="animate-pulse text-2xl">...</span> : value}
      </h3>
      <p className="text-sm font-medium mt-1 opacity-90">{title}</p>
    </div>
  );
};

const StatusItem = ({ status, count, color }) => (
  <div className="flex flex-col items-center justify-center p-3 w-1/4 border-r last:border-r-0 border-gray-100">
    <span className={`text-xs font-semibold uppercase ${color}`}>{status}</span>
    <span className={`text-xl font-bold mt-1 ${color}`}>{count}</span>
  </div>
);

const AttendanceStatusCard = (props) => {
  const { title, date, data = {}, chartColor, icon: IconComponent, loading } = props;

  return (
    <div className="rounded-xl shadow-xl overflow-hidden bg-white h-full flex flex-col">
      <div className={`p-4 text-white ${chartColor}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          {IconComponent && <IconComponent className="w-6 h-6 opacity-80" />}
        </div>
        <p className="text-sm mt-1 opacity-80">{date}</p>
      </div>

      <div className="flex justify-around py-6 bg-white flex-grow items-center">
        {loading ? (
            <div className="text-gray-400 text-sm">Memuat data...</div>
        ) : (
            <>
                <StatusItem status="Hadir" count={data.hadir || 0} color="text-green-600" />
                <StatusItem status="Sakit" count={data.sakit || 0} color="text-red-600" />
                <StatusItem status="Izin" count={data.izin || 0} color="text-yellow-600" />
                <StatusItem status="Alpha" count={data.alpha || 0} color="text-gray-600" />
            </>
        )}
      </div>
    </div>
  );
};

const AttendanceTrendCard = (props) => {
  const { title, data = [], chartColor, isClientReady, loading } = props;
  
  const { stopColor1, stopColor2, lineColor } = getColors(chartColor);
  const safeId = `colorTrend-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="bg-white p-4 rounded-xl shadow-xl h-full flex flex-col">
      <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-500 mb-4">Grafik kehadiran 7 hari terakhir</p>

      <div className="w-full rounded flex-grow" style={{ minHeight: 200 }}> 
        {isClientReady && !loading ? (
            data.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={stopColor1} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={stopColor2} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 10 }} 
                    />
                    <YAxis 
                        tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} 
                        domain={[0, 1]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 10 }} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area
                        type="monotone"
                        dataKey="persentaseHadir"
                        stroke={lineColor}
                        fill={`url(#${safeId})`}
                        strokeWidth={3}
                        activeDot={{ r: 6, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1500}
                    />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Belum ada data absensi minggu ini.
                </div>
            )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm animate-pulse">
            Memuat Grafik...
          </div>
        )}
      </div>
    </div>
  );
};


//  MAIN DASHBOARD COMPONENT
const DashboardAdmin = () => {
  const [summaryData, setSummaryData] = useState({ 
    totalSiswa: 0, totalGuru: 0, totalKelas: 0, totalPetugas: 0,
    hadirSiswa: 0, sakitSiswa: 0, izinSiswa: 0, alphaSiswa: 0,
    hadirGuru: 0, sakitGuru: 0, izinGuru: 0, alphaGuru: 0,
    tanggalHariIni: '-'
  });

  const [trendDataReal, setTrendDataReal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch Statistik Utama & Detail Absensi
        const statsRes = await axios.get(API_STATS_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch Data Grafik Trend
        const trendRes = await axios.get(API_TREND_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setSummaryData(statsRes.data);
        setTrendDataReal(trendRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  // Dummy data kosong untuk Guru (karena fitur absensi guru belum ada)
  const emptyTrendGuru = [
      { date: 'Sen', persentaseHadir: 0 }, { date: 'Sel', persentaseHadir: 0 },
      { date: 'Rab', persentaseHadir: 0 }, { date: 'Kam', persentaseHadir: 0 },
      { date: 'Jum', persentaseHadir: 0 }, { date: 'Sab', persentaseHadir: 0 }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      
      {/* Header & Refresh */}
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <button 
            onClick={fetchData} 
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 shadow-sm transition"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
      </div>

      {/* Form Notifikasi untuk Admin */}
      <div>
        <NotificationForm onCreated={() => fetchData()} />
      </div>

      {/* --- 1. KARTU STATISTIK UTAMA (4 KOLOM) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Jumlah Siswa" value={summaryData.totalSiswa} icon={UserGroupIcon} bgColor="bg-purple-600" loading={loading} />
        <StatCard title="Jumlah Guru" value={summaryData.totalGuru} icon={AcademicCapIcon} bgColor="bg-green-600" loading={loading} />
        <StatCard title="Jumlah Kelas" value={summaryData.totalKelas} icon={HomeIcon} bgColor="bg-teal-500" loading={loading} />
        <StatCard title="Admin/Petugas" value={summaryData.totalPetugas} icon={UserIcon} bgColor="bg-red-500" loading={loading} />
      </div>

      {/* --- 2. STATUS KEHADIRAN HARI INI (BARIS ATAS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceStatusCard
          title="Absensi Siswa Hari Ini"
          date={summaryData.tanggalHariIni}
          data={{
            hadir: summaryData.hadirSiswa, 
            sakit: summaryData.sakitSiswa, 
            izin: summaryData.izinSiswa, 
            alpha: summaryData.alphaSiswa
          }}
          chartColor="bg-purple-600"
          icon={UserGroupIcon}
          loading={loading}
        />

        <AttendanceStatusCard
          title="Absensi Guru Hari Ini"
          date={summaryData.tanggalHariIni}
          data={{
            hadir: summaryData.hadirGuru, 
            sakit: summaryData.sakitGuru, 
            izin: summaryData.izinGuru, 
            alpha: summaryData.alphaGuru
          }}
          chartColor="bg-green-600"
          icon={AcademicCapIcon}
          loading={loading}
        />
      </div>

      {/* --- 3. GRAFIK TREN (BARIS BAWAH) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceTrendCard
          title="Tren Kehadiran Siswa"
          data={trendDataReal}
          chartColor="#6b21a8" 
          isClientReady={isClient}
          loading={loading}
        />

          // Menggunakan data dummy karena fitur belum ada
        <AttendanceTrendCard
          title="Tren Kehadiran Guru"
          data={emptyTrendGuru} 
          chartColor="#047857" 
          isClientReady={isClient}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default DashboardAdmin;