// SCR-25 Jadwal Ibadah & Tata Ibadah (FSD-2.27) — Template C (versi pengurus)
import { useState } from 'react';
import { PanelSection, ProcessPage } from '@/components/templates';
import { Badge, Button, FileDrop, Input, Select } from '@/components/ui';

interface Sched {
  id: string;
  date: string;
  title: string;
  kind: string;
  room: string;
  repeat: string;
  status: string;
}

// TODO: ganti dengan useFetch<Sched[]>('/liturgy/schedules?...')
const DUMMY: Sched[] = [
  { id: '1', date: 'Sel, 24/11 07.00', title: 'Misa Kampus', kind: 'Misa', room: 'Aula Gereja Kampus', repeat: 'Mingguan', status: 'TERBIT' },
  { id: '2', date: 'Jum, 27/11 18.00', title: 'Ibadah Taize', kind: 'Ibadat', room: 'Ruang Doa', repeat: '—', status: 'TERBIT' },
  { id: '3', date: 'Min, 29/11 08.00', title: 'Misa Adven I', kind: 'Misa', room: 'Aula Gereja Kampus', repeat: '—', status: 'DRAFT' },
  { id: '4', date: 'Kam, 24/12 19.00', title: 'Misa Malam Natal KMK', kind: 'Misa', room: 'Aula Gereja Kampus', repeat: '—', status: 'DRAFT' },
];

export default function LiturgySchedule() {
  const [sel, setSel] = useState<Sched | null>(DUMMY[2]);
  return (
    <ProcessPage<Sched>
      code="SCR-25"
      eyebrow="Liturgi"
      title="Jadwal Ibadah & Tata Ibadah"
      actions={<Button icon="plus">Buat Jadwal</Button>}
      listTitle="Jadwal November–Desember 2026"
      rows={DUMMY}
      rowKey={(s) => s.id}
      selected={sel}
      onSelect={setSel}
      columns={[
        { header: 'Tanggal', cell: (s) => <span className="whitespace-nowrap font-mono text-[12.5px]">{s.date}</span> },
        { header: 'Ibadah', cell: (s) => <span className="font-medium text-ink">{s.title}</span> },
        { header: 'Ruangan', cell: (s) => s.room },
        { header: 'Pengulangan', cell: (s) => s.repeat },
        { header: 'Status', cell: (s) => <Badge status={s.status} /> },
      ]}
      panel={(s) => (
        <PanelSection title={s.title}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-[1.4fr_1fr] gap-3">
              <Input no={1} label="Judul / Jenis Ibadah" required defaultValue={s.title} />
              <Select label="Jenis" options={['Misa', 'Ibadat', 'Adorasi']} defaultValue={s.kind} />
            </div>
            <Select no={2} label="Ruangan" required options={['Aula Gereja Kampus', 'Ruang Doa']} defaultValue={s.room} />
            <div className="grid grid-cols-2 gap-3">
              <Input no={3} label="Waktu Mulai" type="datetime-local" required defaultValue="2026-11-29T08:00" />
              <Input label="Selesai" type="datetime-local" required defaultValue="2026-11-29T09:30" />
            </div>
            <Select no={4} label="Pengulangan" options={['Tidak', 'Mingguan']} />
            <div className="space-y-1.5">
              <p className="field-label">Tata Ibadah</p>
              <FileDrop hint="PDF/DOCX, maks 10 MB" accept=".pdf,.docx" />
            </div>
            <Select no={6} label="Status" required options={['DRAFT', 'TERBIT', 'BATAL']} defaultValue={s.status} />
            <Button type="submit">Simpan & Terbitkan</Button>
          </form>
        </PanelSection>
      )}
    />
  );
}
