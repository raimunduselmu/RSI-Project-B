// SCR-15 Dashboard Transparansi Donatur (FSD-2.18) — Template J
import { PublicInfoPage } from '@/components/templates';
import { Badge, Select } from '@/components/ui';

interface Row {
  donor: string;
  asset: string;
  category: string;
  condition: string;
  status: string;
  received: string;
  borrowed: string;
}

// TODO: ganti dengan useFetch<Row[]>('/public/donor-transparency?...')
const DUMMY: Row[] = [
  { donor: 'Keluarga Wijaya', asset: 'Keyboard Yamaha PSR', category: 'Alat Musik', condition: 'BAIK', status: 'TERSEDIA', received: '12/03/2026', borrowed: '7 kali' },
  { donor: 'Anonim', asset: 'Proyektor Epson EB-X', category: 'Elektronik', condition: 'BAIK', status: 'DIPINJAM', received: '02/05/2026', borrowed: '11 kali' },
  { donor: 'Alumni Angkatan 2015', asset: 'Kursi Lipat (30 unit)', category: 'Perabot', condition: 'BAIK', status: 'TERSEDIA', received: '19/06/2026', borrowed: '4 kali' },
  { donor: 'Anonim', asset: 'Mic Wireless Shure', category: 'Elektronik', condition: 'RUSAK_RINGAN', status: 'PEMELIHARAAN', received: '08/08/2026', borrowed: '9 kali' },
  { donor: 'Ibu M. Kristiani', asset: 'Lemari Arsip', category: 'Perabot', condition: 'BAIK', status: 'TERSEDIA', received: '21/09/2026', borrowed: '—' },
];

export default function Transparansi() {
  return (
    <PublicInfoPage<Row>
      code="SCR-15"
      title="Transparansi Donatur"
      subtitle="Ringkasan donasi dan aset hasil sumbangan. Identitas donatur hanya tampil bila donatur menyetujui."
      stats={[
        { label: 'Aset Sumbangan', value: '48 unit', sub: '42 baik · 6 perlu perbaikan', tone: 'brand' },
        { label: 'Sedang Dipinjam', value: '5 unit' },
        { label: 'Donasi Uang 2026', value: 'Rp 38,4 jt', sub: 'Hanya donasi yang disetujui tampil', tone: 'ember' },
        { label: 'Jumlah Donatur', value: 31 },
      ]}
      listTitle="Daftar Aset Sumbangan"
      filters={
        <div className="flex gap-2">
          <input className="field !w-48 !py-1.5" placeholder="Cari nama donatur" />
          <Select className="!w-36 !py-1.5" options={['Tahun 2026', 'Tahun 2025']} />
        </div>
      }
      rows={DUMMY}
      columns={[
        { header: 'Donatur', cell: (r) => <span className="font-medium text-ink">{r.donor}</span> },
        { header: 'Aset', cell: (r) => r.asset },
        { header: 'Kategori', cell: (r) => r.category },
        { header: 'Kondisi', cell: (r) => <Badge status={r.condition} /> },
        { header: 'Status', cell: (r) => <Badge status={r.status} /> },
        { header: 'Diterima', cell: (r) => <span className="whitespace-nowrap font-mono text-[12.5px]">{r.received}</span> },
        { header: 'Dipinjam', cell: (r) => r.borrowed, align: 'right' },
      ]}
    />
  );
}
