import { 
    HomeIcon, 
    UserGroupIcon, 
    AcademicCapIcon, 
    CalendarIcon, 
    Cog8ToothIcon, 
    ClockIcon, 
    QrCodeIcon, 
    ListBulletIcon, 
    ArrowLeftOnRectangleIcon, 
    ClipboardDocumentListIcon, 
    BookOpenIcon, 
    UserIcon,
    CameraIcon 
} from '@heroicons/react/24/outline';

export const sidebarConfig = {
    admin: [
        { 
            section: 'UTAMA', 
            items: [
                { name: 'Dashboard', path: '/admin', icon: HomeIcon },
            ]
        },
        
        { 
            section: 'REKAPITULASI', 
            items: [
                { name: 'Kehadiran Hari Ini', path: '/admin/kehadiran', icon: ClockIcon }, 
                { name: 'Laporan Absensi', path: '/admin/rekap', icon: ClipboardDocumentListIcon },
            ]
        },

        { 
            section: 'MASTER DATA', 
            items: [
                { name: 'Tahun Ajaran', path: '/admin/tahun-ajaran', icon: CalendarIcon },
            ]
        },

        { 
            section: 'MANAJEMEN KELAS', 
            items: [
                { name: 'Data Siswa', path: '/admin/siswa', icon: UserGroupIcon },
                { name: 'Wali Kelas', path: '/admin/wali-kelas', icon: UserIcon },
                { name: 'Data Kelas', path: '/admin/kelas', icon: BookOpenIcon },
                { name: 'Generate QR', path: '/admin/qr-generator', icon: QrCodeIcon },
            ]
        },
        
        { 
            section: 'PENGATURAN', 
            items: [
                { name: 'Pengaturan', path: '/admin/pengaturan', icon: Cog8ToothIcon },
                { name: 'Log Out', path: '/logout', icon: ArrowLeftOnRectangleIcon, isLogout: true },
            ]
        },
    ],
    
    guru: [
        { 
            section: 'UTAMA', 
            items: [
                { name: 'Dashboard', path: '/guru', icon: HomeIcon },
            ]
        },
        { 
            section: 'AKTIVITAS', 
            items: [
                { name: 'Scan Absensi', path: '/guru/scan', icon: CameraIcon },
            ]
        },
        { 
            section: 'LAPORAN', 
            items: [
                { name: 'Kehadiran Hari Ini', path: '/guru/kehadiran', icon: ClockIcon },
                { name: 'Rekap Absensi', path: '/guru/rekap', icon: ClipboardDocumentListIcon },
            ]
        },
        { 
            section: 'AKUN', 
            items: [
                { name: 'Log Out', path: '/logout', icon: ArrowLeftOnRectangleIcon, isLogout: true },
            ]
        }
    ],

    siswa: [
        { 
            section: 'UTAMA', 
            items: [
                { name: 'Dashboard', path: '/siswa', icon: HomeIcon },
            ]
        },
        { 
            section: 'ABSENSI', 
            items: [
                { name: 'QR Code Saya', path: '/siswa/my-qr', icon: QrCodeIcon },
                { name: 'Riwayat Absensi', path: '/siswa/riwayat', icon: ListBulletIcon },
            ]
        },
        { 
            section: 'AKUN', 
            items: [
                { name: 'Log Out', path: '/logout', icon: ArrowLeftOnRectangleIcon, isLogout: true },
            ]
        }
    ]
};


const getSidebarConfig = (role) => {
    return sidebarConfig[role] || sidebarConfig.admin; 
};

export default getSidebarConfig;