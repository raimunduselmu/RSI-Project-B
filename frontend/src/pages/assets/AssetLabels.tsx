
// SCR-20 Cetak Label Kode Unik (FSD-2.6) — Template E
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { AssetRow } from '@/lib/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { QrPlaceholder } from '@/components/shared/Extras';
import { Split } from '@/components/templates';
import { Alert, Button, Card, Select } from '@/components/ui';
import { cn } from '@/lib/format';

type Item = {
  code: string;
  name: string;
  cat: string;
};

export default function AssetLabels() {
  const location = useLocation();
  const navigate = useNavigate();

  const codes =
    ((location.state ?? {}) as { codes?: string[] }).codes ?? [];
  const codesKey = codes.join(',');

  const [items, setItems] = useState<Item[]>([]);
  const [size, setSize] = useState('Sedang (50 × 25 mm)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const small = size.startsWith('Kecil');

  useEffect(() => {
    let active = true;

    const loadAssets = async () => {
      if (!codesKey) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const results = await Promise.all(
          codesKey.split(',').map((code) =>
            api
              .get<AssetRow>(`/assets/${encodeURIComponent(code)}`)
              .catch(() => null),
          ),
        );

        if (!active) return;

        const loaded = results
          .filter((asset): asset is AssetRow => asset !== null)
          .map((asset) => ({
            code: asset.asset_code,
            name: asset.asset_name,
            cat: asset.category_name,
          }));

        setItems(loaded);

        if (!loaded.length) {
          setError('Data aset tidak berhasil dimuat.');
        } else if (loaded.length < codesKey.split(',').length) {
          setError('Beberapa aset gagal dimuat dan tidak ditampilkan.');
        }
      } catch {
        if (active) {
          setError('Terjadi kesalahan saat mengambil data aset.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadAssets();

    return () => {
      active = false;
    };
  }, [codesKey]);

  const removeItem = (code: string) => {
    setItems((current) => current.filter((item) => item.code !== code));
  };

  return (
    <>
      <PageHeader
        code="SCR-20"
        eyebrow="Sarana Prasarana"
        title="Cetak Label Kode Unik"
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/assets')}>
              Kembali
            </Button>
            <Button
              icon="printer"
              disabled={!items.length || loading}
              onClick={() => window.print()}
            >
              Cetak
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <Split
        sideFirst
        side={
          <Card title="Aset Terpilih" no={1}>
            {loading ? (
              <p className="text-sm text-ink/60">Memuat data aset...</p>
            ) : (
              <ul className="space-y-2">
                {items.map((asset) => (
                  <li
                    key={asset.code}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-900/[0.08] bg-white px-3 py-2 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="font-mono text-brand-700">
                        {asset.code}
                      </span>
                      <span> · {asset.name}</span>
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-ink/50 hover:text-brand-700"
                      onClick={() => removeItem(asset.code)}
                      aria-label={`Hapus label ${asset.code}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
                {!items.length && (
                  <li className="text-sm text-brand-700">
                    Pilih minimal satu aset di Daftar Aset.
                  </li>
                )}
              </ul>
            )}

            <div className="mt-4">
              <Select
                no={2}
                label="Ukuran Label"
                required
                value={size}
                onChange={(event) => setSize(event.target.value)}
                options={[
                  'Kecil (38 × 19 mm)',
                  'Sedang (50 × 25 mm)',
                ]}
              />
            </div>
          </Card>
        }
        main={
          <Card title="Pratinjau Label" no={3}>
            {items.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((asset) => (
                  <div
                    key={asset.code}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border-2 border-slate-900/[0.14] bg-white text-night-950',
                      small ? 'p-2' : 'p-3',
                    )}
                  >
                    <QrPlaceholder
                      seed={asset.code}
                      size={small ? 56 : 72}
                      className="!p-0"
                    />
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'font-mono font-semibold',
                          small ? 'text-sm' : 'text-base',
                        )}
                      >
                        {asset.code}
                      </p>
                      <p className="truncate text-xs">{asset.name}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-night-500">
                        {asset.cat} · KMK UNS
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-ink/55">
                Belum ada label untuk ditampilkan.
              </p>
            )}
          </Card>
        }
      />
    </>
  );
}
