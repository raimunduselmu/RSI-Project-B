// SCR-35 Pendampingan, Konseling & Kunjungan (FSD-2.37) — Template C (versi Pastor)
import { useState } from 'react';
import { PanelSection, ProcessPage } from '@/components/templates';
import { Badge, Button, InfoGrid, Input, Select, Textarea } from '@/components/ui';

interface Care {
  code: string;
  name: string;
  phone: string;
  kind: string;
  need: string;
  date: string;
  status: string;
}

// TODO: ganti dengan useFetch<Care[]>('/pastoral-cares') — data rahasia, hanya Pastor
const DUMMY: Care[] = [
  { code: 'PST-201126-007', name: 'Theresia Putri', phone: '082134567891', kind: 'KONSELING', need: 'Ingin berbincang dengan Romo terkait pergumulan studi.', date: '—', status: 'BARU' },
  { code: 'PST-181126-005', name: 'Keluarga Hadi', phone: '081311110000', kind: 'KUNJUNGAN', need: 'Kunjungan orang tua yang sedang sakit.', date: '21/11 16.00', status: 'PROSES' },
  { code: 'PST-111126-002', name: 'Petrus Dimas', phone: '082100001111', kind: 'PENDAMPINGAN', need: 'Pendampingan persiapan krisma.', date: '12/11 19.00', status: 'SELESAI' },
];

export default function PastoralCares() {
  const [sel, setSel] = useState<Care | null>(DUMMY[0]);
  return (
    <ProcessPage<Care>
      code="SCR-35"
      eyebrow="Pastoral"
      title="Pendampingan, Konseling & Kunjungan"
      subtitle="Ringkasan bersifat rahasia — hanya terlihat oleh Pastor."
      listTitle="Daftar Permintaan"
      rows={DUMMY}
      rowKey={(c) => c.code}
      selected={sel}
      onSelect={setSel}
      columns={[
        { header: 'Kode', cell: (c) => <span className="whitespace-nowrap font-mono text-[12.5px] text-brand-700">{c.code}</span> },
        { header: 'Pemohon', cell: (c) => c.name },
        { header: 'Layanan', cell: (c) => c.kind },
        { header: 'Jadwal', cell: (c) => <span className="whitespace-nowrap">{c.date}</span> },
        { header: 'Status', cell: (c) => <Badge status={c.status} /> },
      ]}
      panel={(c) => (
        <>
          <PanelSection>
            <div className="flex items-start justify-between">
              <p className="font-mono text-base text-ink">{c.code}</p>
              <Badge status={c.status} />
            </div>
          </PanelSection>
          <PanelSection>
            <InfoGrid items={[{ label: 'Pemohon', value: c.name }, { label: 'Telepon', value: c.phone }]} />
            <p className="mt-4 rounded-xl bg-white p-3 text-sm text-ink/85">{c.need}</p>
          </PanelSection>
          <PanelSection>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Select no={5} label="Jenis Layanan" required options={['PENDAMPINGAN', 'KONSELING', 'KUNJUNGAN']} defaultValue={c.kind} />
              <Input no={6} label="Tanggal" type="datetime-local" required defaultValue="2026-11-23T15:00" />
              <Textarea no={7} label="Ringkasan" required rows={3} placeholder="Catatan pendampingan…" />
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="checkbox" className="check" defaultChecked /> Tandai rahasia
              </label>
              <Select no={8} label="Status Tindak Lanjut" required options={['BARU', 'PROSES', 'SELESAI']} defaultValue={c.status} />
              <Button type="submit">Simpan</Button>
            </form>
          </PanelSection>
        </>
      )}
    />
  );
}
