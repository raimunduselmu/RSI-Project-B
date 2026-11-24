// Template B — Tabel + form di samping. Contoh: SCR-21 Data Umat.
// Dipakai juga: SCR-04, 12, 13, 17, 23, 27, 30, 31, 36, 38.
import type { FormEvent, ReactNode } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button, Card, Table, type Column } from '@/components/ui';
import { cn } from '@/lib/format';

export interface TableFormPageProps<T> {
  title: string;
  code: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** isi di atas grid, mis. kartu angka (SCR-31) */
  topSlot?: ReactNode;
  /** judul & aksi kartu tabel */
  listTitle?: string;
  listActions?: ReactNode;
  /** filter ditumpuk di atas tabel */
  filters?: ReactNode;
  columns: Column<T>[];
  rows: T[];
  rowKey?: (row: T, i: number) => string | number;
  onRowClick?: (row: T) => void;
  isActive?: (row: T) => boolean;
  /** kartu tambahan di bawah tabel (mis. password sementara SCR-04) */
  afterTable?: ReactNode;
  /** judul panel form, mis. "Tambah Umat" */
  formTitle: string;
  /** isi form (field-field) */
  form: ReactNode;
  submitLabel?: string;
  onSubmit?: (e: FormEvent) => void;
  loading?: boolean;
  /** kartu tambahan di bawah form (mis. "Catat Pelaksanaan" SCR-12) */
  afterForm?: ReactNode;
  /** posisi form: kanan (default, seperti SCR-21) atau kiri (seperti SCR-13, 30, 31, 36, 38) */
  formSide?: 'left' | 'right';
}

export function TableFormPage<T>(p: TableFormPageProps<T>) {
  const left = p.formSide === 'left';
  const formCol = (
    <div className="space-y-6">
      <Card title={p.formTitle}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            p.onSubmit?.(e);
          }}
        >
          {p.form}
          <div className="pt-2">
            <Button type="submit" loading={p.loading}>
              {p.submitLabel ?? 'Simpan'}
            </Button>
          </div>
        </form>
      </Card>
      {p.afterForm}
    </div>
  );
  const tableCol = (
    <div className="min-w-0 space-y-6">
      <Card title={p.listTitle} actions={p.listActions}>
        {p.filters && <div className="mb-5 grid gap-3 sm:grid-cols-3">{p.filters}</div>}
        <Table columns={p.columns} rows={p.rows} rowKey={p.rowKey} onRowClick={p.onRowClick} isActive={p.isActive} />
      </Card>
      {p.afterTable}
    </div>
  );
  return (
    <>
      <PageHeader title={p.title} code={p.code} eyebrow={p.eyebrow} subtitle={p.subtitle} actions={p.actions} />
      {p.topSlot && <div className="mb-6">{p.topSlot}</div>}
      <div className={cn('grid items-start gap-6', left ? 'xl:grid-cols-[360px_minmax(0,1fr)]' : 'xl:grid-cols-[minmax(0,1fr)_360px]')}>
        {left ? (
          <>
            {formCol}
            {tableCol}
          </>
        ) : (
          <>
            {tableCol}
            {formCol}
          </>
        )}
      </div>
    </>
  );
}
