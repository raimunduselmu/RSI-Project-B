// SCR-25 Jadwal Ibadah — versi publik, mode baca (FSD-2.27) — Template J
import { PublicInfoPage } from '@/components/templates';
import { Badge, Select } from '@/components/ui';

interface Row {
  date: string;
  title: string;
  room: string;
  repeat: string;
  doc: boolean;
}

// TODO: ganti dengan useFetch<Row[]>('/public/liturgy?status=TERBIT')
const ROWS: Row[] = [
  { date: 'Sel, 24/11 07.00', title: 'Misa Kampus', room: 'Aula Gereja Kampus', repeat: 'Mingguan', doc: true },
  { date: 'Jum, 27/11 18.00', title: 'Ibadah Taize', room: 'Ruang Doa', repeat: '—', doc: false },
  { date: 'Sel, 01/12 07.00', title: 'Misa Kampus', room: 'Aula Gereja Kampus', repeat: 'Mingguan', doc: true },
  { date: 'Kam, 24/12 19.00', title: 'Misa Malam Natal KMK', room: 'Aula Gereja Kampus', repeat: '—', doc: true },
];

export default function JadwalIbadah() {
  return (
    <PublicInfoPage<Row>
      code="SCR-25"
      title="Jadwal Ibadah"
      subtitle="Hanya jadwal yang sudah TERBIT. Tata ibadah dapat diunduh bila tersedia."
      stats={[
        { label: 'Ibadah bulan ini', value: 9, tone: 'brand' },
        { label: 'Misa Kampus', value: 'Selasa 07.00', sub: 'Mingguan, Aula Gereja Kampus' },
        { label: 'Berikutnya', value: '24/11', sub: 'Misa Kampus 07.00', tone: 'ember' },
        { label: 'Tata ibadah tersedia', value: 3, tone: 'green' },
      ]}
      listTitle="Jadwal Terbit"
      filters={<Select className="!w-44 !py-1.5" options={['November 2026', 'Desember 2026']} />}
      rows={ROWS}
      rowKey={(r) => r.date + r.title}
      columns={[
        { header: 'Tanggal', cell: (r) => <span className="whitespace-nowrap font-mono text-[12.5px]">{r.date}</span> },
        { header: 'Ibadah', cell: (r) => <span className="font-medium text-ink">{r.title}</span> },
        { header: 'Ruangan', cell: (r) => r.room },
        { header: 'Pengulangan', cell: (r) => r.repeat },
        { header: 'Status', cell: () => <Badge status="TERBIT" /> },
        { header: 'Tata Ibadah', align: 'right', cell: (r) => (r.doc ? <button className="whitespace-nowrap font-mono text-xs text-brand-700 hover:text-ink">Unduh ↓</button> : <span className="text-ink/40">—</span>) },
      ]}
    />
  );
}
