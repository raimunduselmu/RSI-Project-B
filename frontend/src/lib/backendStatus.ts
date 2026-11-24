// Halaman yang endpoint backend-nya MASIH 501 (ERR-SYS-02 "Belum diimplementasikan").
// Selama terdaftar di sini, halaman menampilkan DATA CONTOH dan layout memberi spanduk peringatan.
// Setelah endpoint selesai di backend: sambungkan halamannya (useFetch/usePaged) lalu HAPUS barisnya dari daftar ini.
//
// Endpoint yang SUDAH jadi di backend (per 24 Nov 2026): auth, assets, loans, asset-categories, rooms,
// availability, calendar, public/status (PJM). Halaman untuk modul itu sudah memakai data asli.

export const PENDING_BACKEND: { path: string; endpoint: string; publicOnly?: boolean }[] = [
  { path: '/dashboard/overview', endpoint: 'GET /dashboard' },
  { path: '/notifications', endpoint: 'GET /notifications' },
  { path: '/usage/report', endpoint: 'POST /usage-reports' },
  { path: '/maintenance', endpoint: 'GET/POST /maintenance-schedules' },
  { path: '/incidents', endpoint: 'GET/POST /incidents' },
  { path: '/reports', endpoint: 'GET /dashboard/export' },
  { path: '/committees', endpoint: 'GET/POST /events' },
  { path: '/stocktake', endpoint: 'GET/POST /stocktakes' },
  { path: '/admin/audit-logs', endpoint: 'GET /admin/audit-logs' },
  { path: '/members', endpoint: 'GET/POST /members' },
  { path: '/members/:id/records', endpoint: 'GET/POST /members/:id/records' },
  { path: '/admin/periods', endpoint: 'GET/POST /periods, /officers' },
  { path: '/handover', endpoint: 'GET/POST /handovers' },
  { path: '/liturgy/schedule', endpoint: 'GET/POST /liturgy-schedules' },
  { path: '/liturgy/assignments', endpoint: 'GET/POST /liturgy-schedules/:id/assignments' },
  { path: '/events', endpoint: 'GET/POST /events (publik: GET /public/events)' },
  { path: '/events/:id/participants', endpoint: 'GET/POST /events/:id/registrations' },
  { path: '/events/:id/lpj', endpoint: 'GET /events/:id/report' },
  { path: '/finance/donations', endpoint: 'GET/POST /donations' },
  { path: '/finance/cash', endpoint: 'GET/POST /finance/cash-transactions, /finance/budgets' },
  { path: '/finance/reports', endpoint: 'GET /finance/reports' },
  { path: '/finance/dues/verify', endpoint: 'GET /kas/payments, POST approve/reject' },
  { path: '/finance/loan-payments', endpoint: 'POST /finance/cash-transactions' },
  { path: '/finance/dues', endpoint: 'GET /kas/dues/me, POST /kas/payments' },
  { path: '/announcements', endpoint: 'pengumuman & templat notifikasi' },
  { path: '/documents', endpoint: 'GET/POST /documents' },
  { path: '/admin/workflows', endpoint: 'GET /workflows' },
  { path: '/admin/users', endpoint: 'GET/POST /users' },
  { path: '/admin/settings', endpoint: 'GET/PATCH /settings' },
  { path: '/pastoral/intentions', endpoint: 'GET/POST /mass-intentions' },
  { path: '/pastoral/care', endpoint: 'GET/POST /pastoral-cares' },
  { path: '/transparansi', endpoint: 'GET /public/donor-transparency', publicOnly: true },
];

const match = (pattern: string, path: string) => {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  return a.length === b.length && a.every((seg, i) => seg.startsWith(':') || seg === b[i]);
};

export const pendingFor = (pathname: string) => PENDING_BACKEND.find((p) => match(p.path, pathname));
