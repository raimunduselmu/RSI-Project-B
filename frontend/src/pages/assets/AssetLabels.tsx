// SCR-20 Cetak Label Kode Unik (FSD-2.6) — Template E
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import type { AssetRow } from '@/lib/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { QrPlaceholder } from '@/components/shared/Extras';
import { Split } from '@/components/templates';
import { Button, Card, Select } from '@/components/ui';
import { cn } from '@/lib/format';

// Aset dipilih di SCR-05 (dikirim lewat state navigasi), datanya diambil dari GET /assets/:kode.
// Cetak memakai dialog print browser (backend belum punya endpoint PDF label).
type Item = { code: string; name: string; cat: string };

export default function AssetLabels() {
  const codes = ((useLocation().state ?? {}) as { codes?: string[] }).codes ?? [];
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    Promise.all(codes.map((c) => api.get<AssetRow>(`/assets/${encodeURIComponent(c)}`).catch(() => null))).then((rs) =>
      setItems(rs.filter((a): a is AssetRow => !!a).map((a) => ({ code: a.asset_code, name: a.asset_name, cat: a.category_name }))),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codes.join(',')]);
  const [size, setSize] = useState('Sedang (50 × 25 mm)');
  const small = size.startsWith('Kecil');

  return (
    <>
      <PageHeader code="SCR-20" eyebrow="Sarana Prasarana" title="Cetak Label Kode Unik" actions={<Button icon="printer" disabled={!items.length} onClick={() => window.print()}>Cetak</Button>} />
      <Split
        sideFirst
        side={
          <Card title="Aset Terpilih" no={1}>
            <ul className="space-y-2">
              {items.map((a) => (
                <li key={a.code} className="flex items-center justify-between rounded-xl border border-slate-900/[0.08] bg-white px-3 py-2 text-sm">
                  <span>
                    <span className="font-mono text-brand-700">{a.code}</span> · {a.name}
                  </span>
                  <button className="text-ink/50 hover:text-brand-700" onClick={() => setItems(items.filter((x) => x.code !== a.code))} aria-label="Hapus">
                    ×
                  </button>
                </li>
              ))}
              {!items.length && <li className="text-sm text-brand-700">Pilih minimal 1 aset di Daftar Aset.</li>}
            </ul>
            <div className="mt-4">
              <Select no={2} label="Ukuran Label" required value={size} onChange={(e) => setSize(e.target.value)} options={['Kecil (38 × 19 mm)', 'Sedang (50 × 25 mm)']} />
            </div>
          </Card>
        }
        main={
          <Card title="Pratinjau Label" no={3}>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((a) => (
                <div key={a.code} className={cn('flex items-center gap-4 rounded-xl border-2 border-slate-900/[0.14] bg-white text-night-950', small ? 'p-2' : 'p-3')}>
                  <QrPlaceholder seed={a.code} size={small ? 56 : 72} className="!p-0" />
                  <div className="min-w-0">
                    <p className={cn('font-mono font-semibold', small ? 'text-sm' : 'text-base')}>{a.code}</p>
                    <p className="truncate text-xs">{a.name}</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-night-500">{a.cat} · KMK UNS</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        }
      />
    </>
  );
}
