// SCR-17 Profil Kepanitiaan Proker Utama (FSD-2.20) — Template B
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge, Button, Card, Input, Select, Table } from '@/components/ui';

interface Member {
  name: string;
  role: string;
  division: string;
  phone: string;
}

// TODO: ganti dengan useFetch('/committees') dan POST /committees
const PROGRAMS = [
  { no: 1, name: 'Natal Bersama KMK UNS 2026', date: '01/12 – 20/12/2026', lead: 'Yosef Hendra' },
  { no: 2, name: 'Retret Mahasiswa 2026', date: '05/12 – 06/12/2026', lead: 'Agnes Sari' },
  { no: 3, name: 'Bakti Sosial Paskah', date: 'Maret 2027', lead: '—' },
];

export default function CommitteeList() {
  const [members, setMembers] = useState<Member[]>([
    { name: 'Yosef Hendra', role: 'Ketua', division: '—', phone: '0813xxxx' },
    { name: 'Agnes Sari', role: 'Sekretaris', division: '—', phone: '0857xxxx' },
    { name: 'Petrus Dimas', role: 'Koordinator', division: 'Acara', phone: '0821xxxx' },
    { name: 'Lucia Rani', role: 'Koordinator', division: 'Konsumsi', phone: '0896xxxx' },
  ]);

  return (
    <>
      <PageHeader code="SCR-17" eyebrow="Kepengurusan" title="Profil Kepanitiaan Proker Utama" subtitle="Maksimal 3 program kerja utama per periode." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {PROGRAMS.map((p) => (
          <div key={p.no} className="glass p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-ink/55">PROKER {p.no}</span>
              {p.no === 1 && <Badge status="AKTIF" label="Dipilih" tone="blue" />}
            </div>
            <p className="mt-2 font-display text-xl">{p.name}</p>
            <p className="mt-1 text-xs text-ink/60">
              {p.date} · Ketua: {p.lead}
            </p>
          </div>
        ))}
      </div>
      <Card title="Natal Bersama KMK UNS 2026">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-3">
            <Input no={1} label="Nama Program" required maxLength={150} defaultValue="Natal Bersama KMK UNS 2026" />
            <Select no={2} label="Urutan Proker" required options={['1', '2', '3']} hint="Unik per periode" />
            <Input no={3} label="Periode Akademik" required defaultValue="2026/2027" />
            <Input no={4} label="Tanggal Mulai / Selesai" defaultValue="01/12/2026 – 20/12/2026" />
            <Input no={5} label="Ketua / Kontak" defaultValue="Yosef Hendra · 0813xxxx" />
          </div>
          <div className="space-y-2">
            <p className="field-label">
              Anggota <span className="text-rose-600">*</span>
            </p>
            <Table
              rows={members}
              rowKey={(m, i) => m.name + i}
              columns={[
                { header: 'Nama', cell: (m) => <span className="font-medium text-ink">{m.name}</span> },
                { header: 'Jabatan', cell: (m) => m.role },
                { header: 'Divisi', cell: (m) => m.division },
                { header: 'Telepon', cell: (m) => <span className="font-mono text-[12.5px]">{m.phone}</span> },
              ]}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="secondary" size="sm" icon="plus" onClick={() => setMembers([...members, { name: 'Anggota baru', role: 'Anggota', division: '—', phone: '—' }])}>
              Tambah Anggota
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
