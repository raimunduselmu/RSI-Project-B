import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { PUBLIC_NAV } from '@/lib/constants';
import { cn } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { PendingBackend } from '@/components/shared/PendingBackend';
import { LogoMark } from './DashboardLayout';

/** Layout publik (tanpa login) — navbar gaya FluxEdit, tata letak mengikuti mockup SCR-00. */
export function PublicLayout({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <div className="app-bg" />
      <header className="sticky top-0 z-30 border-b border-slate-900/[0.08] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-3">
            <LogoMark size={34} />
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-wide text-ink">KMK UNS</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">Sistem Terpadu Gereja Kampus</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {PUBLIC_NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn('nav-link flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[12px] transition', isActive ? 'is-active text-ink' : 'text-ink/75 hover:text-ink')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-ember-400 shadow-soft" />}
                    {n.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full border border-slate-900/[0.08] bg-white/80 p-1 pl-4 font-mono text-[12px] text-ink/80 backdrop-blur transition hover:border-ember-300/50 hover:shadow-soft sm:inline-flex"
            >
              Pengurus
              <span className="rounded-full bg-white px-3.5 py-1.5 text-night-900">Masuk</span>
            </Link>
            <button type="button" className="rounded-lg p-2 text-ink hover:bg-ember-50 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              <Icon name={open ? 'x' : 'menu'} size={20} />
            </button>
          </div>
        </div>
        {open && (
          <nav className="anim-drop-in border-t border-slate-900/[0.08] px-4 py-3 lg:hidden">
            {[...PUBLIC_NAV, { to: '/login', label: 'Masuk (Pengurus)' }].map((n, i) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} style={{ animationDelay: `${i * 45}ms` }} className="anim-menu-in nav-item block rounded-lg px-3 py-2 text-sm text-ink/85 hover:bg-ember-50">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <PendingBackend />
        {children ?? <Outlet />}
      </main>

      <footer className="border-t border-slate-900/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 font-mono text-[11px] text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Keluarga Mahasiswa Katolik — Gereja Kampus Universitas Sebelas Maret</span>
          <span>Layanan publik dapat digunakan tanpa login</span>
        </div>
      </footer>
    </div>
  );
}
