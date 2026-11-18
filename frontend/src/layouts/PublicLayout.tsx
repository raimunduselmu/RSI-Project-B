import { Link, NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/format';

const NAV = [
  { to: '/', label: 'Beranda' },
  { to: '/peminjaman', label: 'Peminjaman' },
  { to: '/kegiatan', label: 'Kegiatan' },
  { to: '/intensi', label: 'Intensi Misa' },
  { to: '/pastoral', label: 'Pendampingan' },
  { to: '/cek-status', label: 'Cek Status' },
];

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-brand-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold text-brand-700">KMK UNS</Link>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end className={({ isActive }) => cn('rounded-lg px-3 py-1.5 text-sm', isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-600 hover:bg-stone-100')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/login" className="text-sm font-medium text-brand-600">Masuk Pengurus</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Keluarga Mahasiswa Katolik UNS
      </footer>
    </div>
  );
}
