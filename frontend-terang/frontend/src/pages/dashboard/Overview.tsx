// SCR-39 Dashboard Lintas Modul (FSD-2.41) — Template F
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button, Card, Select, StatCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

// TODO: ambil dari GET /dashboard/overview?period=
const LOANS = [
  { m: 'Agu', v: 18 },
  { m: 'Sep', v: 26 },
  { m: 'Okt', v: 23 },
  { m: 'Nov', v: 31 },
];

export default function Overview() {
  const { hasRole } = useAuth();
  const max = Math.max(...LOANS.map((l) => l.v));
  return (
    <>
      <PageHeader
        code="SCR-39"
        eyebrow="Utama"
        title="Dashboard Lintas Modul"
        subtitle="Ringkasan untuk PHT dan Pembina."
        actions={
          <>
            <Select className="!w-48" options={['Periode 2026/2027', 'Periode 2025/2026']} />
            <Button variant="secondary" icon="download">Ekspor PDF</Button>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Group title="Aset" no={2}>
          <StatCard label="Total" value={214} />
          <StatCard label="Tersedia" value={176} tone="green" />
          <StatCard label="Dipinjam" value={21} tone="brand" />
          <StatCard label="Bermasalah" value={17} tone="ember" />
        </Group>
        <Group title="Kegiatan & Liturgi" no={3}>
          <StatCard label="Kegiatan" value={14} />
          <StatCard label="Jadwal Ibadah" value={36} tone="brand" />
          <StatCard label="Peserta" value={612} tone="green" />
          <StatCard label="LPJ Tertunda" value={2} tone="amber" />
        </Group>
        {hasRole('PHT', 'Bendahara') && (
          <Group title="Keuangan" no={4} note="Hanya PHT, Bendahara, Admin">
            <StatCard label="Saldo Kas" value="Rp 24,1 jt" tone="green" />
            <StatCard label="Serapan" value="58%" tone="amber" />
            <StatCard label="Donasi" value="Rp 38,4 jt" tone="brand" />
            <StatCard label="Iuran Lunas" value="81%" tone="ember" />
          </Group>
        )}
      </div>
      <Card title="Peminjaman per Bulan" className="mt-6">
        <div className="flex h-56 items-end gap-6 px-2">
          {LOANS.map((l) => (
            <div key={l.m} className="flex flex-1 flex-col items-center gap-2">
              <span className="font-mono text-xs text-ink/70">{l.v}</span>
              <div className="w-full rounded-t-xl bg-gradient-to-t from-brand-500/60 via-brand-400/80 to-ember-300/90 shadow-glow" style={{ height: `${(l.v / max) * 160}px` }} />
              <span className="font-mono text-[11px] text-ink/55">{l.m}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function Group({ title, no, note, children }: { title: string; no: number; note?: string; children: ReactNode }) {
  return (
    <section className="glass p-5">
      <h2 className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-mono text-[10px] text-ink/80">{no}</span>
        {title}
      </h2>
      {note && <p className="mt-1 text-xs text-ink/55">{note}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3 [&_.font-display]:text-2xl">{children}</div>
    </section>
  );
}
