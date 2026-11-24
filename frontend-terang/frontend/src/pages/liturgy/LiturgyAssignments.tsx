// SCR-26 Penugasan & Rolling Petugas Liturgi (FSD-2.28) — Template A
import { TablePage } from '@/components/templates';
import { WaLink } from '@/components/shared/Extras';
import { Alert, Badge, Button, Input, Select } from '@/components/ui';

interface Duty {
  id: string;
  role: string;
  person: string;
  phone: string;
  count: number;
  confirm: string;
}

// TODO: ganti dengan useFetch<Duty[]>('/liturgy/assignments?schedule=')
const DUMMY: Duty[] = [
  { id: '1', role: 'Lektor I', person: 'Maria Anindita', phone: '085712345678', count: 3, confirm: 'BERSEDIA' },
  { id: '2', role: 'Lektor II', person: 'Yohanes Kurniawan', phone: '081398765432', count: 2, confirm: 'MENUNGGU' },
  { id: '3', role: 'Pemazmur', person: 'Theresia Putri', phone: '082134567891', count: 4, confirm: 'MENOLAK' },
  { id: '4', role: 'Organis', person: 'Dr. Ignatius Hadi', phone: '081211112222', count: 5, confirm: 'BERSEDIA' },
];

export default function LiturgyAssignments() {
  return (
    <TablePage<Duty>
      code="SCR-26"
      eyebrow="Liturgi"
      title="Penugasan & Rolling Petugas Liturgi"
      actions={<Button variant="secondary" icon="history">Buat Rolling</Button>}
      topSlot={
        <div className="glass grid items-end gap-3 p-5 md:grid-cols-[1.4fr_1fr_1.2fr_1.2fr_auto]">
          <Select no={1} label="Jadwal Ibadah" required options={['Min, 29/11 08.00 — Misa Adven I', 'Sel, 24/11 07.00 — Misa Kampus']} />
          <Select no={2} label="Jenis Petugas" required options={['Lektor', 'Pemazmur', 'Organis', 'Misdinar', 'Prodiakon']} />
          <Select no={3} label="Petugas" required options={['Maria Anindita (umat aktif)', 'Yohanes Kurniawan (umat aktif)', 'Theresia Putri (umat aktif)']} />
          <Input no={4} label="Rentang Rolling" defaultValue="29/11/2026 – 27/12/2026" />
          <Button>Tugaskan</Button>
        </div>
      }
      cardTitle="Petugas Misa Adven I"
      rows={DUMMY}
      rowKey={(d) => d.id}
      columns={[
        { header: 'Jenis Petugas', cell: (d) => d.role },
        { header: 'Petugas', cell: (d) => <span className="font-medium text-ink">{d.person}</span> },
        { header: 'Jumlah Tugas (Periode)', cell: (d) => d.count, align: 'center' },
        {
          header: 'Konfirmasi',
          cell: (d) => (
            <select className="field !w-36 !py-1 text-xs" defaultValue={d.confirm}>
              <option>MENUNGGU</option>
              <option>BERSEDIA</option>
              <option>MENOLAK</option>
            </select>
          ),
        },
        { header: 'Status', cell: (d) => <Badge status={d.confirm} /> },
        { header: 'Hubungi', cell: (d) => <WaLink phone={d.phone} text={`Halo ${d.person}, Anda dijadwalkan sebagai ${d.role} pada Misa Adven I.`} /> },
      ]}
    >
      <Alert tone="info">Konfirmasi dicatat oleh Divisi Liturgi setelah petugas dihubungi melalui tautan wa.me.</Alert>
    </TablePage>
  );
}
