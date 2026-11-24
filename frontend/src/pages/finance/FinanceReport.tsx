// SCR-33 Laporan Keuangan & Donasi (FSD-2.35) — Template F
import { DashboardPage } from '@/components/templates';
import { Button, Card, Input, Select, Table } from '@/components/ui';

// TODO: ambil dari GET /finance/reports?period=&type=
const ROWS = [
  { month: 'Agustus', open: 'Rp 15.200.000', inn: 'Rp 6.150.000', out: 'Rp 4.020.000', close: 'Rp 17.330.000' },
  { month: 'September', open: 'Rp 17.330.000', inn: 'Rp 7.480.000', out: 'Rp 5.900.000', close: 'Rp 18.910.000' },
  { month: 'Oktober', open: 'Rp 18.910.000', inn: 'Rp 9.010.000', out: 'Rp 6.250.000', close: 'Rp 21.670.000' },
  { month: 'November', open: 'Rp 21.670.000', inn: 'Rp 8.420.000', out: 'Rp 5.960.000', close: 'Rp 24.130.000' },
];

export default function FinanceReport() {
  return (
    <DashboardPage
      code="SCR-33"
      eyebrow="Keuangan"
      title="Laporan Keuangan & Donasi"
      actions={<Button icon="download">Ekspor PDF / Excel</Button>}
      topSlot={
        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Select no={1} label="Periode" required options={['2026/2027', '2025/2026']} />
            <Input no={2} label="Rentang Tanggal" defaultValue="01/08/2026 – 18/11/2026" />
            <Select no={3} label="Jenis Laporan" required options={['Kas', 'Anggaran', 'Donasi']} />
          </div>
        </Card>
      }
      stats={[
        { label: 'Saldo Awal', value: 'Rp 15,2 jt' },
        { label: 'Total Masuk', value: 'Rp 31,1 jt', tone: 'green' },
        { label: 'Total Keluar', value: 'Rp 22,1 jt', tone: 'ember' },
        { label: 'Saldo Akhir', value: 'Rp 24,1 jt', tone: 'brand' },
      ]}
      panelCols={1}
    >
      <Card title="Laporan Kas · Agustus–November 2026">
        <Table
          rows={ROWS}
          rowKey={(r) => r.month}
          columns={[
            { header: 'Bulan', cell: (r) => <span className="font-medium text-ink">{r.month}</span> },
            { header: 'Saldo Awal', cell: (r) => r.open, align: 'right' },
            { header: 'Masuk', cell: (r) => <span className="text-emerald-600">{r.inn}</span>, align: 'right' },
            { header: 'Keluar', cell: (r) => <span className="text-brand-700">{r.out}</span>, align: 'right' },
            { header: 'Saldo Akhir', cell: (r) => r.close, align: 'right' },
          ]}
        />
      </Card>
    </DashboardPage>
  );
}
