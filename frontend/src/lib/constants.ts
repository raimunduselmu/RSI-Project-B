export type RoleName = 'Admin' | 'Sarpras' | 'PHT' | 'Liturgi' | 'Bendahara' | 'Pastor';

export interface MenuItem {
  label: string;
  to: string;
  roles?: RoleName[];      // kosong = semua pengguna login
}

/** Menu sidebar dashboard; disaring berdasarkan role (Admin melihat semua). */
export const MENU: MenuItem[] = [
  { label: 'Dashboard', to: '/app' },
  { label: 'Aset', to: '/app/assets', roles: ['Sarpras', 'PHT'] },
  { label: 'Peminjaman', to: '/app/loans', roles: ['Sarpras', 'PHT'] },
  { label: 'Pemeliharaan', to: '/app/maintenance', roles: ['Sarpras'] },
  { label: 'Stock Opname', to: '/app/stocktakes', roles: ['Sarpras'] },
  { label: 'Data Umat', to: '/app/members', roles: ['PHT', 'Pastor'] },
  { label: 'Kepengurusan', to: '/app/organization' },
  { label: 'Liturgi', to: '/app/liturgy', roles: ['Liturgi', 'PHT', 'Pastor'] },
  { label: 'Kegiatan', to: '/app/events' },
  { label: 'Keuangan', to: '/app/finance', roles: ['Bendahara', 'PHT'] },
  { label: 'Iuran Kas', to: '/app/kas' },
  { label: 'Pastoral', to: '/app/pastoral', roles: ['Pastor', 'Liturgi'] },
  { label: 'Dokumen', to: '/app/documents' },
  { label: 'Pengguna', to: '/app/admin/users', roles: ['Admin'] },
  { label: 'Pengaturan', to: '/app/admin/settings', roles: ['Admin', 'Bendahara'] },
  { label: 'Workflow', to: '/app/admin/workflows', roles: ['Admin', 'PHT'] },
  { label: 'Audit Log', to: '/app/admin/audit', roles: ['Admin'] },
];
