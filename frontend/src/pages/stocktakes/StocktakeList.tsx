
// SCR-14 Pemeriksaan Fisik Inventaris (FSD-2.17) — Template A

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/shared/PageHeader';
import { api } from '@/lib/api';

interface Asset {
  asset_id: string;
  asset_code: string;
  asset_name: string;
  category_name: string;
  location_text: string;
  asset_condition: string;
  status: string;
}

interface StocktakeItem {
  asset_id: string;
  asset_code: string;
  asset_name: string;
  location_text: string;
  condition: string;
  note: string;
  checked: boolean;
}

interface Stocktake {
  id: string;
  name: string;
  date: string;
  status: 'BERLANGSUNG' | 'SELESAI';
  items: StocktakeItem[];
}

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function formatDate(value: string) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`));
}

export default function StocktakeList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stocktakes, setStocktakes] = useState<Stocktake[]>([]);
  const [activeId, setActiveId] = useState('');
  const [periodName, setPeriodName] = useState('');
  const [periodDate, setPeriodDate] = useState(today());
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      setLoading(true);
      setError('');

      try {
        const result = await api.page<Asset>(
          '/assets?page=1&per_page=100',
        );

        if (active) {
          setAssets(result.data);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil data aset.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAssets();

    return () => {
      active = false;
    };
  }, []);

  const activeStocktake = stocktakes.find(
    (item) => item.id === activeId,
  );

  const filteredAssets = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return assets;

    return assets.filter(
      (asset) =>
        asset.asset_name.toLowerCase().includes(keyword) ||
        asset.asset_code.toLowerCase().includes(keyword) ||
        asset.location_text.toLowerCase().includes(keyword),
    );
  }, [assets, search]);

  const totalChecked =
    activeStocktake?.items.filter((item) => item.checked).length ?? 0;

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    setError('');

    if (loading || assetError()) {
      setError('Daftar aset belum berhasil dimuat.');
      return;
    }

    if (!periodName.trim() || !periodDate || selectedIds.length === 0) {
      setError(
        'Lengkapi nama periode, tanggal, dan pilih minimal satu aset.',
      );
      return;
    }

    const items: StocktakeItem[] = assets
      .filter((asset) => selectedIds.includes(asset.asset_id))
      .map((asset) => ({
        asset_id: asset.asset_id,
        asset_code: asset.asset_code,
        asset_name: asset.asset_name,
        location_text: asset.location_text,
        condition: asset.asset_condition || 'BAIK',
        note: '',
        checked: false,
      }));

    if (!items.length) {
      setError('Aset yang dipilih tidak ditemukan.');
      return;
    }

    const newStocktake: Stocktake = {
      id: crypto.randomUUID(),
      name: periodName.trim(),
      date: periodDate,
      status: 'BERLANGSUNG',
      items,
    };

    setStocktakes((current) => [newStocktake, ...current]);
    setActiveId(newStocktake.id);
    setPeriodName('');
    setPeriodDate(today());
    setSelectedIds([]);
    setSearch('');
    setShowForm(false);
    setNotice('Periode opname berhasil dibuat sebagai data sementara.');
  }

  function assetError() {
    return !!error && assets.length === 0;
  }

  function toggleAsset(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function updateItem(
    assetId: string,
    field: 'condition' | 'note',
    value: string,
  ) {
    if (!activeStocktake || activeStocktake.status === 'SELESAI') return;

    setStocktakes((current) =>
      current.map((stocktake) =>
        stocktake.id !== activeId
          ? stocktake
          : {
              ...stocktake,
              items: stocktake.items.map((item) =>
                item.asset_id === assetId
                  ? { ...item, [field]: value }
                  : item,
              ),
            },
      ),
    );
  }

  function markChecked(assetId: string) {
    if (!activeStocktake || activeStocktake.status === 'SELESAI') return;

    setStocktakes((current) =>
      current.map((stocktake) =>
        stocktake.id !== activeId
          ? stocktake
          : {
              ...stocktake,
              items: stocktake.items.map((item) =>
                item.asset_id === assetId
                  ? { ...item, checked: true }
                  : item,
              ),
            },
      ),
    );
  }

  function closeStocktake() {
    if (!activeStocktake || activeStocktake.status === 'SELESAI') return;

    if (totalChecked !== activeStocktake.items.length) {
      setNotice('Periksa seluruh aset sebelum menutup periode opname.');
      return;
    }

    setStocktakes((current) =>
      current.map((item) =>
        item.id === activeId
          ? { ...item, status: 'SELESAI' }
          : item,
      ),
    );

    setNotice('Periode opname ditandai selesai pada prototipe ini.');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Opname"
        subtitle="Pemeriksaan dan pencatatan kondisi aset inventaris."
        code="SCR-14"
        actions={
          <button
            type="button"
            onClick={() => {
              setShowForm((value) => !value);
              setError('');
              setNotice('');
            }}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            {showForm ? 'Tutup Form' : '+ Buat Periode'}
          </button>
        }
      />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Mode frontend sementara</p>
        <p className="mt-1">
          Endpoint Stock Opname backend belum tersedia. Data periode dan
          hasil pemeriksaan di halaman ini hanya disimpan sementara selama
          halaman masih terbuka.
        </p>
      </div>

      {notice && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-stone-500">Total Aset</p>
          <p className="mt-2 text-2xl font-bold text-stone-800">
            {loading ? '...' : assets.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-stone-500">Periode Opname</p>
          <p className="mt-2 text-2xl font-bold text-brand-700">
            {stocktakes.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-stone-500">Aset Diperiksa</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {activeStocktake
              ? `${totalChecked}/${activeStocktake.items.length}`
              : '0'}
          </p>
        </Card>
      </div>

      {showForm && (
        <Card title="Buat Periode Stock Opname">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="period-name"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Nama Periode
                </label>
                <input
                  id="period-name"
                  value={periodName}
                  onChange={(event) => setPeriodName(event.target.value)}
                  placeholder="Contoh: Stock Opname Semester Ganjil 2026"
                  maxLength={100}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="period-date"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Tanggal Pemeriksaan
                </label>
                <input
                  id="period-date"
                  type="date"
                  max={today()}
                  value={periodDate}
                  onChange={(event) => setPeriodDate(event.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-medium text-stone-700">
                  Pilih Aset yang Diperiksa
                </label>
                <span className="text-xs text-stone-500">
                  {selectedIds.length} aset dipilih
                </span>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari kode atau nama aset..."
                className="mb-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              />

              <div className="max-h-64 overflow-y-auto rounded-lg border border-stone-200">
                {loading ? (
                  <p className="p-4 text-sm text-stone-500">
                    Memuat aset...
                  </p>
                ) : filteredAssets.length === 0 ? (
                  <p className="p-4 text-sm text-stone-500">
                    Tidak ada aset ditemukan.
                  </p>
                ) : (
                  filteredAssets.map((asset) => (
                    <label
                      key={asset.asset_id}
                      className="flex cursor-pointer items-center gap-3 border-b border-stone-100 px-4 py-3 last:border-0 hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(asset.asset_id)}
                        onChange={() => toggleAsset(asset.asset_id)}
                        className="h-4 w-4 accent-brand-700"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-stone-800">
                          {asset.asset_name}
                        </span>
                        <span className="block text-xs text-stone-500">
                          {asset.asset_code} · {asset.location_text || 'Lokasi belum diisi'}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedIds([]);
                  setSearch('');
                  setError('');
                }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading || assets.length === 0 || !!error}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
              >
                Buat Periode
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Daftar Periode Stock Opname">
        {stocktakes.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-500">
            Belum ada periode stock opname.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
              <thead className="bg-brand-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-brand-900">Nama Periode</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-900">Tanggal</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-900">Jumlah Aset</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stocktakes.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium text-stone-800">{item.name}</td>
                    <td className="px-4 py-3 text-stone-600">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 text-stone-600">{item.items.length} aset</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.status === 'SELESAI'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status === 'SELESAI' ? 'Selesai' : 'Berlangsung'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(item.id);
                          setNotice('');
                        }}
                        className="font-medium text-brand-700 hover:text-brand-900"
                      >
                        Lihat Pemeriksaan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {activeStocktake && (
        <Card
          title={`Pemeriksaan: ${activeStocktake.name}`}
          actions={
            <button
              type="button"
              onClick={() => setActiveId('')}
              className="text-sm text-stone-500 hover:text-stone-800"
            >
              Tutup
            </button>
          }
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-600">
              {totalChecked} dari {activeStocktake.items.length} aset sudah diperiksa.
            </p>

            {activeStocktake.status === 'BERLANGSUNG' && (
              <button
                type="button"
                onClick={closeStocktake}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Tutup Periode
              </button>
            )}
          </div>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-green-600 transition-all"
              style={{
                width: `${
                  activeStocktake.items.length
                    ? (totalChecked / activeStocktake.items.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
              <thead className="bg-brand-50">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-brand-900">Aset</th>
                  <th className="px-3 py-3 text-left font-semibold text-brand-900">Kondisi</th>
                  <th className="px-3 py-3 text-left font-semibold text-brand-900">Catatan</th>
                  <th className="px-3 py-3 text-left font-semibold text-brand-900">Pemeriksaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeStocktake.items.map((item) => (
                  <tr key={item.asset_id}>
                    <td className="px-3 py-3">
                      <p className="font-medium text-stone-800">{item.asset_name}</p>
                      <p className="text-xs text-stone-500">{item.asset_code}</p>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={item.condition}
                        disabled={activeStocktake.status === 'SELESAI' || item.checked}
                        onChange={(event) =>
                          updateItem(item.asset_id, 'condition', event.target.value)
                        }
                        className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                      >
                        <option value="BAIK">Baik</option>
                        <option value="RUSAK_RINGAN">Rusak Ringan</option>
                        <option value="RUSAK_BERAT">Rusak Berat</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={item.note}
                        maxLength={500}
                        disabled={activeStocktake.status === 'SELESAI' || item.checked}
                        onChange={(event) =>
                          updateItem(item.asset_id, 'note', event.target.value)
                        }
                        placeholder="Catatan..."
                        className="w-40 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-3 py-3">
                      {item.checked ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          Sudah diperiksa
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={activeStocktake.status === 'SELESAI'}
                          onClick={() => markChecked(item.asset_id)}
                          className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                        >
                          Tandai Diperiksa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
