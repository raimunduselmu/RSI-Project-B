// SCR-21 Data Umat (FSD-2.23) — Template B
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableFormPage } from '@/components/templates';
import { Badge, Input, Select } from '@/components/ui';

interface Member {
  id: string;
  name: string;
  category: string;
  nim: string;
  status: string;
  consent: boolean;
  directory: boolean;
}

// TODO: ganti dengan useFetch<Member[]>('/members?...')
const DUMMY: Member[] = [
  { id: '1', name: 'Maria Anindita', category: 'Mahasiswa', nim: 'L0225047', status: 'AKTIF', consent: true, directory: true },
  { id: '2', name: 'Dr. Ignatius Hadi', category: 'Dosen', nim: '19780312…', status: 'AKTIF', consent: true, directory: false },
  { id: '3', name: 'Yohanes Kurniawan', category: 'Mahasiswa', nim: 'L0124019', status: 'AKTIF', consent: true, directory: true },
  { id: '4', name: 'Bernadeta Ayu', category: 'Alumni', nim: '—', status: 'ALUMNI', consent: true, directory: false },
];

export default function MemberList() {
  const nav = useNavigate();
  const [consent, setConsent] = useState(true);
  const [dir, setDir] = useState(false);

  return (
    <TableFormPage<Member>
      code="SCR-21"
      eyebrow="Keumatan"
      title="Data Umat"
      subtitle="Data sensitif — hanya Admin, PHT, dan Pastor (UU PDP)."
      filters={
        <>
          <input className="field sm:col-span-3" placeholder="Cari nama / NIM" />
          <Select options={['Semua kategori', 'Mahasiswa', 'Dosen', 'Staf', 'Alumni']} />
          <Select options={['Semua status', 'AKTIF', 'NONAKTIF', 'ALUMNI']} />
          <Select options={['2026/2027', '2025/2026']} />
        </>
      }
      rows={DUMMY}
      rowKey={(m) => m.id}
      columns={[
        { header: 'Nama', cell: (m) => <span className="font-medium text-ink">{m.name}</span> },
        { header: 'Kategori', cell: (m) => m.category },
        { header: 'NIM/NIP', cell: (m) => <span className="whitespace-nowrap font-mono text-[13px]">{m.nim}</span> },
        { header: 'Status', cell: (m) => <Badge status={m.status} /> },
        { header: 'Consent', cell: (m) => <Badge status={m.consent ? 'YA' : 'TIDAK'} label={m.consent ? 'Ya' : 'Tidak'} /> },
        { header: 'Direktori', cell: (m) => (m.directory ? 'Tampil' : 'Tidak') },
        {
          header: '',
          align: 'right',
          cell: (m) => (
            <button className="whitespace-nowrap font-mono text-xs text-ink/70 hover:text-ink" onClick={() => nav(`/members/${m.id}/records`)}>
              Riwayat →
            </button>
          ),
        },
      ]}
      formTitle="Tambah Umat"
      form={
        <>
          <Input no={2} label="Nama Lengkap" required defaultValue="Maria Anindita" />
          <div className="grid grid-cols-2 gap-3">
            <Select no={3} label="Kategori Umat" required options={['Mahasiswa', 'Dosen', 'Staf', 'Alumni']} />
            <Input no={4} label="NIM / NIP" defaultValue="L0225047" />
          </div>
          <Input no={5} label="Telepon" defaultValue="085712345678" />
          <Input no={6} label="Email" type="email" defaultValue="anindita@student.uns.ac.id" />
          <Select no={7} label="Status Keaktifan" required options={['AKTIF', 'NONAKTIF', 'ALUMNI']} />
          <label className="flex gap-3 rounded-xl border border-amber-300/25 bg-amber-400/[0.07] p-3 text-sm text-amber-700">
            <input type="checkbox" className="check mt-0.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            Pemilik data telah menyetujui pengelolaan data pribadinya sesuai UU PDP. (Wajib)
          </label>
          <label className="flex gap-3 text-sm text-ink/80">
            <input type="checkbox" className="check mt-0.5" checked={dir} onChange={(e) => setDir(e.target.checked)} />
            Tampilkan di direktori internal (hanya bila pemilik setuju)
          </label>
        </>
      }
    />
  );
}
