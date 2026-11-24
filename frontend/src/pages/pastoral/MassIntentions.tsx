// SCR-34 Permohonan Misa/Intensi (FSD-2.36) — Template C (versi Pastor/Liturgi)
import { useState } from 'react';
import { PanelSection, ProcessPage } from '@/components/templates';
import { Badge, Button, InfoGrid, Select } from '@/components/ui';

interface Intent {
  code: string;
  name: string;
  phone: string;
  email: string;
  kind: string;
  mass: string;
  note: string;
  status: string;
}

// TODO: ganti dengan useFetch<Intent[]>('/intentions')
const DUMMY: Intent[] = [
  { code: 'INT-201126-012', name: 'Yohanes Kurniawan', phone: '081398765432', email: '—', kind: 'Syukur', mass: 'Min 29/11 08.00', note: 'Syukur atas kelulusan sidang skripsi dan ujud keluarga.', status: 'DIAJUKAN' },
  { code: 'INT-191126-011', name: 'Keluarga Santoso', phone: '081377770000', email: 'santoso@gmail.com', kind: 'Arwah', mass: 'Min 29/11 08.00', note: 'Untuk arwah Bpk. Antonius Santoso.', status: 'DIKONFIRMASI' },
  { code: 'INT-151126-009', name: 'Agnes Sari', phone: '085700001111', email: '—', kind: 'Ujian/Studi', mass: 'Sel 17/11 07.00', note: 'Kelancaran ujian akhir semester.', status: 'DILAKSANAKAN' },
];

export default function MassIntentions() {
  const [sel, setSel] = useState<Intent | null>(DUMMY[0]);
  return (
    <ProcessPage<Intent>
      code="SCR-34"
      eyebrow="Pastoral"
      title="Permohonan Misa / Intensi"
      subtitle="Permohonan masuk dari formulir publik."
      listTitle="Daftar Permohonan"
      rows={DUMMY}
      rowKey={(i) => i.code}
      selected={sel}
      onSelect={setSel}
      columns={[
        { header: 'Kode', cell: (i) => <span className="whitespace-nowrap font-mono text-[12.5px] text-brand-700">{i.code}</span> },
        { header: 'Pemohon', cell: (i) => i.name },
        { header: 'Jenis', cell: (i) => i.kind },
        { header: 'Jadwal Misa', cell: (i) => <span className="whitespace-nowrap">{i.mass}</span> },
        { header: 'Status', cell: (i) => <Badge status={i.status} /> },
      ]}
      panel={(i) => (
        <>
          <PanelSection>
            <div className="flex items-start justify-between">
              <p className="font-mono text-base text-ink">{i.code}</p>
              <Badge status={i.status} />
            </div>
          </PanelSection>
          <PanelSection>
            <InfoGrid
              items={[
                { label: 'Pemohon', value: i.name },
                { label: 'Telepon', value: i.phone },
                { label: 'Email', value: i.email },
                { label: 'Jenis', value: i.kind },
              ]}
            />
            <p className="mt-4 rounded-xl bg-white p-3 text-sm text-ink/85">{i.note}</p>
          </PanelSection>
          <PanelSection>
            <div className="space-y-4">
              <Select label="Kaitkan ke Jadwal Misa" options={['Min 29/11 08.00 — Misa Adven I', 'Sel 24/11 07.00 — Misa Kampus']} />
              <Select label="Tautkan ke Data Umat (opsional)" options={['Yohanes Kurniawan · L0124019', '— Tidak ditautkan —']} />
              <div className="flex gap-2">
                <Button variant="success" icon="check">Konfirmasi</Button>
                <Button variant="danger" icon="x">Tolak</Button>
              </div>
            </div>
          </PanelSection>
        </>
      )}
    />
  );
}
