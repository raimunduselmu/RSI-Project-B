// SCR-30 Persembahan & Donasi (FSD-2.32) — Template B (form di kiri)
import { useState } from 'react';
import { TableFormPage } from '@/components/templates';
import { Alert, Badge, Input, Segmented, Select } from '@/components/ui';

type Kind = 'PERSEMBAHAN' | 'UANG' | 'BARANG';
interface Rec {
  id: string;
  date: string;
  kind: Kind;
  donor: string;
  note: string;
  value: string;
}

// TODO: ganti dengan useFetch<Rec[]>('/donations') dan POST /donations
const DUMMY: Rec[] = [
  { id: '1', date: '16/11', kind: 'BARANG', donor: 'Keluarga Wijaya', note: 'Keyboard → MUSI-161126', value: '—' },
  { id: '2', date: '15/11', kind: 'PERSEMBAHAN', donor: '—', note: 'Kolekte Misa Kampus', value: 'Rp 1.245.000' },
  { id: '3', date: '10/11', kind: 'UANG', donor: 'Alumni 2015', note: 'Dana Natal', value: 'Rp 5.000.000' },
  { id: '4', date: '08/11', kind: 'PERSEMBAHAN', donor: '—', note: 'Kolekte Misa Kampus', value: 'Rp 1.102.000' },
];

export default function DonationPage() {
  const [kind, setKind] = useState<Kind>('BARANG');
  return (
    <TableFormPage<Rec>
      code="SCR-30"
      eyebrow="Keuangan"
      title="Persembahan & Donasi"
      formSide="left"
      formTitle="Catat Penerimaan"
      form={
        <>
          <div className="space-y-1.5">
            <p className="field-label">Jenis Penerimaan <span className="text-rose-600">*</span></p>
            <Segmented value={kind} onChange={setKind} options={[{ value: 'PERSEMBAHAN', label: 'Persembahan' }, { value: 'UANG', label: 'Uang' }, { value: 'BARANG', label: 'Barang' }]} />
          </div>
          {kind !== 'PERSEMBAHAN' && <Select no={2} label="Donatur" required options={['Keluarga Wijaya', 'Alumni Angkatan 2015', 'Ibu M. Kristiani', '+ Donatur baru']} />}
          {kind !== 'BARANG' && <Input no={3} label="Nominal (Rp)" required inputMode="numeric" placeholder="0" />}
          {kind === 'BARANG' && (
            <>
              <div className="grid grid-cols-[1.4fr_1fr] gap-3">
                <Input no={4} label="Nama & Kategori Barang" required defaultValue="Keyboard Yamaha PSR" />
                <Select label="Kategori" options={['Alat Musik', 'Elektronik', 'Perabot', 'Liturgi']} />
              </div>
              <Input no={5} label="Jumlah Barang" type="number" min={1} required defaultValue={1} />
            </>
          )}
          <Input no={6} label="Tanggal Terima" type="date" required defaultValue="2026-11-16" />
          <label className="flex items-start gap-3 text-sm text-ink/85">
            <input type="checkbox" className="check mt-0.5" />
            Donatur setuju namanya tampil di halaman Transparansi
          </label>
          {kind === 'BARANG' && <Alert tone="info">Donasi barang otomatis membentuk catatan aset baru (FSD-2.42).</Alert>}
        </>
      }
      listTitle="Penerimaan Terbaru"
      rows={DUMMY}
      rowKey={(r) => r.id}
      columns={[
        { header: 'Tanggal', cell: (r) => <span className="font-mono text-[12.5px]">{r.date}</span> },
        { header: 'Jenis', cell: (r) => <Badge status={r.kind} /> },
        { header: 'Donatur', cell: (r) => r.donor },
        { header: 'Keterangan', cell: (r) => r.note },
        { header: 'Nilai', cell: (r) => <span className="whitespace-nowrap">{r.value}</span>, align: 'right' },
      ]}
    />
  );
}
