// SCR-37 Workflow Persetujuan (FSD-2.39) — Template A (hanya lihat)
import { TablePage } from '@/components/templates';
import { Badge, Card, Table } from '@/components/ui';

// Definisi diisi lewat seeder (backend/src/db/seed/workflows.ts); tidak dapat diubah dari antarmuka.
const WORKFLOWS = [
  { name: 'Peminjaman', module: 'Sarana Prasarana', step: 1, role: 'Sarpras', cond: 'Semua pengajuan' },
  { name: 'Pengeluaran Over-budget', module: 'Keuangan', step: 1, role: 'PHT', cond: 'Pengeluaran melebihi sisa anggaran pos' },
  { name: 'Verifikasi Iuran Kas', module: 'Keuangan', step: 1, role: 'Bendahara', cond: 'Pengajuan milik Bendahara → PHT' },
  { name: 'Serah Terima Jabatan', module: 'Kepengurusan', step: 1, role: 'PHT', cond: 'Semua serah terima' },
  { name: 'LPJ Kegiatan', module: 'Kegiatan', step: 1, role: 'PHT', cond: 'Semua LPJ' },
];

// TODO: ganti dengan useFetch('/approval-logs')
const TRAIL = [
  { code: 'PJM-181126-003', wf: 'Peminjaman', by: 'sarpras.adi', at: '18/11/2026 10.12', decision: 'DISETUJUI', note: '—' },
  { code: 'IUR-171126-002', wf: 'Verifikasi Iuran Kas', by: 'andi.bendahara', at: '17/11/2026 15.40', decision: 'DITOLAK', note: 'Bukti transfer tidak terbaca' },
  { code: 'KAS-161126-009', wf: 'Pengeluaran Over-budget', by: 'gregorius.pht', at: '16/11/2026 19.02', decision: 'DISETUJUI', note: 'Darurat perbaikan AC' },
];

export default function WorkflowPage() {
  return (
    <TablePage
      code="SCR-37"
      eyebrow="Administrasi"
      title="Workflow Persetujuan"
      subtitle="Hanya lihat — definisi workflow diatur melalui seeder."
      actions={<Badge status="READ_ONLY" label="Read-only" tone="slate" />}
      cardTitle="Daftar Workflow"
      rows={WORKFLOWS}
      rowKey={(w) => w.name}
      columns={[
        { header: 'Nama Workflow', cell: (w) => <span className="font-medium text-ink">{w.name}</span> },
        { header: 'Modul', cell: (w) => w.module },
        { header: 'Langkah', cell: (w) => w.step, align: 'center' },
        { header: 'Role Penyetuju', cell: (w) => <Badge status={w.role} tone="blue" label={w.role} /> },
        { header: 'Kondisi', cell: (w) => w.cond },
      ]}
    >
      <Card title="Jejak Persetujuan" no={6} actions={<input className="field !w-52 !py-1.5" placeholder="Cari kode pengajuan…" />}>
        <Table
          rows={TRAIL}
          rowKey={(t) => t.code}
          columns={[
            { header: 'Kode', cell: (t) => <span className="whitespace-nowrap font-mono text-[12.5px] text-brand-700">{t.code}</span> },
            { header: 'Workflow', cell: (t) => t.wf },
            { header: 'Oleh', cell: (t) => t.by },
            { header: 'Waktu', cell: (t) => <span className="whitespace-nowrap font-mono text-[12.5px]">{t.at}</span> },
            { header: 'Keputusan', cell: (t) => <Badge status={t.decision} /> },
            { header: 'Catatan', cell: (t) => t.note },
          ]}
        />
      </Card>
    </TablePage>
  );
}
