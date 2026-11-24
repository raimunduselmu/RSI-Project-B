// SCR-13 Kehilangan & Kerusakan (FSD-2.15) — Template B (form di kiri)
import { useState } from 'react';
import { TableFormPage } from '@/components/templates';
import { Badge, Input, Segmented, Select, Textarea } from '@/components/ui';

interface Incident {
  id: string;
  asset: string;
  kind: string;
  date: string;
  pic: string;
  status: string;
}

// TODO: ganti dengan useFetch<Incident[]>('/incidents')
const DUMMY: Incident[] = [
  { id: '1', asset: 'Speaker Aktif JBL', kind: 'HILANG', date: '10/11/2026', pic: 'UKM Teater', status: 'DIPROSES' },
  { id: '2', asset: 'Mic Wireless Shure', kind: 'RUSAK', date: '05/11/2026', pic: 'Divisi Liturgi', status: 'SELESAI' },
  { id: '3', asset: 'Kursi Lipat #12', kind: 'RUSAK', date: '28/10/2026', pic: 'BEM FMIPA', status: 'DILAPORKAN' },
];

export default function IncidentList() {
  const [kind, setKind] = useState<'HILANG' | 'RUSAK'>('HILANG');
  return (
    <TableFormPage<Incident>
      code="SCR-13"
      eyebrow="Sarana Prasarana"
      title="Kehilangan & Kerusakan"
      formSide="left"
      formTitle="Lapor Kejadian"
      form={
        <>
          <Select no={1} label="Aset" required options={['ELEC-150925 — Speaker Aktif JBL', 'ELEC-080826 — Mic Wireless Shure', 'PERA-190626 — Kursi Lipat (30 unit)']} />
          <div className="space-y-1.5">
            <p className="field-label">Jenis Kejadian <span className="text-rose-600">*</span></p>
            <Segmented value={kind} onChange={setKind} options={[{ value: 'HILANG', label: 'Hilang' }, { value: 'RUSAK', label: 'Rusak' }]} />
          </div>
          <Input no={3} label="Tanggal Kejadian" type="date" required defaultValue="2026-11-10" />
          <Textarea no={4} label="Deskripsi" required minLength={10} defaultValue="Speaker tidak ditemukan setelah kegiatan Malam Keakraban di aula." />
          <Input no={5} label="Penanggung Jawab" hint="Default dari peminjam terakhir" defaultValue="UKM Teater (peminjam terakhir)" />
          <Select no={6} label="Tindak Lanjut / Status" required options={['DILAPORKAN', 'DIPROSES', 'SELESAI']} defaultValue="DIPROSES" />
          <Textarea rows={2} defaultValue="Koordinasi dengan peminjam untuk penggantian." />
        </>
      }
      listTitle="Riwayat Kejadian"
      rows={DUMMY}
      rowKey={(i) => i.id}
      columns={[
        { header: 'Aset', cell: (i) => <span className="font-medium text-ink">{i.asset}</span> },
        { header: 'Jenis', cell: (i) => <Badge status={i.kind === 'HILANG' ? 'HILANG' : 'RUSAK'} /> },
        { header: 'Tanggal', cell: (i) => <span className="whitespace-nowrap font-mono text-[12.5px]">{i.date}</span> },
        { header: 'Penanggung Jawab', cell: (i) => i.pic },
        { header: 'Status', cell: (i) => <Badge status={i.status} /> },
      ]}
    />
  );
}
