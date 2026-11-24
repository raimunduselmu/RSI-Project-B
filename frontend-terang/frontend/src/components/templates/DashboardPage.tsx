// Template F — Dashboard / laporan. Contoh: SCR-03 Dashboard Internal.
// Dipakai juga: SCR-16, 33, 39.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { NumberDot, StatCard } from '@/components/ui';

export interface DashboardPageProps {
  title: ReactNode;
  code: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** isi di antara judul dan kartu angka, mis. filter laporan */
  topSlot?: ReactNode;
  statsTitle?: string;
  stats: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'white' | 'brand' | 'ember' | 'green' | 'amber' }[];
  /** panel-panel di bawah kartu angka; pakai <ListPanel> */
  children?: ReactNode;
  /** jumlah kolom panel di bawah kartu angka (default 2) */
  panelCols?: 1 | 2;
}

export function DashboardPage(p: DashboardPageProps) {
  return (
    <>
      <PageHeader title={p.title} code={p.code} eyebrow={p.eyebrow} subtitle={p.subtitle} actions={p.actions} />
      {p.topSlot && <div className="mb-6">{p.topSlot}</div>}
      {p.statsTitle && (
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <NumberDot n={1} />
          {p.statsTitle}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {p.stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      {p.children && <div className={`mt-6 grid items-start gap-6 ${p.panelCols === 1 ? '' : 'lg:grid-cols-2'}`}>{p.children}</div>}
    </>
  );
}

export interface ListPanelItem {
  key: string;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  meta?: ReactNode;
}

/** Panel daftar ringkas dengan tautan "Lihat semua". */
export function ListPanel({ title, no, to, items }: { title: string; no?: number; to?: string; items: ListPanelItem[] }) {
  return (
    <section className="glass">
      <div className="flex items-center justify-between border-b border-slate-900/[0.08] px-5 py-4">
        <h2 className="flex items-center gap-2">
          {no !== undefined && <NumberDot n={no} />}
          {title}
        </h2>
        {to && (
          <Link to={to} className="font-mono text-[11px] text-ink/60 transition hover:text-ink">
            Lihat semua →
          </Link>
        )}
      </div>
      <ul className="divide-y divide-slate-900/[0.07]">
        {items.map((it) => (
          <li key={it.key} className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink">{it.title}</div>
              {it.subtitle && <div className="mt-0.5 text-sm text-ink/60">{it.subtitle}</div>}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {it.right}
              {it.meta && <span className="font-mono text-[11px] text-ink/50">{it.meta}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
