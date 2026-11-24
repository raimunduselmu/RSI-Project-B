// SCR-14 Pemeriksaan Fisik Inventaris (FSD-2.17) — Template A
import { useState } from 'react';
import { TablePage } from '@/components/templates';
import { Button, Input, StatCard } from '@/components/ui';

interface Item {
  code: string;
  name: string;
  sysLoc: string;
  found: boolean;
  loc: string;
  cond: string;
}

// TODO: ganti dengan useFetch<Item[]>('/stocktakes/:id/items')
const INIT: Item[] = [
  { code: 'MUSI-120326', name: 'Keyboard Yamaha PSR', sysLoc: 'Aula', found: true, loc: 'Aula', cond: 'BAIK' },
  { code: 'PERA-190626', name: 'Kursi Lipat (30)', sysLoc: 'Aula', found: true, loc: 'Gudang', cond: 'BAIK' },
  { code: 'ELEC-150925', name: 'Speaker Aktif JBL', sysLoc: 'Ruang Sound', found: false, loc: '', cond: '' },
];

export default function StocktakeList() {
  const [items, setItems] = useState(INIT);
  const set = (code: string, patch: Partial<Item>) => setItems((xs) => xs.map((x) => (x.code === code ? { ...x, ...patch } : x)));

  return (
    <TablePage<Item>
      code="SCR-14"
      eyebrow="Sarana Prasarana"
      title="Pemeriksaan Fisik Inventaris"
      subtitle="Bandingkan data sistem dengan kondisi fisik."
      actions={<Button variant="danger" icon="check">Tutup Periode</Button>}
      topSlot={
        <div className="grid gap-4 md:grid-cols-4">
          <div className="glass p-5">
            <Input no={1} label="Nama Periode" required defaultValue="Stock Opname Semester Ganjil 2026" />
          </div>
          <StatCard label="Diperiksa" value="168 / 214" tone="brand" />
          <StatCard label="Tidak Ditemukan" value={3} tone="ember" />
          <StatCard label="Kondisi Berubah" value={7} tone="amber" />
        </div>
      }
      cardTitle="Item Pemeriksaan"
      cardActions={<input className="field !w-48 !py-1.5" placeholder="Cari kode unik…" />}
      rows={items}
      rowKey={(i) => i.code}
      columns={[
        { header: 'Kode', cell: (i) => <span className="whitespace-nowrap font-mono text-[12.5px] text-brand-700">{i.code}</span> },
        { header: 'Aset', cell: (i) => <span className="font-medium text-ink">{i.name}</span> },
        { header: 'Lokasi Sistem', cell: (i) => i.sysLoc },
        {
          header: 'Ditemukan',
          cell: (i) => (
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="check" checked={i.found} onChange={(e) => set(i.code, { found: e.target.checked })} />
              {i.found ? 'Ya' : 'Tidak'}
            </label>
          ),
        },
        { header: 'Lokasi Aktual', cell: (i) => <input className="field !py-1.5" disabled={!i.found} value={i.loc} onChange={(e) => set(i.code, { loc: e.target.value })} /> },
        {
          header: 'Kondisi Aktual',
          cell: (i) => (
            <select className="field !py-1.5" disabled={!i.found} value={i.cond} onChange={(e) => set(i.code, { cond: e.target.value })}>
              <option value="">—</option>
              <option>BAIK</option>
              <option>RUSAK_RINGAN</option>
              <option>RUSAK_BERAT</option>
            </select>
          ),
        },
      ]}
    />
  );
}
