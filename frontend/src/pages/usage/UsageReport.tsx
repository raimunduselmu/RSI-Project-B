// SCR-11 Lapor Pemakaian Internal (FSD-2.13) — Template D
import { useNavigate } from 'react-router-dom';
import { FormGrid, FormPage } from '@/components/templates';
import { Input, Select } from '@/components/ui';

export default function UsageReport() {
  const nav = useNavigate();
  // TODO: kirim ke POST /usage-reports
  return (
    <FormPage
      code="SCR-11"
      eyebrow="Sarana Prasarana"
      title="Lapor Pemakaian Internal"
      subtitle="Tanpa persetujuan bertingkat. Jadwal langsung masuk kalender."
      submitLabel="Kirim Laporan"
      onCancel={() => nav('/dashboard')}
    >
      <FormGrid>
        <Input no={1} label="Nama Penanggung Jawab" required defaultValue="Clara Wulandari" hint="Terisi dari profil" />
        <Input no={2} label="Telepon" required defaultValue="081227654321" />
        <Input no={3} label="Divisi" required maxLength={80} defaultValue="Liturgi" />
        <Input no={4} label="Nama Kegiatan" required maxLength={150} defaultValue="Latihan Petugas Misa Adven" />
        <Select no={5} label="Ruangan" options={['Aula Gereja Kampus', 'Ruang Doa', '— Tidak memakai ruangan —']} />
        <Select no={6} label="Aset Dipakai" hint="Hanya aset TERSEDIA" options={['Keyboard Yamaha PSR, Mic Wireless (2)', 'Proyektor Epson EB-X', '— Tidak ada —']} />
        <Input no={7} label="Waktu Mulai" type="datetime-local" required defaultValue="2026-11-25T16:00" />
        <Input label="Perkiraan Selesai" type="datetime-local" required defaultValue="2026-11-25T18:00" />
      </FormGrid>
    </FormPage>
  );
}
