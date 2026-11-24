// SCR-07 Detail Aset (FSD-2.5, 2.7, 2.8, 2.16) — Template E
// Data: GET /assets/:id · GET /assets/:id/histories · GET /assets/:id/photo · DELETE /assets/:id (Admin)
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPage, MediaBox } from '@/components/templates';
import { Alert, Badge, Button, InfoGrid, Modal, Spinner, Tabs, Timeline } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { api, ApiError, BASE } from '@/lib/api';
import { rupiah, tanggal, tanggalJam } from '@/lib/format';
import type { AssetFull, AssetHistory } from '@/lib/types';

/** Ringkas perubahan new_value menjadi teks pendek, mis. "lokasi: Aula · kondisi: BAIK" */
const describe = (h: AssetHistory) => {
  if (h.note) return h.note;
  if (!h.new_value) return undefined;
  return Object.entries(h.new_value)
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
    .join(' · ');
};

export default function AssetDetail() {
  const nav = useNavigate();
  const { id = '' } = useParams();
  const { hasRole } = useAuth();
  const [tab, setTab] = useState<'riwayat' | 'dokumen'>('riwayat');
  const [askDelete, setAskDelete] = useState(false);
  const [delError, setDelError] = useState<ApiError | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: a, loading, error } = useFetch<AssetFull>(`/assets/${encodeURIComponent(id)}`);
  const { data: histories } = useFetch<AssetHistory[]>(`/assets/${encodeURIComponent(id)}/histories`);

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error || !a) return <Alert tone="error">{error?.message ?? 'Aset tidak ditemukan'}</Alert>;

  const remove = async () => {
    setDeleting(true);
    setDelError(null);
    try {
      await api.del(`/assets/${a.asset_id}`);
      nav('/assets', { replace: true });
    } catch (e) {
      setDelError(e as ApiError);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DetailPage
      code="SCR-07"
      eyebrow="Sarana Prasarana / Aset"
      title={a.asset_name}
      subtitle={<span className="font-mono">{a.asset_code}</span>}
      actions={
        <>
          {hasRole('Sarpras') && (
            <>
              <Button variant="secondary" icon="printer" onClick={() => nav('/assets/labels', { state: { codes: [a.asset_code] } })}>
                Cetak Label
              </Button>
              <Button variant="secondary" icon="pencil" onClick={() => nav(`/assets/${a.asset_code}/edit`)}>
                Ubah
              </Button>
            </>
          )}
          {hasRole('Admin') && (
            <Button variant="danger" icon="trash" onClick={() => setAskDelete(true)}>
              Hapus
            </Button>
          )}
        </>
      }
      infoTitle="Informasi Aset"
      media={<MediaBox label="Belum ada foto" src={a.has_photo ? `${BASE}/assets/${a.asset_id}/photo` : undefined} />}
      info={
        <InfoGrid
          items={[
            { label: 'Kode Unik', value: <span className="font-mono">{a.asset_code}</span> },
            { label: 'Kategori', value: a.category_name },
            { label: 'Lokasi', value: a.location_text },
            { label: 'Kondisi', value: <Badge status={a.asset_condition} /> },
            { label: 'Status', value: <Badge status={a.status} /> },
            { label: 'Dapat Dipinjam', value: a.is_lendable ? 'Ya' : 'Tidak' },
            { label: 'Sumber', value: a.source_type ? `${a.source_type}${a.donor_name ? ` · ${a.donor_name}` : ''}` : '—' },
            { label: 'Diperoleh', value: a.acquired_date ? tanggal(a.acquired_date) : '—' },
            { label: 'Nilai', value: a.acquisition_value != null ? rupiah(Number(a.acquisition_value)) : '—' },
            { label: 'Dicatat oleh', value: a.created_by_name ?? '—' },
          ]}
        />
      }
    >
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'riwayat', label: 'Riwayat' },
          { value: 'dokumen', label: 'Dokumen' },
        ]}
      />
      <div className="pt-6">
        {tab === 'riwayat' ? (
          histories && histories.length ? (
            <Timeline
              items={histories.map((h) => ({
                time: tanggalJam(h.created_at),
                title: h.event_type.replace(/_/g, ' '),
                desc: [describe(h), h.actor_name].filter(Boolean).join(' — '),
              }))}
            />
          ) : (
            <p className="text-sm text-ink/55">{histories ? 'Belum ada riwayat.' : 'Memuat riwayat…'}</p>
          )
        ) : (
          <Alert tone="info">Dokumen aset akan tampil setelah modul Dokumen & Arsip (FSD-2.40) selesai di backend.</Alert>
        )}
        {a.description && (
          <div className="mt-6 rounded-xl border border-slate-900/[0.08] bg-white p-4 text-sm text-ink/80">
            <p className="eyebrow mb-2">Keterangan</p>
            {a.description}
          </div>
        )}
      </div>

      <Modal
        open={askDelete}
        title="Hapus aset?"
        onClose={() => setAskDelete(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAskDelete(false)}>
              Batal
            </Button>
            <Button variant="danger" icon="trash" loading={deleting} onClick={remove}>
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/75">
          <span className="font-mono text-ink">{a.asset_code}</span> — {a.asset_name} akan dihapus dari daftar (riwayat tetap tersimpan).
        </p>
        {delError && (
          <div className="mt-3">
            <Alert tone="error">{delError.message}</Alert>
          </div>
        )}
      </Modal>
    </DetailPage>
  );
}
