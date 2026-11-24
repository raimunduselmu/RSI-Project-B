// SCR-36 Pengumuman & Templat Notifikasi (FSD-2.38) — Template B (form di kiri)
import { TableFormPage } from '@/components/templates';
import { Badge, Input, Select, Textarea } from '@/components/ui';

interface Log {
  id: string;
  to: string;
  channel: string;
  time: string;
  status: string;
  tries: string;
}

// TODO: ganti dengan useFetch<Log[]>('/announcements/:id/logs') dan POST /announcements
const DUMMY: Log[] = [
  { id: '1', to: 'andi.pratama@student.uns.ac.id', channel: 'EMAIL', time: '18/11 09.00', status: 'SENT', tries: '1' },
  { id: '2', to: 'clara.w@gmail.com', channel: 'EMAIL', time: '18/11 09.00', status: 'SENT', tries: '1' },
  { id: '3', to: 'fransiskus.adi@gmail.com', channel: 'EMAIL', time: '18/11 09.00', status: 'FAILED', tries: '2/3' },
  { id: '4', to: 'budi.santoso@gmail.com', channel: 'EMAIL', time: '18/11 08.41', status: 'PENDING', tries: '0' },
];

export default function AnnouncementList() {
  return (
    <TableFormPage<Log>
      code="SCR-36"
      eyebrow="Komunikasi"
      title="Pengumuman & Templat Notifikasi"
      formSide="left"
      formTitle="Buat Pengumuman"
      submitLabel="Jadwalkan"
      form={
        <>
          <Input no={1} label="Judul" required maxLength={150} defaultValue="Misa Malam Natal KMK UNS 2026" />
          <Textarea no={2} label="Pesan" required maxLength={1000} rows={4} defaultValue="Misa Malam Natal KMK UNS akan dilaksanakan Kamis, 24 Desember 2026 pukul 19.00 di Aula Gereja Kampus." />
          <div className="space-y-1.5">
            <p className="field-label">Kanal <span className="text-rose-600">*</span></p>
            <div className="flex gap-5 text-sm text-ink/85">
              <label className="flex items-center gap-2"><input type="checkbox" className="check" defaultChecked /> Aplikasi</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="check" defaultChecked /> Email</label>
            </div>
            <p className="text-xs text-ink/55">WhatsApp tidak dikirim otomatis; gunakan tautan wa.me.</p>
          </div>
          <Select no={4} label="Kelompok Penerima" required options={['Semua pengurus', 'Semua umat', 'Mahasiswa', 'Panitia Natal']} />
          <Input no={5} label="Jadwal Kirim" type="datetime-local" defaultValue="2026-12-20T08:00" hint="Kosongkan untuk kirim sekarang" />
        </>
      }
      listTitle="Log Pengiriman"
      rows={DUMMY}
      rowKey={(l) => l.id}
      columns={[
        { header: 'Penerima', cell: (l) => l.to },
        { header: 'Kanal', cell: (l) => <span className="font-mono text-[12px]">{l.channel}</span> },
        { header: 'Waktu', cell: (l) => <span className="whitespace-nowrap font-mono text-[12.5px]">{l.time}</span> },
        { header: 'Status', cell: (l) => <Badge status={l.status} /> },
        { header: 'Percobaan', cell: (l) => l.tries, align: 'center' },
      ]}
    />
  );
}
