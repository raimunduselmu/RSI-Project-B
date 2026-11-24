// SCR-41 Verifikasi Iuran Kas (FSD-2.44) — Template C
import { useState } from 'react';
import { DecisionBox, PanelSection, ProcessPage } from '@/components/templates';
import { Alert, Badge, Select } from '@/components/ui';

interface Dues {
  code: string;
  name: string;
  months: string;
  total: string;
  method: string;
  date: string;
  status: string;
}

// TODO: ganti dengan useFetch<Dues[]>('/kas/payments?status=')
const DUMMY: Dues[] = [
  { code: 'IUR-181126-005', name: 'Clara Wulandari', months: 'Okt, Nov', total: 'Rp 50.000', method: 'QRIS', date: '18/11', status: 'MENUNGGU_VERIFIKASI' },
  { code: 'IUR-181126-004', name: 'Fransiskus Adi', months: 'Nov', total: 'Rp 25.000', method: 'CASH', date: '18/11', status: 'DISETUJUI' },
  { code: 'IUR-171126-002', name: 'Yosef Hendra', months: 'Sep, Okt, Nov', total: 'Rp 75.000', method: 'QRIS', date: '17/11', status: 'DITOLAK' },
];

export default function KasVerification() {
  const [sel, setSel] = useState<Dues | null>(DUMMY[0]);
  return (
    <ProcessPage<Dues>
      code="SCR-41"
      eyebrow="Keuangan"
      title="Verifikasi Iuran Kas"
      actions={<Select className="!w-56" options={['MENUNGGU_VERIFIKASI', 'DISETUJUI', 'DITOLAK']} />}
      listTitle="Daftar Pengajuan"
      rows={DUMMY}
      rowKey={(d) => d.code}
      selected={sel}
      onSelect={setSel}
      columns={[
        { header: 'Kode', cell: (d) => <span className="whitespace-nowrap font-mono text-[12.5px] text-brand-700">{d.code}</span> },
        { header: 'Pengurus', cell: (d) => d.name },
        { header: 'Bulan', cell: (d) => d.months },
        { header: 'Total', cell: (d) => <span className="whitespace-nowrap">{d.total}</span> },
        { header: 'Metode', cell: (d) => d.method },
        { header: 'Status', cell: (d) => <Badge status={d.status} label={d.status === 'MENUNGGU_VERIFIKASI' ? 'Menunggu' : undefined} /> },
      ]}
      panel={(d) => (
        <>
          <PanelSection>
            <p className="font-mono text-base text-ink">{d.code}</p>
            <p className="mt-0.5 text-sm text-ink/65">
              {d.name} · {d.months.split(',').length} bulan · {d.method}
            </p>
          </PanelSection>
          <PanelSection title="Pratinjau Bukti">
            <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-slate-900/[0.08] bg-gradient-to-br from-brand-400/10 to-ember-400/10 text-center">
              <p className="font-medium text-ink">Bukti transfer {d.method}</p>
              <p className="mt-1 font-mono text-xs text-ink/60">
                {d.total} · {d.date}/2026
              </p>
            </div>
          </PanelSection>
          <PanelSection>
            <DecisionBox />
            <div className="mt-4">
              <Alert tone="info">Setujui: bulan menjadi LUNAS dan Kas Masuk tercatat otomatis. Pengajuan milik Bendahara diverifikasi oleh PHT.</Alert>
            </div>
          </PanelSection>
        </>
      )}
    />
  );
}
