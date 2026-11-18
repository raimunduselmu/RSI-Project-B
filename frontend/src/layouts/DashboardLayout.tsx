import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MENU } from '@/lib/constants';
import { cn } from '@/lib/format';

export function DashboardLayout() {
  const { user, hasRole, logout } = useAuth();
  const nav = useNavigate();
  const items = MENU.filter((m) => !m.roles || hasRole(...m.roles));

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col bg-brand-900 text-brand-50 md:flex">
        <div className="px-5 py-4 text-lg font-semibold">KMK UNS</div>
        <nav className="flex-1 space-y-0.5 px-3">
          {items.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.to === '/app'} className={({ isActive }) => cn('block rounded-lg px-3 py-2 text-sm', isActive ? 'bg-brand-700 text-white' : 'text-brand-100 hover:bg-brand-800')}>
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-stone-200 bg-white px-6 py-3">
          <div className="text-right text-sm">
            <div className="font-medium">{user?.full_name}</div>
            <div className="text-xs text-stone-500">{user?.roles.join(', ')}</div>
          </div>
          <button
            className="text-sm text-stone-600 hover:text-red-600"
            onClick={async () => {
              await logout();
              nav('/login');
            }}
          >
            Keluar
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
