// Template C — Daftar + panel proses (setujui/tolak). Contoh: SCR-10 Daftar & Proses Peminjaman.
// Dipakai juga: SCR-19, 25 (internal), 34 (internal), 35 (internal), 41.
import { useState, type ReactNode } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button, Card, Table, Textarea, type Column } from '@/components/ui';

export interface ProcessPageProps<T> {
  title: string;
  code: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** baris filter di atas daftar (mis. SCR-19 Audit Log) */
  filters?: ReactNode;
  listTitle?: string;
  /** filter kecil di kanan judul daftar, mis. dropdown status */
  listActions?: ReactNode;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  selected: T | null;
  onSelect: (row: T) => void;
  /** isi panel kanan untuk baris terpilih */
  panel: (row: T) => ReactNode;
  emptyPanel?: string;
}

export function ProcessPage<T>(p: ProcessPageProps<T>) {
  const selKey = p.selected ? p.rowKey(p.selected) : null;
  return (
    <>
      <PageHeader title={p.title} code={p.code} eyebrow={p.eyebrow} subtitle={p.subtitle} actions={p.actions} />
      {p.filters && <div className="glass mb-6 grid gap-3 p-5 md:grid-cols-4">{p.filters}</div>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card title={p.listTitle ?? 'Pengajuan'} actions={p.listActions}>
          <Table columns={p.columns} rows={p.rows} rowKey={(r) => p.rowKey(r)} onRowClick={p.onSelect} isActive={(r) => p.rowKey(r) === selKey} />
        </Card>
        <div className="glass xl:sticky xl:top-24">
          {p.selected ? p.panel(p.selected) : <p className="p-8 text-center text-sm text-ink/55">{p.emptyPanel ?? 'Pilih salah satu baris untuk diproses.'}</p>}
        </div>
      </div>
    </>
  );
}

/** Kotak keputusan: Setujui / Tolak + alasan wajib saat menolak. */
export function DecisionBox({ onApprove, onReject, approveLabel = 'Setujui', rejectLabel = 'Tolak' }: { onApprove?: () => void; onReject?: (reason: string) => void; approveLabel?: string; rejectLabel?: string }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="success" icon="check" onClick={onApprove}>
          {approveLabel}
        </Button>
        <Button
          variant="danger"
          icon="x"
          onClick={() => {
            if (!reason.trim()) return setErr('Alasan wajib diisi saat menolak.');
            setErr('');
            onReject?.(reason);
          }}
        >
          {rejectLabel}
        </Button>
      </div>
      <Textarea label="Alasan Penolakan" placeholder="Tuliskan alasan…" value={reason} onChange={(e) => setReason(e.target.value)} hint="Wajib saat menolak atau membatalkan" error={err} />
    </div>
  );
}

/** Bagian di panel kanan dengan judul kecil. */
export function PanelSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="border-t border-slate-900/[0.08] px-5 py-5 first:border-t-0">
      {title && <p className="mb-3 text-sm font-semibold text-ink">{title}</p>}
      {children}
    </div>
  );
}
