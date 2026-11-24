// SCR-27 Kegiatan & Kepanitiaan (FSD-2.29) — Template B
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge, Button, Card, Input, Select, Table } from '@/components/ui';

// TODO: ganti dengan useFetch('/events') dan POST /events
const EVENTS = [
  { id: '1', name: 'Retret Mahasiswa 2026', kind: 'Rohani', date: '05/12 – 06/12/2026', pic: 'Yosef Hendra', quota: '57 / 80', status: 'TERBIT' },
  { id: '2', name: 'Bakti Sosial Oktober', kind: 'Sosial', date: '25/10/2026', pic: 'Agnes Sari', quota: '42 / 50', status: 'SELESAI' },
  { id: '3', name: 'Rapat Pleno Akhir Tahun', kind: 'Rapat', date: '25/11/2026', pic: 'Gregorius Bima', quota: '—', status: 'DRAFT' },
];
const COMMITTEE = [
  { name: 'Yosef Hendra', role: 'Ketua' },
  { name: 'Agnes Sari', role: 'Sekretaris' },
  { name: 'Petrus Dimas', role: 'Acara' },
  { name: 'Lucia Rani', role: 'Konsumsi' },
];

export default function EventList() {
  const nav = useNavigate();
  return (
    <>
      <PageHeader code="SCR-27" eyebrow="Kegiatan" title="Kegiatan & Kepanitiaan" actions={<Button icon="plus">Kegiatan Baru</Button>} />
      <Card title="Retret Mahasiswa 2026" className="mb-6">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-3">
            <Input no={1} label="Nama Kegiatan" required maxLength={150} defaultValue="Retret Mahasiswa 2026" />
            <Select no={2} label="Jenis Kegiatan" required options={['Rohani', 'Sosial', 'Rapat', 'Lainnya']} />
            <Select no={4} label="Penanggung Jawab" required options={['Yosef Hendra', 'Agnes Sari', 'Gregorius Bima']} />
            <Input no={3} label="Waktu Mulai / Selesai" required defaultValue="05/12/2026 07.00 – 06/12/2026 15.00" />
            <Input no={5} label="Anggaran (Rp)" inputMode="numeric" defaultValue="12.500.000" />
            <Input no={6} label="Kuota Peserta" type="number" min={1} defaultValue={80} />
          </div>
          <div className="space-y-2">
            <p className="field-label">Panitia</p>
            <Table rows={COMMITTEE} rowKey={(c) => c.name} columns={[{ header: 'Nama', cell: (c) => <span className="text-ink">{c.name}</span> }, { header: 'Jabatan', cell: (c) => c.role }]} />
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="secondary" icon="clipboard" onClick={() => nav('/borrow')}>
              Ajukan Ruangan/Aset (FSD-2.10)
            </Button>
            <Button type="submit">Simpan Kegiatan</Button>
          </div>
        </form>
      </Card>
      <Card title="Daftar Kegiatan">
        <Table
          rows={EVENTS}
          rowKey={(e) => e.id}
          columns={[
            { header: 'Kegiatan', cell: (e) => <span className="font-medium text-ink">{e.name}</span> },
            { header: 'Jenis', cell: (e) => e.kind },
            { header: 'Tanggal', cell: (e) => <span className="whitespace-nowrap font-mono text-[12.5px]">{e.date}</span> },
            { header: 'Penanggung Jawab', cell: (e) => e.pic },
            { header: 'Peserta', cell: (e) => e.quota },
            { header: 'Status', cell: (e) => <Badge status={e.status} /> },
            {
              header: '',
              align: 'right',
              cell: (e) => (
                <span className="flex justify-end gap-3 whitespace-nowrap font-mono text-xs">
                  <button className="text-ink/70 hover:text-ink" onClick={() => nav(`/events/${e.id}/participants`)}>Peserta →</button>
                  <button className="text-ink/70 hover:text-ink" onClick={() => nav(`/events/${e.id}/lpj`)}>LPJ →</button>
                </span>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
