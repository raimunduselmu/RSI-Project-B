// SCR-23 Periode, Divisi & Jabatan (FSD-2.25) — Template B (form di kiri)
import { TableFormPage } from '@/components/templates';
import { Badge, Button, Input, Select } from '@/components/ui';

interface Row {
  division: string;
  position: string;
  person: string;
  role: string;
  account: string;
}

// TODO: ganti dengan useFetch('/periods/active/structure')
const DUMMY: Row[] = [
  { division: 'PHT', position: 'Ketua', person: 'Gregorius Bima', role: 'PHT', account: 'AKTIF' },
  { division: 'Keuangan', position: 'Bendahara I', person: 'Andi Pratama', role: 'Bendahara', account: 'AKTIF' },
  { division: 'Sarana Prasarana', position: 'Kepala Divisi', person: 'Fransiskus Adi', role: 'Sarpras', account: 'AKTIF' },
  { division: 'Liturgi', position: 'Koordinator', person: 'Clara Wulandari', role: 'Liturgi', account: 'AKTIF' },
];

export default function OrganizationPage() {
  return (
    <TableFormPage<Row>
      code="SCR-23"
      eyebrow="Kepengurusan"
      title="Periode, Divisi & Jabatan"
      actions={<Button variant="secondary" icon="archive">Arsipkan Periode</Button>}
      formSide="left"
      formTitle="Periode"
      form={
        <>
          <Input no={1} label="Nama Periode" required placeholder="YYYY/YYYY" defaultValue="2026/2027" />
          <Input no={2} label="Tanggal Mulai / Selesai" required defaultValue="01/08/2026 – 31/07/2027" />
          <Select no={3} label="Status Periode" required options={['AKTIF', 'ARSIP']} />
        </>
      }
      listTitle="Struktur Kepengurusan 2026/2027"
      filters={
        <div className="grid items-end gap-3 sm:col-span-3 sm:grid-cols-[1fr_1fr_1.3fr_auto]">
          <Input no={4} label="Nama Divisi" required maxLength={80} defaultValue="Keuangan" />
          <Input no={5} label="Nama Jabatan" required maxLength={80} defaultValue="Bendahara I" />
          <Select no={6} label="Pengurus" required options={['Andi Pratama (umat aktif)', 'Maria Anindita (umat aktif)', 'Yohanes Kurniawan (umat aktif)']} />
          <Button>Tetapkan</Button>
        </div>
      }
      rows={DUMMY}
      rowKey={(r) => r.division + r.position}
      columns={[
        { header: 'Divisi', cell: (r) => <span className="font-medium text-ink">{r.division}</span> },
        { header: 'Jabatan', cell: (r) => r.position },
        { header: 'Pengurus', cell: (r) => r.person },
        { header: 'Role Sistem', cell: (r) => <Badge status={r.role} tone="blue" label={r.role} /> },
        { header: 'Akun', cell: (r) => <Badge status={r.account} /> },
      ]}
      afterTable={<p className="px-1 text-xs text-ink/55">Role sistem diberikan otomatis saat pengurus ditetapkan dan dicabut saat periode diarsipkan.</p>}
    />
  );
}
