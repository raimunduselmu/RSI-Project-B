import type { IconName } from '@/components/ui/Icon';

export type RoleName = 'Admin' | 'Sarpras' | 'PHT' | 'Liturgi' | 'Bendahara' | 'Pastor';

export interface MenuItem {
  label: string;
  to: string;
  icon: IconName;
  scr: string;
  roles?: RoleName[]; // kosong = semua pengguna login (Admin selalu boleh)
}

export interface MenuGroup {
  id: string;
  label: string;
  icon: IconName; // ikon grup saat sidebar diciutkan
  items: MenuItem[];
}

/** Menu utama (selalu tampil di atas). Route mengikuti FSD v1.2 §3.1. */
export const MENU_TOP: MenuItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: 'home', scr: 'SCR-03' },
  { label: 'Dashboard Lintas Modul', to: '/dashboard/overview', icon: 'grid', scr: 'SCR-39' },
  { label: 'Notifikasi', to: '/notifications', icon: 'bell', scr: 'SCR-18' },
];

/** Grup menu sidebar sesuai mockup FSD v1.2; disaring berdasarkan role (RBAC §4.3). */
export const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'sarpras',
    label: 'Sarana Prasarana',
    icon: 'package',
    items: [
      { label: 'Aset', to: '/assets', icon: 'package', scr: 'SCR-05' },
      { label: 'Peminjaman', to: '/admin/loans', icon: 'clipboard', scr: 'SCR-10', roles: ['Sarpras', 'PHT'] },
      { label: 'Lapor Pemakaian', to: '/usage/report', icon: 'notebook', scr: 'SCR-11' },
      { label: 'Pemeliharaan', to: '/maintenance', icon: 'wrench', scr: 'SCR-12' },
      { label: 'Kehilangan & Kerusakan', to: '/incidents', icon: 'alert', scr: 'SCR-13' },
      { label: 'Pemeriksaan Fisik', to: '/stocktake', icon: 'scan', scr: 'SCR-14', roles: ['Sarpras'] },
      { label: 'Cetak Label', to: '/assets/labels', icon: 'tag', scr: 'SCR-20', roles: ['Sarpras'] },
      { label: 'Laporan Inventaris', to: '/reports', icon: 'chart', scr: 'SCR-16' },
    ],
  },
  {
    id: 'keumatan',
    label: 'Keumatan & Organisasi',
    icon: 'users',
    items: [
      { label: 'Data Umat', to: '/members', icon: 'users', scr: 'SCR-21', roles: ['PHT', 'Pastor'] },
      { label: 'Periode & Jabatan', to: '/admin/periods', icon: 'landmark', scr: 'SCR-23' },
      { label: 'Serah Terima', to: '/handover', icon: 'fork', scr: 'SCR-24' },
      { label: 'Kepanitiaan Proker', to: '/committees', icon: 'userCheck', scr: 'SCR-17' },
    ],
  },
  {
    id: 'liturgi',
    label: 'Liturgi & Kegiatan',
    icon: 'book',
    items: [
      { label: 'Jadwal Ibadah', to: '/liturgy/schedule', icon: 'book', scr: 'SCR-25' },
      { label: 'Petugas Liturgi', to: '/liturgy/assignments', icon: 'userCheck', scr: 'SCR-26', roles: ['Liturgi', 'PHT', 'Pastor'] },
      { label: 'Kegiatan', to: '/events', icon: 'calendarDays', scr: 'SCR-27' },
    ],
  },
  {
    id: 'keuangan',
    label: 'Keuangan',
    icon: 'wallet',
    items: [
      { label: 'Persembahan & Donasi', to: '/finance/donations', icon: 'handHeart', scr: 'SCR-30', roles: ['Bendahara', 'PHT'] },
      { label: 'Kas & Anggaran', to: '/finance/cash', icon: 'wallet', scr: 'SCR-31', roles: ['Bendahara', 'PHT'] },
      { label: 'Pembayaran Peminjaman', to: '/finance/loan-payments', icon: 'receipt', scr: 'SCR-32', roles: ['Bendahara', 'Sarpras', 'PHT'] },
      { label: 'Laporan Keuangan', to: '/finance/reports', icon: 'pie', scr: 'SCR-33', roles: ['Bendahara', 'PHT'] },
      { label: 'Iuran Kas', to: '/finance/dues', icon: 'card', scr: 'SCR-40', roles: ['Sarpras', 'PHT', 'Liturgi', 'Bendahara'] },
      { label: 'Verifikasi Iuran', to: '/finance/dues/verify', icon: 'shieldCheck', scr: 'SCR-41', roles: ['Bendahara', 'PHT'] },
    ],
  },
  {
    id: 'pastoral',
    label: 'Pastoral',
    icon: 'church',
    items: [
      { label: 'Intensi Misa', to: '/pastoral/intentions', icon: 'church', scr: 'SCR-34', roles: ['Pastor', 'Liturgi'] },
      { label: 'Pendampingan', to: '/pastoral/care', icon: 'heartHandshake', scr: 'SCR-35', roles: ['Pastor'] },
    ],
  },
  {
    id: 'admin',
    label: 'Administrasi',
    icon: 'settings',
    items: [
      { label: 'Pengumuman', to: '/announcements', icon: 'megaphone', scr: 'SCR-36', roles: ['Sarpras', 'PHT', 'Liturgi', 'Pastor'] },
      { label: 'Dokumen & Arsip', to: '/documents', icon: 'archive', scr: 'SCR-38' },
      { label: 'Workflow Persetujuan', to: '/admin/workflows', icon: 'workflow', scr: 'SCR-37', roles: ['PHT'] },
      { label: 'Pengguna', to: '/admin/users', icon: 'key', scr: 'SCR-04', roles: ['Sarpras'] },
      { label: 'Audit Log', to: '/admin/audit-logs', icon: 'history', scr: 'SCR-19', roles: ['Sarpras', 'PHT'] },
      { label: 'Pengaturan', to: '/admin/settings', icon: 'settings', scr: 'SCR-42', roles: ['Bendahara'] },
    ],
  },
];

/** Navigasi publik (SCR-00 dst). */
export const PUBLIC_NAV = [
  { to: '/calendar', label: 'Kalender' },
  { to: '/liturgy/schedule', label: 'Jadwal Ibadah' },
  { to: '/events', label: 'Kegiatan' },
  { to: '/transparansi', label: 'Transparansi' },
  { to: '/status', label: 'Cek Status' },
];

export const PERIODE_AKTIF = '2026/2027';
