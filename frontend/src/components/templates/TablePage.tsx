// Template A — Tabel penuh (filter + tabel). Contoh: SCR-05 Daftar Aset.
// Dipakai juga: SCR-14, 18, 26, 28 (internal), 37.
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, Table, type Column } from '@/components/ui';
import { cn } from '@/lib/format';

export interface TablePageProps<T> {
  title: string;
  code: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  /** tombol kanan atas, mis. "Tambah Aset" */
  actions?: ReactNode;
  /** isi di atas kartu tabel, mis. kartu angka */
  topSlot?: ReactNode;
  /** judul & aksi kartu tabel (opsional) */
  cardTitle?: string;
  cardActions?: ReactNode;
  /** baris filter: kotak cari + dropdown */
  filters?: ReactNode;
  /** ubah grid filter bila jumlah filter berbeda, mis. "md:grid-cols-4" */
  filtersClassName?: string;
  columns: Column<T>[];
  rows: T[];
  rowKey?: (row: T, i: number) => string | number;
  onRowClick?: (row: T) => void;
  /** teks di bawah tabel, mis. "Menampilkan 6 dari 214 aset" atau pagination */
  footer?: ReactNode;
  empty?: string;
  /** isi tambahan di bawah kartu tabel */
  children?: ReactNode;
}

export function TablePage<T>(p: TablePageProps<T>) {
  return (
    <>
      <PageHeader title={p.title} code={p.code} eyebrow={p.eyebrow} subtitle={p.subtitle} actions={p.actions} />
      {p.topSlot && <div className="mb-6">{p.topSlot}</div>}
      <Card title={p.cardTitle} actions={p.cardActions}>
        {p.filters && <div className={cn('mb-5 grid gap-3', p.filtersClassName ?? 'md:grid-cols-[2fr_1fr_1fr]')}>{p.filters}</div>}
        <Table columns={p.columns} rows={p.rows} rowKey={p.rowKey} onRowClick={p.onRowClick} empty={p.empty} />
        {p.footer && <div className="mt-4 font-mono text-[11px] text-ink/50">{p.footer}</div>}
      </Card>
      {p.children && <div className="mt-6 space-y-6">{p.children}</div>}
    </>
  );
}
