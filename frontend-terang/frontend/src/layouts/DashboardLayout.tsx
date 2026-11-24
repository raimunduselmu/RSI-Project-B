import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MENU_GROUPS, MENU_TOP, PERIODE_AKTIF, type MenuItem } from '@/lib/constants';
import { cn } from '@/lib/format';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PendingBackend } from '@/components/shared/PendingBackend';

const STORAGE_KEY = 'kmk.sidebar.collapsed';

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/** Layout pengurus: sidebar yang bisa dibuka-tutup (gaya OCW) + topbar (mockup FSD). */
export function DashboardLayout({ children }: { children?: ReactNode }) {
  const { user, hasRole, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const allowed = (m: MenuItem) => !m.roles || hasRole(...m.roles);
  const groups = MENU_GROUPS.map((g) => ({ ...g, items: g.items.filter(allowed) })).filter((g) => g.items.length > 0);
  // menu aktif = item dengan route terpanjang yang cocok (mis. /assets/labels mengalahkan /assets)
  const matches = (to: string) => pathname === to || pathname.startsWith(to + '/');
  const activeTo = [...MENU_TOP, ...groups.flatMap((g) => g.items)]
    .filter((m) => matches(m.to))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to;
  const isActive = (to: string) => to === activeTo;
  const activeGroup = groups.find((g) => g.items.some((i) => isActive(i.to)))?.id;

  const [open, setOpen] = useState<Record<string, boolean>>(() => (activeGroup ? { [activeGroup]: true } : {}));
  useEffect(() => {
    if (activeGroup) setOpen((o) => ({ ...o, [activeGroup]: true }));
    setMobileOpen(false);
  }, [activeGroup, pathname]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? '0' : '1');
      } catch {
        /* abaikan */
      }
      return !c;
    });
  };

  const doLogout = async () => {
    await logout();
    nav('/login');
  };

  const sidebar = (mini: boolean) => (
    <div className="flex h-full flex-col">
      {/* logo */}
      <Link to="/dashboard" className={cn('flex items-center gap-3 px-5 pb-6 pt-6', mini && 'justify-center px-0')}>
        <LogoMark size={mini ? 34 : 40} />
        {!mini && (
          <span className="leading-tight">
            <span className="block font-semibold tracking-wide text-ink">KMK UNS</span>
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/45">Gereja Kampus</span>
          </span>
        )}
      </Link>

      {/* saat diciutkan tidak di-scroll supaya tooltip tidak terpotong */}
      <nav className={cn('flex-1 space-y-1 px-3 pb-4', mini ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden')}>
        {MENU_TOP.map((m) => (
          <NavItem key={m.to} to={m.to} icon={m.icon} label={m.label} mini={mini} active={isActive(m.to)} />
        ))}

        <div className="my-3 h-px bg-white" />

        {groups.map((g) => {
          const groupActive = g.id === activeGroup;
          if (mini) {
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setOpen((o) => ({ ...o, [g.id]: true }));
                  toggleCollapsed();
                }}
                className={cn('nav-item nav-item-mini group relative flex h-11 w-full items-center justify-center rounded-xl', groupActive ? 'nav-active text-white' : 'text-ink/65 hover:bg-ember-50 hover:text-ink')}
              >
                <span className={cn('absolute left-2 h-1.5 w-1.5 rounded-full', groupActive ? 'bg-white' : 'bg-ember-300/70')} />
                <Icon name={g.icon} size={19} />
                <Tooltip label={g.label} />
              </button>
            );
          }
          const isOpen = !!open[g.id];
          return (
            <div key={g.id}>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [g.id]: !isOpen }))}
                className={cn('nav-item group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[13.5px]', groupActive ? 'text-ink' : 'text-ink/65 hover:bg-ember-50 hover:text-ink', isOpen && 'bg-white')}
              >
                <Icon name={g.icon} size={19} className="shrink-0" />
                <span className="flex-1 truncate">{g.label}</span>
                <Icon name="chevronDown" size={15} className={cn('nav-chevron shrink-0 opacity-60 transition-transform duration-300', isOpen && 'rotate-180 opacity-100')} />
              </button>
              <div className={cn('grid transition-all duration-300 ease-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                <div className="overflow-hidden">
                  <div className="ml-[22px] space-y-0.5 border-l border-ember-300/25 py-1 pl-3">
                    {g.items.map((m, idx) => (
                      <NavLink
                        key={isOpen ? m.to + '-open' : m.to}
                        style={{ animationDelay: `${idx * 45}ms` }}
                        to={m.to}
                        end
                        className={cn(
                          'nav-item flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px]',
                          isOpen && 'anim-menu-in',
                          isActive(m.to) ? 'nav-active font-medium text-white' : 'text-ink/60 hover:bg-ember-50 hover:text-ink',
                        )}
                      >
                        <Icon name={m.icon} size={15} className="shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-900/[0.08] px-3 py-3">
        <button
          type="button"
          onClick={doLogout}
          className={cn('group relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] text-ink/60 transition hover:bg-rose-400/10 hover:text-rose-600', mini && 'justify-center px-0')}
        >
          <Icon name="logout" size={19} className="shrink-0" />
          {mini ? <Tooltip label="Keluar" /> : <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="app-bg app-bg-soft" />

      {/* sidebar desktop */}
      <aside
        className={cn(
          'fixed inset-y-3 left-3 z-30 hidden rounded-[28px] border border-slate-900/[0.08] bg-white/80 bg-gradient-to-b from-transparent via-transparent to-ember-500/[0.12] shadow-glass backdrop-blur-2xl transition-[width] duration-300 md:block',
          collapsed ? 'w-[84px]' : 'w-[264px]',
        )}
      >
        {sidebar(collapsed)}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          className="absolute -right-5 top-7 flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/[0.08] bg-white/80 text-ink/70 shadow-glass backdrop-blur transition hover:rotate-180 hover:border-ember-300/60 hover:text-ember-700 hover:shadow-soft duration-500"
        >
          <Icon name={collapsed ? 'panelOpen' : 'panelClose'} size={17} />
        </button>
      </aside>

      {/* sidebar mobile (laci) */}
      <div className={cn('fixed inset-0 z-40 md:hidden', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div className={cn('absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setMobileOpen(false)} />
        <aside className={cn('absolute inset-y-0 left-0 w-[280px] border-r border-slate-900/[0.08] bg-white/80 bg-gradient-to-b from-transparent via-transparent to-ember-500/[0.12] transition-transform duration-300 ease-out', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
          {sidebar(false)}
        </aside>
      </div>

      <div className={cn('flex min-h-screen flex-col transition-[padding] duration-300', collapsed ? 'md:pl-[100px]' : 'md:pl-[280px]')}>
        {/* topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 bg-white/80 px-4 backdrop-blur-xl md:px-8">
          <button type="button" className="rounded-xl p-2 text-ink hover:bg-ember-50 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
            <Icon name="menu" size={20} />
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[11px] font-medium text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Periode Aktif {PERIODE_AKTIF}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/[0.08] bg-white text-ink/80 transition hover:border-ember-300/50 hover:text-ink hover:shadow-soft" aria-label="Notifikasi">
              <Icon name="bell" size={18} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-ember-400 ring-2 ring-white" />
            </Link>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-900/[0.08] bg-white py-1 pl-1 pr-4 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ember-300 via-ember-500 to-brand-500 text-xs font-semibold text-white">
                {initials(user?.full_name)}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-medium text-ink">{user?.full_name ?? '—'}</span>
                <span className="block text-[10.5px] text-ink/55">{user?.roles.join(' · ')}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-8">
          <PendingBackend />
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, mini, active }: { to: string; icon: IconName; label: string; mini: boolean; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'nav-item group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[13.5px]',
        mini && 'nav-item-mini justify-center px-0',
        active ? 'nav-active font-medium text-white' : 'text-ink/65 hover:bg-ember-50 hover:text-ink',
      )}
    >
      <Icon name={icon} size={19} className="shrink-0" />
      {mini ? <Tooltip label={label} /> : <span className="truncate">{label}</span>}
    </Link>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-1 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-900/[0.08] bg-white px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 shadow-glass transition-all duration-200 group-hover:ml-3 group-hover:opacity-100">
      {label}
    </span>
  );
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-400 via-ember-500 to-ember-300 text-white shadow-soft ring-1 ring-slate-900/10"
      style={{ width: size, height: size }}
    >
      <Icon name="church" size={Math.round(size * 0.5)} />
    </span>
  );
}

const initials = (name?: string) =>
  (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
