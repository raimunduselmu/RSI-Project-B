// SCR-28 Pendaftaran & Presensi Kegiatan (FSD-2.30) — Template A (versi pengurus)
import { useState } from 'react';
import { TablePage } from '@/components/templates';
import { Badge, Button, StatCard } from '@/components/ui';

interface Reg {
  code: string;
  name: string;
  phone: string;
  email: string;
  hadir: boolean;
}

// TODO: ganti dengan useFetch<Reg[]>(`/events/${id}/registrations`)
const INIT: Reg[] = [
  { code: 'REG-201126-031', name: 'Maria Anindita', phone: '085712345678', email: 'anindita@student.uns.ac.id', hadir: true },
  { code: 'REG-191126-027', name: 'Yohanes Kurniawan', phone: '081398765432', email: '—', hadir: true },
  { code: 'REG-181126-020', name: 'Theresia Putri', phone: '082134567891', email: 'theresia@gmail.com', hadir: false },
  { code: 'REG-171126-011', name: 'Petrus Dimas', phone: '082100001111', email: '—', hadir: false },
];

export default function EventRegistrations() {
  const [rows, setRows] = useState(INIT);
  return (
    <TablePage<Reg>
      code="SCR-28"
      eyebrow="Kegiatan / Retret Mahasiswa 2026"
      title="Pendaftaran & Presensi"
      subtitle="Status kehadiran hanya diisi panitia/pengurus."
      actions={
        <>
          <Button variant="secondary" icon="download">Ekspor PDF</Button>
          <Button variant="secondary" icon="download">Ekspor Excel</Button>
        </>
      }
      topSlot={
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Terdaftar" value="57 / 80" tone="brand" />
          <StatCard label="Hadir" value={rows.filter((r) => r.hadir).length} tone="green" />
          <StatCard label="Sisa Kuota" value={23} />
        </div>
      }
      filters={
        <>
          <input className="field" placeholder="Cari nama / kode REG…" />
          <select className="field">
            <option>Semua kehadiran</option>
            <option>Hadir</option>
            <option>Belum hadir</option>
          </select>
        </>
      }
      filtersClassName="md:grid-cols-[2fr_1fr]"
      rows={rows}
      rowKey={(r) => r.code}
      columns={[
        { header: 'Kode', cell: (r) => <span className="whitespace-nowrap font-mono text-[12.5px] text-brand-700">{r.code}</span> },
        { header: 'Nama Peserta', cell: (r) => <span className="font-medium text-ink">{r.name}</span> },
        { header: 'Telepon', cell: (r) => <span className="font-mono text-[12.5px]">{r.phone}</span> },
        { header: 'Email', cell: (r) => r.email },
        {
          header: 'Kehadiran',
          cell: (r) => (
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="check" checked={r.hadir} onChange={(e) => setRows(rows.map((x) => (x.code === r.code ? { ...x, hadir: e.target.checked } : x)))} />
              {r.hadir ? <Badge status="HADIR" /> : <span className="text-ink/50">Belum</span>}
            </label>
          ),
        },
      ]}
    />
  );
}
