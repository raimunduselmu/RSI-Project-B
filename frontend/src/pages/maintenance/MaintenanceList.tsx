// SCR-12 Jadwal Pemeliharaan (FSD-2.14) — Template B
import { TableFormPage } from '@/components/templates';
import { Badge, Button, Card, Input, Select, Textarea } from '@/components/ui';

interface Task {
  id: string;
  asset: string;
  task: string;
  interval: string;
  due: string;
  status: string;
  label: string;
}

// TODO: ganti dengan useFetch<Task[]>('/maintenance')
const DUMMY: Task[] = [
  { id: '1', asset: 'Sound System Aula', task: 'Cek kabel & mixer', interval: '30 hari', due: '22/11/2026', status: 'PENDING', label: 'H-4' },
  { id: '2', asset: 'AC Ruang Doa', task: 'Cuci AC', interval: '90 hari', due: '15/11/2026', status: 'TERLAMBAT', label: 'Terlambat' },
  { id: '3', asset: 'Keyboard Yamaha PSR', task: 'Pembersihan', interval: '60 hari', due: '10/12/2026', status: 'TERJADWAL', label: 'Terjadwal' },
];

export default function MaintenanceList() {
  return (
    <TableFormPage<Task>
      code="SCR-12"
      eyebrow="Sarana Prasarana"
      title="Jadwal Pemeliharaan"
      actions={<Button icon="plus">Tambah Jadwal</Button>}
      listTitle="Jadwal Aktif"
      rows={DUMMY}
      rowKey={(t) => t.id}
      columns={[
        { header: 'Aset', cell: (t) => <span className="font-medium text-ink">{t.asset}</span> },
        { header: 'Tugas', cell: (t) => t.task },
        { header: 'Interval', cell: (t) => t.interval },
        { header: 'Jatuh Tempo', cell: (t) => <span className="whitespace-nowrap font-mono text-[12.5px]">{t.due}</span> },
        { header: 'Status', cell: (t) => <Badge status={t.status} label={t.label} /> },
      ]}
      formTitle="Tambah Jadwal"
      form={
        <>
          <Select no={1} label="Aset" required options={['Sound System Aula', 'AC Ruang Doa', 'Keyboard Yamaha PSR', 'Genset']} />
          <Input no={2} label="Nama Tugas" required maxLength={150} defaultValue="Cek kabel & mixer" />
          <div className="grid grid-cols-2 gap-3">
            <Input no={3} label="Interval (hari)" type="number" min={1} required defaultValue={30} />
            <Input no={5} label="Pengingat H-" type="number" min={0} required defaultValue={7} />
          </div>
          <Input no={4} label="Tanggal Jatuh Tempo" type="date" required defaultValue="2026-11-22" />
        </>
      }
      afterForm={
        <Card title="Catat Pelaksanaan">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input no={6} label="Tanggal Pelaksanaan" type="date" required defaultValue="2026-11-16" />
            <Input no={7} label="Pelaksana" required defaultValue="Teknisi CV Suara Jaya" />
            <Select label="Kondisi Hasil" options={['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT']} />
            <Textarea label="Catatan" rows={2} defaultValue="Filter dibersihkan, freon normal." />
            <Button type="submit">Simpan</Button>
          </form>
        </Card>
      }
    />
  );
}
