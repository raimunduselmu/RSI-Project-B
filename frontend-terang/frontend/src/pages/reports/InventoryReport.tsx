// SCR-16 Laporan Inventaris (FSD-2.19) — Template F
import { useState } from 'react';
import { DashboardPage } from '@/components/templates';
import { Button, Card, Input, Segmented, Select, Table } from '@/components/ui';

// TODO: ambil dari GET /reports/inventory?...
const ROWS = [
  { cat: 'Elektronik', total: 58, baik: 49, ringan: 5, berat: 1, hilang: 3 },
  { cat: 'Alat Musik', total: 22, baik: 20, ringan: 2, berat: 0, hilang: 0 },
  { cat: 'Perabot', total: 96, baik: 90, ringan: 3, berat: 1, hilang: 2 },
  { cat: 'Liturgi', total: 38, baik: 38, ringan: 0, berat: 0, hilang: 0 },
];

export default function InventoryReport() {
  const [fmt, setFmt] = useState<'PDF' | 'XLSX'>('PDF');
  return (
    <DashboardPage
      code="SCR-16"
      eyebrow="Sarana Prasarana"
      title="Laporan Inventaris"
      topSlot={
        <Card>
          <div className="grid items-end gap-4 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <Select no={1} label="Jenis Laporan" required options={['Inventaris', 'Peminjaman', 'Pemeliharaan', 'Insiden']} />
            <Input no={2} label="Periode" required defaultValue="01/08/2026 – 18/11/2026" />
            <Select no={3} label="Kategori" options={['Semua kategori', 'Elektronik', 'Alat Musik', 'Perabot', 'Liturgi']} />
            <div className="space-y-1.5">
              <p className="field-label">Format Ekspor</p>
              <Segmented value={fmt} onChange={setFmt} options={[{ value: 'PDF', label: 'PDF' }, { value: 'XLSX', label: 'XLSX' }]} />
            </div>
            <Button icon="download">Ekspor</Button>
          </div>
        </Card>
      }
      stats={[
        { label: 'Total Aset', value: 214 },
        { label: 'Tersedia', value: 176, tone: 'green' },
        { label: 'Dipinjam', value: 21, tone: 'brand' },
        { label: 'Pemeliharaan', value: 12, tone: 'amber' },
        { label: 'Hilang', value: 5, tone: 'ember' },
      ]}
      panelCols={1}
    >
      <Card title="Ringkasan per Kategori">
        <Table
          rows={ROWS}
          rowKey={(r) => r.cat}
          columns={[
            { header: 'Kategori', cell: (r) => <span className="font-medium text-ink">{r.cat}</span> },
            { header: 'Jumlah', cell: (r) => r.total, align: 'right' },
            { header: 'Baik', cell: (r) => r.baik, align: 'right' },
            { header: 'Rusak Ringan', cell: (r) => r.ringan, align: 'right' },
            { header: 'Rusak Berat', cell: (r) => r.berat, align: 'right' },
            { header: 'Hilang', cell: (r) => r.hilang, align: 'right' },
          ]}
        />
      </Card>
    </DashboardPage>
  );
}
