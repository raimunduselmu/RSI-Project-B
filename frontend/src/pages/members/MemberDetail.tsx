// SCR-22 Riwayat Pelayanan & Sakramen/Katekese (FSD-2.24) — Template E
import { PageHeader } from '@/components/shared/PageHeader';
import { Split } from '@/components/templates';
import { Badge, Button, Card, Input, Select, Textarea } from '@/components/ui';

// TODO: ganti dengan useFetch(`/members/${id}/records`) + POST (append-only)
const RECORDS = [
  { kind: 'SAKRAMEN', date: '14/04/2024', title: 'Krisma', note: 'Paroki St. Antonius Purbayan' },
  { kind: 'PELAYANAN', date: '03/09/2026', title: 'Lektor Misa Kampus', note: 'Periode 2026/2027' },
  { kind: 'KATEKESE', date: '10/02/2026', title: 'Katekese Persiapan Krisma (pendamping)', note: 'Periode 2025/2026' },
  { kind: 'PELAYANAN', date: '20/12/2025', title: 'Panitia Natal KMK', note: 'Periode 2025/2026' },
];

export default function MemberDetail() {
  return (
    <>
      <PageHeader code="SCR-22" eyebrow="Keumatan / Maria Anindita" title="Riwayat Pelayanan & Sakramen/Katekese" subtitle="Append-only — koreksi ditambahkan sebagai catatan baru." />
      <Split
        main={
          <Card title="Riwayat">
            <ol className="relative space-y-6 border-l border-slate-900/[0.08] pl-6">
              {RECORDS.map((r, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-300 ring-4 ring-slate-900/10" />
                  <div className="flex items-center gap-2">
                    <Badge status={r.kind} tone={r.kind === 'SAKRAMEN' ? 'violet' : r.kind === 'KATEKESE' ? 'amber' : 'blue'} />
                    <span className="font-mono text-[11px] text-ink/55">{r.date}</span>
                  </div>
                  <p className="mt-1.5 font-medium text-ink">{r.title}</p>
                  <p className="text-sm text-ink/60">{r.note}</p>
                </li>
              ))}
            </ol>
          </Card>
        }
        side={
          <Card title="Tambah Riwayat">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Select no={1} label="Jenis Riwayat" required options={['PELAYANAN', 'SAKRAMEN', 'KATEKESE']} />
              <Input no={2} label="Judul" required maxLength={150} defaultValue="Pemazmur Misa Adven" />
              <div className="grid grid-cols-2 gap-3">
                <Input no={3} label="Tanggal" type="date" required defaultValue="2026-11-15" />
                <Select no={4} label="Periode" required options={['2026/2027', '2025/2026']} />
              </div>
              <Textarea no={5} label="Catatan" maxLength={255} rows={2} />
              <Button type="submit">Simpan</Button>
            </form>
          </Card>
        }
      />
    </>
  );
}
