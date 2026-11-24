// SCR-06 Form Aset (Tambah/Ubah) (FSD-2.5) — Template D
// Data: GET /asset-categories · GET /assets/code-preview · POST /assets · GET/PATCH /assets/:id (multipart, field foto: photo)
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormGrid, FormPage } from '@/components/templates';
import { Alert, FileDrop, Input, Select, Textarea, Toggle } from '@/components/ui';
import { useFetch } from '@/hooks/useFetch';
import { api, ApiError } from '@/lib/api';
import type { AssetFull, Category } from '@/lib/types';

const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

const EMPTY = {
  asset_name: '',
  category_id: '',
  location_text: '',
  asset_condition: 'BAIK',
  is_lendable: true,
  source_type: 'KAS',
  donor_name: '',
  acquired_date: today(),
  acquisition_value: '',
  description: '',
  status: '',
};

export default function AssetForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: categories } = useFetch<Category[]>('/asset-categories');
  const { data: current, error: loadError } = useFetch<AssetFull>(isEdit ? `/assets/${id}` : null);

  const [f, setF] = useState(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((o) => ({ ...o, [k]: v }));
  const err = (k: string) => error?.details?.[k]?.[0];

  // isi form saat mode ubah
  useEffect(() => {
    if (!current) return;
    setF({
      asset_name: current.asset_name,
      category_id: String(current.category_id),
      location_text: current.location_text,
      asset_condition: current.asset_condition,
      is_lendable: !!current.is_lendable,
      source_type: current.source_type ?? 'KAS',
      donor_name: current.donor_name ?? '',
      acquired_date: current.acquired_date ? String(current.acquired_date).slice(0, 10) : today(),
      acquisition_value: current.acquisition_value != null ? String(current.acquisition_value) : '',
      description: current.description ?? '',
      status: current.status,
    });
  }, [current]);

  // kategori pertama sebagai default saat tambah
  useEffect(() => {
    if (!isEdit && !f.category_id && categories?.length) set('category_id', String(categories[0].category_id));
  }, [categories, isEdit, f.category_id]);

  // pratinjau kode unik (hanya saat tambah)
  useEffect(() => {
    if (isEdit || !f.category_id) return;
    api
      .get<{ asset_code: string }>(`/assets/code-preview?category_id=${f.category_id}`)
      .then((r) => setPreview(r.asset_code))
      .catch(() => setPreview(''));
  }, [f.category_id, isEdit]);

  const submit = async (_e: FormEvent) => {
    setSaving(true);
    setError(null);
    const fd = new FormData();
    const fields: (keyof typeof EMPTY)[] = ['asset_name', 'category_id', 'location_text', 'asset_condition', 'source_type', 'acquired_date', 'description'];
    fields.forEach((k) => fd.append(k, String(f[k])));
    fd.append('is_lendable', String(f.is_lendable));
    fd.append('donor_name', f.source_type === 'KAS' ? '' : f.donor_name);
    fd.append('acquisition_value', f.acquisition_value.replace(/\D/g, ''));
    if (isEdit && f.status && ['TERSEDIA', 'PEMELIHARAAN', 'HILANG', 'NONAKTIF'].includes(f.status) && f.status !== current?.status) fd.append('status', f.status);
    if (photo) fd.append('photo', photo);
    try {
      const saved = isEdit ? await api.patch<AssetFull>(`/assets/${id}`, fd) : await api.post<AssetFull>('/assets', fd);
      nav(`/assets/${saved.asset_code}`, { replace: true });
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setSaving(false);
    }
  };

  const busyStatus = current && ['DIPINJAM', 'DIGUNAKAN'].includes(current.status);

  return (
    <FormPage
      code="SCR-06"
      eyebrow="Sarana Prasarana / Aset"
      title={isEdit ? 'Ubah Aset' : 'Tambah Aset'}
      subtitle={isEdit ? <span className="font-mono">{current?.asset_code}</span> : 'Kode unik dibuat otomatis dari prefix kategori dan tanggal pencatatan.'}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Simpan Aset'}
      onSubmit={submit}
      loading={saving}
      onCancel={() => nav(isEdit ? `/assets/${id}` : '/assets')}
      aside={
        isEdit ? (
          <>
            <h2>Kode Unik</h2>
            <div className="mt-4 rounded-xl border border-ember-300/30 bg-ember-500/10 py-4 text-center font-mono text-xl tracking-widest text-ember-700 shadow-soft">{current?.asset_code ?? '…'}</div>
            <p className="mt-3 text-xs text-ink/55">Kode tidak berubah walau kategori diganti.</p>
          </>
        ) : (
          <>
            <h2>Pratinjau Kode</h2>
            <p className="mt-4 text-sm text-ink/65">Kode yang akan dibuat:</p>
            <div className="mt-2 rounded-xl border border-ember-300/30 bg-ember-500/10 py-4 text-center font-mono text-xl tracking-widest text-ember-700 shadow-soft">{preview || '…'}</div>
            <p className="mt-3 text-xs text-ink/55">Bila kode yang sama sudah ada pada tanggal ini, sistem menambahkan akhiran -02, -03, dst.</p>
          </>
        )
      }
    >
      {loadError && <Alert tone="error">{loadError.message}</Alert>}
      {error && !error.details && <Alert tone="error">{error.message}</Alert>}
      <Input no={1} label="Nama Aset" required maxLength={150} value={f.asset_name} onChange={(e) => set('asset_name', e.target.value)} error={err('asset_name')} />
      <FormGrid>
        <Select no={2} label="Kategori" required hint="Menentukan prefix kode unik" value={f.category_id} onChange={(e) => set('category_id', e.target.value)} error={err('category_id')}>
          {categories?.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.category_name} ({c.category_code})
            </option>
          ))}
        </Select>
        <Input no={3} label="Lokasi Saat Ini" required maxLength={100} value={f.location_text} onChange={(e) => set('location_text', e.target.value)} error={err('location_text')} />
        <Select no={4} label="Kondisi" required value={f.asset_condition} onChange={(e) => set('asset_condition', e.target.value)} options={['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT']} />
        <div className="space-y-1.5">
          <p className="field-label">Dapat Dipinjam</p>
          <div className="flex h-[42px] items-center">
            <Toggle checked={f.is_lendable} onChange={(v) => set('is_lendable', v)} label="Ya, tampil di katalog peminjaman" />
          </div>
        </div>
        <Select no={6} label="Sumber Perolehan" required value={f.source_type} onChange={(e) => set('source_type', e.target.value)} options={['KAS', 'DONASI', 'HIBAH']} />
        <Input
          no={7}
          label="Nama Donatur"
          required={f.source_type !== 'KAS'}
          disabled={f.source_type === 'KAS'}
          hint="Wajib bila DONASI/HIBAH"
          value={f.source_type === 'KAS' ? '' : f.donor_name}
          onChange={(e) => set('donor_name', e.target.value)}
          error={err('donor_name')}
        />
        <Input no={8} label="Tanggal Perolehan" type="date" required max={today()} value={f.acquired_date} onChange={(e) => set('acquired_date', e.target.value)} error={err('acquired_date')} />
        <Input
          no={9}
          label="Nilai Perolehan (Rp)"
          inputMode="numeric"
          placeholder="Opsional"
          value={f.acquisition_value ? Number(f.acquisition_value.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
          onChange={(e) => set('acquisition_value', e.target.value.replace(/\D/g, ''))}
          error={err('acquisition_value')}
        />
        {isEdit && (
          <Select
            no={10}
            label="Status"
            value={f.status}
            disabled={!!busyStatus}
            hint={busyStatus ? 'Sedang dipinjam/dipakai — status berubah lewat proses pengembalian' : 'DIPINJAM/DIGUNAKAN diatur otomatis oleh peminjaman'}
            onChange={(e) => set('status', e.target.value)}
            options={busyStatus ? [f.status] : ['TERSEDIA', 'PEMELIHARAAN', 'HILANG', 'NONAKTIF']}
            error={err('status')}
          />
        )}
      </FormGrid>
      <Textarea label="Keterangan" placeholder="Opsional" maxLength={2000} value={f.description} onChange={(e) => set('description', e.target.value)} />
      <div className="space-y-1.5">
        <p className="field-label">Foto {isEdit && current?.has_photo ? <span className="text-xs text-ink/50">(sudah ada — unggah untuk mengganti)</span> : null}</p>
        <FileDrop accept="image/png,image/jpeg" hint={photo ? `Dipilih: ${photo.name}` : 'JPG/PNG, maks 5 MB'} onFile={setPhoto} />
      </div>
    </FormPage>
  );
}
