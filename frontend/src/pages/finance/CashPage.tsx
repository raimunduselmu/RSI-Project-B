// SCR-31 Kas & Anggaran (FSD-2.33, 2.44) — Template B (form di kiri)
import { useState } from 'react';
import { TableFormPage } from '@/components/templates';
import { Alert, Badge, FileDrop, Input, Segmented, Select, StatCard } from '@/components/ui';

interface Tx {
  id: string;
  date: string;
  kind: 'MASUK' | 'KELUAR';
  category: string;
  source: string;
  amount: string;
  status: string;
}

// TODO: ganti dengan useFetch<Tx[]>('/cash-transactions') dan POST
const DUMMY: Tx[] = [
  { id: '1', date: '18/11', kind: 'KELUAR', category: 'Perawatan Aset', source: 'Servis AC', amount: 'Rp 2.750.000', status: 'MENUNGGU_PHT' },
  { id: '2', date: '18/11', kind: 'MASUK', category: 'Iuran Kas', source: 'IUR-181126-004 (otomatis)', amount: 'Rp 50.000', status: 'SELESAI' },
  { id: '3', date: '16/11', kind: 'MASUK', category: 'Pembayaran Peminjaman', source: 'PJM-151126-002', amount: 'Rp 150.000', status: 'SELESAI' },
  { id: '4', date: '15/11', kind: 'MASUK', category: 'Persembahan', source: 'Kolekte', amount: 'Rp 1.245.000', status: 'SELESAI' },
  { id: '5', date: '12/11', kind: 'KELUAR', category: 'Kegiatan', source: 'Konsumsi rapat pleno', amount: 'Rp 480.000', status: 'SELESAI' },
];

export default function CashPage() {
  const [kind, setKind] = useState<'MASUK' | 'KELUAR'>('KELUAR');
  return (
    <TableFormPage<Tx>
      code="SCR-31"
      eyebrow="Keuangan"
      title="Kas & Anggaran"
      subtitle="Periode 2026/2027"
      topSlot={
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Saldo Kas" value="Rp 24.130.000" tone="green" />
          <StatCard label="Kas Masuk (Nov)" value="Rp 8.420.000" tone="brand" />
          <StatCard label="Kas Keluar (Nov)" value="Rp 5.960.000" tone="ember" />
          <StatCard label="Serapan Anggaran" value="58%" tone="amber" />
        </div>
      }
      formSide="left"
      formTitle="Tambah Transaksi"
      form={
        <>
          <div className="space-y-1.5">
            <p className="field-label">Jenis Transaksi <span className="text-rose-600">*</span></p>
            <Segmented value={kind} onChange={setKind} options={[{ value: 'MASUK', label: 'Masuk' }, { value: 'KELUAR', label: 'Keluar' }]} />
          </div>
          <Input no={2} label="Nominal (Rp)" required inputMode="numeric" defaultValue="2.750.000" />
          <Select no={3} label="Kategori / Pos Anggaran" required options={['Perawatan Aset — sisa Rp 1.900.000', 'Kegiatan — sisa Rp 6.400.000', 'Operasional — sisa Rp 2.100.000']} />
          {kind === 'KELUAR' && (
            <Alert tone="error" title="ERR-FIN-01">
              Anggaran tidak mencukupi. Transaksi diteruskan ke PHT untuk persetujuan.
            </Alert>
          )}
          <Select no={4} label="Kegiatan Terkait" options={['—', 'Retret Mahasiswa 2026', 'Natal Bersama KMK UNS 2026']} />
          <div className="space-y-1.5">
            <p className="field-label">Bukti Transaksi</p>
            <FileDrop hint="PDF/JPG/PNG, maks 5 MB" />
          </div>
          <Input no={6} label="Tanggal" type="date" required defaultValue="2026-11-18" />
        </>
      }
      listTitle="Transaksi"
      rows={DUMMY}
      rowKey={(t) => t.id}
      columns={[
        { header: 'Tanggal', cell: (t) => <span className="font-mono text-[12.5px]">{t.date}</span> },
        { header: 'Jenis', cell: (t) => <Badge status={t.kind} /> },
        { header: 'Kategori', cell: (t) => t.category },
        { header: 'Sumber', cell: (t) => t.source },
        { header: 'Nominal', cell: (t) => <span className="whitespace-nowrap">{t.amount}</span>, align: 'right' },
        { header: 'Status', cell: (t) => <Badge status={t.status} label={t.status === 'MENUNGGU_PHT' ? 'Menunggu PHT' : undefined} /> },
      ]}
    />
  );
}
