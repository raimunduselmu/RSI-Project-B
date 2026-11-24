// Template K — Login / Ganti Password. Contoh: SCR-01 Login; dipakai juga SCR-02.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '@/layouts/DashboardLayout';
import { PERIODE_AKTIF } from '@/lib/constants';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="app-bg" />
      {/* panel kiri: sorotan */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-900/[0.08] p-10 lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <LogoMark size={38} />
          <span className="leading-tight">
            <span className="block font-semibold tracking-wide">KMK UNS</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">Sistem Terpadu Gereja Kampus</span>
          </span>
        </Link>
        <div>
          <span className="eyebrow">Khusus pengurus</span>
          <p className="mt-4 max-w-lg font-display text-5xl leading-[1.05] text-ink">
            Satu sistem untuk aset, liturgi, kegiatan, dan <em className="text-ember-700">keuangan</em> Gereja Kampus.
          </p>
          <p className="mt-5 max-w-md font-mono text-[12.5px] leading-relaxed text-ink/55">
            Khusus Admin, pengurus, dan Pastor. Umat dan tamu memakai layanan publik tanpa login.
          </p>
        </div>
        <p className="font-mono text-[11px] text-ink/40">KMK UNS · Periode {PERIODE_AKTIF}</p>
      </div>

      {/* panel kanan: kartu form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="glass-strong w-full max-w-md p-8">
          <h1 className="text-[2.2rem]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
