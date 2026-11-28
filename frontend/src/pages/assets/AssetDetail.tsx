
// SCR-07 Detail Aset (FSD-2.5, 2.7, 2.8, 2.16)

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';

interface AssetDetailRecord {
  asset_id: number;
  asset_code: string;
  asset_name: string;
  category_name: string;
  location_text: string;
  asset_condition: string;
  status: string;
  is_lendable: boolean;
  has_photo: boolean;
  source_type?: string | null;
  donor_name?: string | null;
  acquired_date?: string | null;
  acquisition_value?: number | string | null;
  created_by_name?: string | null;
  description?: string | null;
}

interface AssetHistory {
  id?: number;
  event_type: string;
  created_at: string;
  actor_name?: string | null;
  note?: string | null;
  new_value?: Record<string, unknown> | null;
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatRupiah(value?: number | string | null) {
  if (value == null || value === '') return '—';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function describeHistory(history: AssetHistory) {
  if (history.note) return history.note;
  if (!history.new_value) return '';

  return Object.entries(history.new_value)
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`)
    .join(' · ');
}

export default function AssetDetail() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { hasRole } = useAuth();

  const [asset, setAsset] = useState<AssetDetailRecord | null>(null);
  const [histories, setHistories] = useState<AssetHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'riwayat' | 'dokumen'>('riwayat');

  useEffect(() => {
    if (!id) {
      setError('ID aset tidak ditemukan.');
      setLoading(false);
      setHistoryLoading(false);
      return;
    }

    let active = true;

    async function loadAsset() {
      try {
        const result = await api.get<AssetDetailRecord>(
          `/assets/${encodeURIComponent(id)}`,
        );

        if (active) setAsset(result);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Data aset gagal dimuat.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    async function loadHistories() {
      try {
        const result = await api.get<AssetHistory[]>(
          `/assets/${encodeURIComponent(id)}/histories`,
        );

        if (active) setHistories(result);
      } catch (err) {
        if (active) {
          setHistoryError(
            err instanceof Error ? err.message : 'Riwayat aset gagal dimuat.',
          );
        }
      } finally {
        if (active) setHistoryLoading(false);
      }
    }

    loadAsset();
    loadHistories();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!asset) return;

    const confirmed = window.confirm(
      `Hapus aset ${asset.asset_code} - ${asset.asset_name}?`,
    );

    if (!confirmed) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await api.del(`/assets/${asset.asset_id}`);
      navigate('/assets', { replace: true });
    } catch (err) {
      setDeleteError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Aset gagal dihapus.',
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error || !asset) {
    return <Alert tone="error">{error || 'Aset tidak ditemukan.'}</Alert>;
  }

  return (
    <>
      <PageHeader
        title="Detail Aset"
        subtitle="Informasi lengkap dan riwayat aset"
        code="SCR-07"
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/assets')}
          >
            Kembali
          </Button>
        }
      />

      {deleteError && (
        <div className="mb-4">
          <Alert tone="error">{deleteError}</Alert>
        </div>
      )}

      <section className="mb-5 rounded-xl border border-stone-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Kode Aset</p>
            <h2 className="mt-1 font-mono text-lg font-bold text-brand-800">
              {asset.asset_code}
            </h2>
            <h3 className="mt-2 text-xl font-semibold text-stone-800">
              {asset.asset_name}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasRole('Sarpras') && (
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate(`/assets/${asset.asset_code}/edit`)
                }
              >
                Ubah Aset
              </Button>
            )}

            {hasRole('Admin') && (
              <Button
                type="button"
                variant="danger"
                loading={deleting}
                disabled={deleting}
                onClick={handleDelete}
              >
                Hapus Aset
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-700">
              Foto Aset
            </p>

            {asset.has_photo ? (
              <img
                src={`${API_BASE}/assets/${asset.asset_id}/photo`}
                alt={`Foto ${asset.asset_name}`}
                className="max-h-72 w-full rounded-lg border border-stone-200 object-contain"
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 text-sm text-stone-500">
                Belum ada foto aset
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-stone-800">
              Informasi Aset
            </h3>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-stone-500">Kategori</dt>
                <dd className="font-medium text-stone-800">
                  {asset.category_name}
                </dd>
              </div>

              <div>
                <dt className="text-stone-500">Lokasi</dt>
                <dd className="font-medium text-stone-800">
                  {asset.location_text}
                </dd>
              </div>

              <div>
                <dt className="text-stone-500">Kondisi</dt>
                <dd>
                  <Badge status={asset.asset_condition} />
                </dd>
              </div>

              <div>
                <dt className="text-stone-500">Status</dt>
                <dd>
                  <Badge status={asset.status} />
                </dd>
              </div>

              <div>
                <dt className="text-stone-500">Dapat Dipinjam</dt>
                <dd className="font-medium text-stone-800">
                  {asset.is_lendable ? 'Ya' : 'Tidak'}
                </dd>
              </div>

              <div>
                <dt className="text-stone-500">Sumber Perolehan</dt>
                <dd className="font-medium text-stone-800">
                  {asset.source_type
                    ? `${asset.source_type}${asset.donor_name ? ` · ${asset.donor_name}` : ''}`
                    : '—'}
                </dd>
              </div>

              <div>
                <dt className="text-stone-500">Tanggal Perolehan</dt>
                <dd className="font-medium text-stone-800">
                  {formatDate(asset.acquired_date)}
                </dd>
              </div>

              <div>
                <dt className="text-stone-500">Nilai Perolehan</dt>
                <dd className="font-medium text-stone-800">
                  {formatRupiah(asset.acquisition_value)}
                </dd>
              </div>

              <div>
                <dt className="text-stone-500">Dicatat Oleh</dt>
                <dd className="font-medium text-stone-800">
                  {asset.created_by_name ?? '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {asset.description && (
          <div className="mt-5 border-t border-stone-200 pt-4">
            <h3 className="mb-2 font-semibold text-stone-800">
              Keterangan
            </h3>
            <p className="whitespace-pre-wrap text-sm text-stone-600">
              {asset.description}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="mb-5 flex gap-2 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === 'riwayat'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-stone-500'
            }`}
          >
            Riwayat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dokumen')}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === 'dokumen'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-stone-500'
            }`}
          >
            Dokumen
          </button>
        </div>

        {activeTab === 'riwayat' && (
          <div>
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : historyError ? (
              <Alert tone="error">{historyError}</Alert>
            ) : histories.length === 0 ? (
              <p className="py-5 text-sm text-stone-500">
                Belum ada riwayat perubahan aset.
              </p>
            ) : (
              <div className="space-y-5">
                {histories.map((history, index) => (
                  <div
                    key={history.id ?? `${history.created_at}-${index}`}
                    className="border-l-2 border-brand-200 pl-4"
                  >
                    <p className="text-xs text-stone-500">
                      {formatDateTime(history.created_at)}
                    </p>
                    <p className="mt-1 font-semibold text-stone-800">
                      {history.event_type.replace(/_/g, ' ')}
                    </p>
                    {describeHistory(history) && (
                      <p className="mt-1 text-sm text-stone-600">
                        {describeHistory(history)}
                      </p>
                    )}
                    {history.actor_name && (
                      <p className="mt-1 text-xs text-stone-500">
                        Oleh: {history.actor_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dokumen' && (
          <Alert tone="info">
            Fitur dokumen aset belum tersedia pada backend.
          </Alert>
        )}
      </section>
    </>
  );
}
