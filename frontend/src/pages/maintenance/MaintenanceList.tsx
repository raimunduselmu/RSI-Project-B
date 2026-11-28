
// SCR-12 Jadwal Pemeliharaan (FSD-2.14) — Template B

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/shared/PageHeader';
import { api } from '@/lib/api';

interface Asset {
  asset_id: string;
  asset_code: string;
  asset_name: string;
  location_text: string;
  status: string;
}

interface MaintenanceDraft {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_code: string;
  maintenance_date: string;
  maintenance_type: string;
  description: string;
  status: 'DRAFT';
}

const INITIAL_FORM = {
  asset_id: '',
  maintenance_date: '',
  maintenance_type: 'RUTIN',
  description: '',
};

function formatDate(value: string) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`));
}

export default function MaintenanceList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [drafts, setDrafts] = useState<MaintenanceDraft[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assetError, setAssetError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      setLoading(true);
      setAssetError('');

      try {
        const result = await api.page<Asset>(
          '/assets?page=1&per_page=100',
        );

        if (active) {
          setAssets(result.data);
        }
      } catch (err: unknown) {
        if (active) {
          setAssetError(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil daftar aset.',
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

  const filteredDrafts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return drafts;

    return drafts.filter(
      (item) =>
        item.asset_name.toLowerCase().includes(keyword) ||
        item.asset_code.toLowerCase().includes(keyword) ||
        item.maintenance_type.toLowerCase().includes(keyword),
    );
  }, [drafts, search]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const selectedAsset = assets.find(
      (asset) => asset.asset_id === form.asset_id,
    );

    if (!selectedAsset) {
      setError('Silakan pilih aset terlebih dahulu.');
      return;
    }

    if (!form.maintenance_date || !form.description.trim()) {
      setError('Tanggal dan deskripsi pemeliharaan wajib diisi.');
      return;
    }

    const newDraft: MaintenanceDraft = {
      id: crypto.randomUUID(),
      asset_id: selectedAsset.asset_id,
      asset_name: selectedAsset.asset_name,
      asset_code: selectedAsset.asset_code,
      maintenance_date: form.maintenance_date,
      maintenance_type: form.maintenance_type,
      description: form.description.trim(),
      status: 'DRAFT',
    };

    setDrafts((current) => [newDraft, ...current]);
    setForm(INITIAL_FORM);
    setShowForm(false);
    setSuccess(
      'Draft berhasil ditambahkan pada tampilan ini. Data belum tersimpan ke database.',
    );
  }

  function handleDeleteDraft(id: string) {
    setDrafts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemeliharaan Aset"
        subtitle="Kelola jadwal dan pencatatan pemeliharaan aset."
        code="SCR-12"
        actions={
          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setError('');
              setSuccess('');
            }}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            {showForm ? 'Tutup Form' : '+ Buat Jadwal'}
          </button>
        }
      />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Mode frontend sementara</p>
        <p className="mt-1">
          Endpoint pemeliharaan backend belum diimplementasikan. Draft yang
          dibuat pada halaman ini hanya tersimpan sementara selama halaman
          masih terbuka dan tidak masuk ke database.
        </p>
      </div>

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {success}
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
          <p className="text-sm text-stone-500">Total Draft Jadwal</p>
          <p className="mt-2 text-2xl font-bold text-brand-700">
            {drafts.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-stone-500">Menunggu Integrasi</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {drafts.length}
          </p>
        </Card>
      </div>

      {showForm && (
        <Card title="Form Jadwal Pemeliharaan">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="maintenance-asset"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Pilih Aset
                </label>
                <select
                  id="maintenance-asset"
                  value={form.asset_id}
                  onChange={(event) =>
                    setForm({ ...form, asset_id: event.target.value })
                  }
                  disabled={loading || assets.length === 0}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
                  required
                >
                  <option value="">Pilih aset</option>
                  {assets.map((asset) => (
                    <option key={asset.asset_id} value={asset.asset_id}>
                      {asset.asset_code} - {asset.asset_name}
                    </option>
                  ))}
                </select>

                {assetError && (
                  <p className="mt-1 text-xs text-red-600">{assetError}</p>
                )}

                {!loading && !assetError && assets.length === 0 && (
                  <p className="mt-1 text-xs text-stone-500">
                    Belum ada aset yang dapat dipilih.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="maintenance-date"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Tanggal Pemeliharaan
                </label>
                <input
                  id="maintenance-date"
                  type="date"
                  value={form.maintenance_date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      maintenance_date: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="maintenance-type"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Jenis Pemeliharaan
                </label>
                <select
                  id="maintenance-type"
                  value={form.maintenance_type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      maintenance_type: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
                >
                  <option value="RUTIN">Rutin</option>
                  <option value="PERBAIKAN">Perbaikan</option>
                  <option value="PEMERIKSAAN">Pemeriksaan</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="maintenance-description"
                  className="mb-1 block text-sm font-medium text-stone-700"
                >
                  Deskripsi Pemeliharaan
                </label>
                <textarea
                  id="maintenance-description"
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Tuliskan rencana atau keterangan pemeliharaan..."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  required
                />
                <p className="mt-1 text-xs text-stone-500">
                  {form.description.length}/1000 karakter
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(INITIAL_FORM);
                  setError('');
                }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading || assets.length === 0}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Simpan Draft
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Daftar Jadwal Pemeliharaan">
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama aset, kode aset, atau jenis pemeliharaan..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 md:max-w-md"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead className="bg-brand-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-brand-900">
                  Aset
                </th>
                <th className="px-4 py-3 text-left font-semibold text-brand-900">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left font-semibold text-brand-900">
                  Jenis
                </th>
                <th className="px-4 py-3 text-left font-semibold text-brand-900">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-left font-semibold text-brand-900">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-brand-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredDrafts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-stone-500"
                  >
                    {search
                      ? 'Tidak ada draft yang cocok dengan pencarian.'
                      : 'Belum ada draft jadwal pemeliharaan.'}
                  </td>
                </tr>
              ) : (
                filteredDrafts.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">
                        {item.asset_name}
                      </p>
                      <p className="font-mono text-xs text-stone-500">
                        {item.asset_code}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {formatDate(item.maintenance_date)}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {item.maintenance_type}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-stone-600">
                      {item.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        Draft lokal
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(item.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-stone-500">
          Draft lokal tidak akan tersedia setelah halaman dimuat ulang.
        </p>
      </Card>
    </div>
  );
}
