import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  QrCodeIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ArrowLeftOnRectangleIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CloudArrowDownIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

// ----- KONFIGURASI API -----
const API_GURU_DASHBOARD_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api") +
  "/guru/dashboard";
const API_ABSENSI_SCAN_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api") +
  "/absensi/scan";

/*
  KOMPONEN: Kartu Statistik
*/
const ModernStatCard = ({ title, small, value, icon, colorClass, bgClass }) => {
  const Icon = icon;
  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgClass} ${colorClass} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
          </div>
          <div>
            <div className="text-xs text-gray-500">{title}</div>
            {small && <div className="text-xs text-gray-400">{small}</div>}
          </div>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
};


const StatusBadge = ({ status }) => {
  if (!status) return <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Belum Scan</span>;
  if (status === "Hadir") return <span className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-700">Hadir</span>;
  if (status === "Terlambat") return <span className="px-3 py-1 text-xs rounded-full bg-rose-50 text-rose-600">Terlambat</span>;
  if (status === "Sakit") return <span className="px-3 py-1 text-xs rounded-full bg-yellow-50 text-yellow-600">Sakit</span>;
  if (status === "Izin") return <span className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">Izin</span>;
  return <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
};

/*
  KOMPONEN: Widget Scanner (Tertanam)
*/
const ScannerWidget = ({
  isActive,
  onClose,
  onInitScanner,
  mountId = "dashboard-scanner",
  hint,
  status,
  lastResult
}) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white scroll-mt-24">
      {/* Header Widget */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
            <QrCodeIcon className="w-12 h-12 text-white/80" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold">Scanner Absensi</h3>
            <p className="mt-2 text-sm text-indigo-100 max-w-lg">
              Fitur ini menggunakan kamera perangkat Anda. Pastikan pencahayaan ruangan cukup terang agar QR Code terbaca dengan cepat.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              {!isActive ? (
                <button
                  onClick={() => onInitScanner(mountId)}
                  className="px-6 py-2.5 bg-white text-indigo-700 rounded-lg font-bold shadow hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <CameraIcon className="w-5 h-5" />
                  Aktifkan Kamera
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-red-500/20 border border-red-200/30 text-white rounded-lg font-semibold hover:bg-red-500/30 transition flex items-center gap-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Matikan Kamera
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Area Kamera */}
      <div className="bg-slate-50 p-4 min-h-[100px] relative transition-all duration-300">
        
        {/* Container Video HTML5-QRCode */}
        <div 
            id={mountId} 
            className={`rounded-xl overflow-hidden bg-black mx-auto max-w-md shadow-inner border-4 border-white transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 h-0'}`}
        ></div>
        
        {/* Placeholder saat mati */}
        {!isActive && (
           <div className="flex flex-col items-center justify-center text-gray-400 py-8">
             <CameraIcon className="w-12 h-12 mb-2 opacity-30" />
             <div className="text-sm font-medium">Kamera sedang tidak aktif</div>
             <div className="text-xs mt-1 opacity-70 max-w-xs text-center">{hint}</div>
           </div>
        )}

        {/* Status Area (Muncul jika aktif) */}
        {isActive && (
            <div className="mt-4 max-w-md mx-auto space-y-3 animate-in fade-in slide-in-from-bottom-2">
                {/* Status Message */}
                <div className={`p-3 rounded-lg text-center text-sm font-medium border flex items-center justify-center gap-2 shadow-sm
                    ${status?.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                    ${status?.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    ${status?.type === 'loading' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                    ${!status?.type ? 'bg-white text-gray-600 border-gray-200' : ''}
                `}>
                    {status?.type === 'loading' && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                    {status?.type === 'success' && <CheckCircleIcon className="w-4 h-4" />}
                    {status?.type === 'error' && <XCircleIcon className="w-4 h-4" />}
                    <span>{status?.text}</span>
                </div>

                {/* Hasil Terakhir */}
                {lastResult && (
                    <div className="text-center bg-white border border-gray-100 p-2 rounded-lg">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">NISN Terakhir</span>
                        <div className="font-mono text-indigo-600 font-bold text-sm tracking-wide">{lastResult}</div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

/*
  MAIN COMPONENT: DashboardGuru
*/
const DashboardGuru = () => {
  const auth = useAuth();
  const logout = auth?.logout || (() => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanStatus, setScanStatus] = useState({ type: "", text: "Siap memindai QR Code..." });
  const [lastScan, setLastScan] = useState(null);
  const scannerRef = useRef(null); 
  const isScanningRef = useRef(true); 
  const onScanSuccessRef = useRef(null);
  const submitAbsensiRef = useRef(null);
  const fetchData = useCallback(async () => {
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_GURU_DASHBOARD_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Gagal memuat data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, [fetchData]);

  // 3. Fungsi Submit Absensi
  const submitAbsensi = useCallback(async (nisn) => {
    setScanStatus({ type: "loading", text: `Memproses NISN: ${nisn}...` });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        API_ABSENSI_SCAN_URL,
        { nisn },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const message = res.data?.message || "Berhasil";
      const siswa = res.data?.siswa?.nama_siswa || "";
      setScanStatus({ type: "success", text: `${message} • ${siswa}` });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memproses";
      setScanStatus({ type: "error", text: msg });
    }

    setTimeout(() => {
      isScanningRef.current = true;
      setScanStatus({ type: "", text: "Siap memindai siswa berikutnya..." });
    }, 1800);
  }, [fetchData]);

  useEffect(() => { submitAbsensiRef.current = submitAbsensi; }, [submitAbsensi]);

  // 3. Callback Sukses Scan
  const onScanSuccess = useCallback((decodedText) => {
    if (!decodedText) return;
    if (!isScanningRef.current) return;

    isScanningRef.current = false;
    setLastScan(decodedText);

    if (submitAbsensiRef.current) {
        submitAbsensiRef.current(decodedText);
    }
  }, []);

  useEffect(() => { onScanSuccessRef.current = onScanSuccess; }, [onScanSuccess]);

  const initScanner = (mountId = "dashboard-scanner") => {
    if (scannerRef.current) {
      setScannerActive(true);
      return;
    }

    const parent = document.getElementById(mountId);
    if (!parent) return;

    const regionId = `${mountId}-region`;
    if (!document.getElementById(regionId)) {
      const div = document.createElement("div");
      div.id = regionId;
      parent.appendChild(div);
    }

            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 250 }, 
                facingMode: { exact: ["environment", "user"] },
                rememberLastUsedCamera: true
            };    
    const scanner = new Html5QrcodeScanner(regionId, config, false);

    const successWrapper = (decodedText, decodedResult) => {
      if (onScanSuccessRef.current) onScanSuccessRef.current(decodedText, decodedResult);
    };

    try {
      scanner.render(successWrapper, (err) => {
         if (err?.name === "NotAllowedError") {
             setScanStatus({ type: "error", text: "Izin kamera ditolak!" });
         }
      });
      scannerRef.current = scanner;
      isScanningRef.current = true;
      setScannerActive(true);
      setScanStatus({ type: "", text: "Kamera aktif. Arahkan ke QR..." });
    } catch (error) {
      console.error("Scanner Error:", error);
      let errMsg = "Gagal membuka kamera.";
      if (error?.name === "NotAllowedError" || error?.message?.includes("Permission")) {
          errMsg = "Izin kamera ditolak. Cek setting browser.";
      } else if (error?.name === "NotFoundError") {
          errMsg = "Kamera tidak ditemukan.";
      }
      setScanStatus({ type: "error", text: errMsg });
    }
  };

  // 5. Matikan Scanner
  const destroyScanner = () => {
    if (scannerRef.current) {
      try { 
          scannerRef.current.clear(); 
      } catch (error) { 
          console.warn("Gagal membersihkan scanner:", error); 
      }
      scannerRef.current = null;
    }
    isScanningRef.current = false;
    setScannerActive(false);
  };

  // Format Tanggal
  const todayLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4" />
          <div className="w-64 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">Muat Ulang</button>
        </div>
      </div>
    );

  const teacher = dashboardData?.guru || {};
  const isWali = dashboardData?.is_wali_kelas || false;
  const kelasInfo = dashboardData?.kelas_info || {};

  // Hitung Statistik
  const stats = { hadir: 0, sakit: 0, izin: 0, alpha: 0, total: 0 };
  if (isWali && kelasInfo) {
    const h = kelasInfo.kehadiran_hari_ini || {};
    stats.hadir = (h.Hadir || 0) + (h.Terlambat || 0);
    stats.sakit = h.Sakit || 0;
    stats.izin = h.Izin || 0;
    stats.alpha = h.Alpha || 0;
    stats.total = kelasInfo.total_siswa || 0;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans text-gray-900">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm border border-gray-100 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={teacher?.foto || `https://ui-avatars.com/api/?name=${teacher?.nama_guru || "Guru"}&background=random`} 
            alt="profile" 
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-50" 
          />
          <div>
            <div className="text-sm text-gray-500">Selamat datang,</div>
            <div className="text-xl font-bold text-gray-900">{teacher?.nama_guru || "Guru"}</div>
            <div className="text-xs text-indigo-600 font-mono mt-0.5">{teacher?.nip}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
          <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
          <div className="text-sm font-medium text-gray-600">{todayLabel}</div>
          <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block"></div>
          <button title="Logout" onClick={logout} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition text-gray-400">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* GRID UTAMA (Full Width) */}
      <div className="space-y-8">
        
          {/* 1. KARTU STATISTIK */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernStatCard
              title="Total Siswa"
              small="Kelas Anda"
              value={stats.total || kelasInfo.total_siswa || 0}
              icon={UserGroupIcon}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-100"
            />
            <ModernStatCard
              title="Hadir"
              small="Hari Ini"
              value={stats.hadir || 0}
              icon={CheckCircleIcon}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-100"
            />
            <ModernStatCard
              title="Belum Hadir"
              small="Hari Ini"
              value={(stats.total || 0) - (stats.hadir || 0)}
              icon={DocumentDuplicateIcon}
              colorClass="text-slate-600"
              bgClass="bg-slate-100"
            />
            <ModernStatCard
              title="Absen/Alpha"
              small="Hari Ini"
              value={(stats.sakit + stats.izin + stats.alpha) || 0}
              icon={XCircleIcon}
              colorClass="text-rose-600"
              bgClass="bg-rose-100"
            />
          </div>

          {/* 2. WIDGET SCANNER (Disini, Embedded) */}
          <div id="scanner-section">
            <ScannerWidget
              isActive={scannerActive}
              onClose={destroyScanner}
              onInitScanner={(mountId) => initScanner(mountId)}
              mountId="scanner-mount"
              hint="Pastikan area terang dan QR Code bersih."
              status={scanStatus}
              lastResult={lastScan}
            />
          </div>

          {/* 3. TABEL REKAP */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                Rekap Kehadiran Hari Ini
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3 px-4 rounded-tl-lg">Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4 rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {(!kelasInfo?.rekap || kelasInfo.rekap.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                        Belum ada data scan masuk.
                      </td>
                    </tr>
                  )}
                  {(kelasInfo?.rekap || []).map((s, i) => (
                    <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img 
                          src={s.foto || `https://ui-avatars.com/api/?name=${s.nama}&background=random`} 
                          alt="f" 
                          className="w-8 h-8 rounded-full object-cover border border-gray-200" 
                        />
                        <span className="font-semibold">{s.nama}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{s.kelas}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{s.jam || "—"}</td>
                      <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
               <button className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 transition flex items-center justify-center gap-2">
                 <CloudArrowDownIcon className="w-4 h-4" /> Download Rekap
               </button>
            </div>
          </div>

      </div>
    </div>
  );
};

export default DashboardGuru;