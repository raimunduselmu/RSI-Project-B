// Template J — Info publik (ringkasan + daftar). Contoh: SCR-15 Dashboard Transparansi Donatur.
// Dipakai juga: SCR-25 (publik, jadwal ibadah mode baca).
import type { ReactNode } from 'react';
import { Card, StatCard, Table, type Column } from '@/components/ui';

export interface PublicInfoPageProps<T> {
  title: ReactNode;
  code: string;
  subtitle?: ReactNode;
  stats?: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'white' | 'brand' | 'ember' | 'green' | 'amber' }[];
  listTitle: string;
  filters?: ReactNode;
  columns: Column<T>[];
  rows: T[];
  rowKey?: (row: T, i: number) => string | number;
}

export function PublicInfoPage<T>(p: PublicInfoPageProps<T>) {
  return (
    <>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="eyebrow">Layanan publik</span>
          <span className="rounded-full border border-slate-900/[0.08] px-2 py-0.5 font-mono text-[10px] text-ink/35">{p.code}</span>
        </div>
        <h1>{p.title}</h1>
        {p.subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ink/55">{p.subtitle}</p>}
      </div>
      {p.stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}
      <Card title={p.listTitle} actions={p.filters}>
        <Table columns={p.columns} rows={p.rows} rowKey={p.rowKey} />
      </Card>
    </>
  );
}
