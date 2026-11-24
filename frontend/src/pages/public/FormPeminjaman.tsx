// SCR-09 Form Pengajuan Peminjaman (FSD-2.10) — Template H
// Data: GET /rooms · GET /assets (katalog publik) · GET /availability · POST /loans
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormSection, PublicFormPage, TrackingCode } from '@/components/templates';
import { Alert, Button, InfoGrid, Input, Segmented, Select, Textarea } from '@/components/ui';
import { useFetch } from '@/hooks/useFetch';
import { qs, usePaged } from '@/hooks/usePaged';
import { api, ApiError } from '@/lib/api';
import { cn, tanggalJam } from '@/lib/format';
import type { AssetRow, Room } from '@/lib/types';

type Step = 'form' | 'summary' | 'done';
type Kind = 'RUANGAN' | 'ASET';

/** nilai default input datetime-local: besok jam 18.00 */
const localInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const tomorrowAt = (h: number) => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(h, 0, 0, 0);
  return localInput(d);
};

export default function FormPeminjaman() {
  // prefill dari halaman Kalender (state: { room_id, start, end })
  const prefill = (useLocation().state ?? {}) as { room_id?: number; start?: string; end?: string };

  const [type, setType] = useState<Kind>('RUANGAN');
  const [step, setStep] = useState<Step>('form');
  const [roomId, setRoomId] = useState(prefill.room_id ? String(prefill.room_id) : '');
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [start, setStart] = useState(prefill.start ?? tomorrowAt(18));
  const [end, setEnd] = useState(prefill.end ?? tomorrowAt(21));
  const [facilities, setFacilities] = useState(false);
  const [p, setP] = useState({ borrower_name: '', borrower_phone: '', borrower_email: '', borrower_org: '', purpose: '' });
  const [conflict, setConflict] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ loan_code: string; pic_wa_link?: string } | null>(null);

  const { data: rooms } = useFetch<Room[]>('/rooms');
  const { rows: assets } = usePaged<AssetRow>(type === 'ASET' ? `/assets${qs({ per_page: 100 })}` : null);

  useEffect(() => {
    if (!roomId && rooms?.length) setRoomId(String(rooms[0].room_id));
  }, [rooms, roomId]);

  const err = (k: string) => error?.details?.[k]?.[0];
  const setField = (k: keyof typeof p) => (e: { target: { value: string } }) => setP((o) => ({ ...o, [k]: e.target.value }));
  const room = rooms?.find((r) => String(r.room_id) === roomId);
  const chosenAssets = assets.filter((a) => assetIds.includes(a.asset_id));
  const place = type === 'RUANGAN' ? room?.room_name ?? '—' : chosenAssets.map((a) => a.asset_name).join(', ') || '—';

  /** Langkah 1 → 2: cek bentrok jadwal dulu (BR-19), lalu tampilkan ringkasan */
  const toSummary = async () => {
    setError(null);
    setConflict(null);
    if (type === 'ASET' && assetIds.length === 0) return setConflict('Pilih minimal satu aset.');
    try {
      const r = await api.get<{ available: boolean; conflicts: { conflict_on: string; start_at: string; end_at: string }[] }>(
        `/availability${qs({
          room_id: type === 'RUANGAN' ? roomId : undefined,
          asset_ids: type === 'ASET' ? assetIds.join(',') : undefined,
          start_at: new Date(start).toISOString(),
          end_at: new Date(end).toISOString(),
        })}`,
      );
      if (!r.available) {
        const c = r.conflicts[0];
        return setConflict(`Jadwal bentrok dengan pemakaian lain (${c.conflict_on}) pada ${tanggalJam(c.start_at)}. Pilih waktu lain.`);
      }
      setStep('summary');
    } catch (e) {
      setError(e as ApiError);
    }
  };

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      const r = await api.post<{ loan_code: string; pic_wa_link?: string }>('/loans', {
        request_type: type,
        room_id: type === 'RUANGAN' ? Number(roomId) : null,
        asset_ids: type === 'ASET' ? assetIds : [],
        start_at: new Date(start).toISOString(),
        end_at: new Date(end).toISOString(),
        use_facilities: type === 'RUANGAN' && facilities,
        ...p,
      });
      setResult(r);
      setStep('done');
    } catch (e) {
      setError(e as ApiError);
      setStep('form');
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicFormPage
      code="SCR-09"
      title="Form Pengajuan Peminjaman"
      subtitle={
        <>
          Tanpa login. Kolom bertanda <span className="text-rose-600">*</span> wajib diisi.
        </>
      }
      aside={
        <>
          <div className={cn('glass p-5 transition', step === 'summary' && 'ring-1 ring-ember-300/60 shadow-soft')}>
            <h2>Ringkasan & Konfirmasi Email</h2>
            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: type === 'RUANGAN' ? 'Ruangan' : 'Aset', value: place },
                  { label: 'Waktu', value: `${tanggalJam(start)} – ${tanggalJam(end)}` },
                  { label: 'Penanggung Jawab', value: p.borrower_name || '—' },
                  { label: 'Telepon', value: p.borrower_phone || '—' },
                ]}
              />
            </div>
            <p className="mt-4 rounded-xl bg-white p-3 text-sm text-ink/75">
              Notifikasi akan dikirim ke <b className="break-all text-ink">{p.borrower_email || '…'}</b>. Sudah benar?
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm" disabled={step === 'done'} onClick={() => setStep('form')}>
                Ubah Data
              </Button>
              <Button size="sm" disabled={step !== 'summary'} loading={sending} onClick={send}>
                Kirim Pengajuan
              </Button>
            </div>
          </div>
          {step === 'done' && result && (
            <div className="glass anim-fade-up p-5">
              <span className="eyebrow">Halaman sukses</span>
              <h2 className="mt-2">Pengajuan Terkirim</h2>
              <p className="mb-2 mt-3 text-sm text-ink/65">Simpan kode ini untuk Cek Status:</p>
              <TrackingCode code={result.loan_code} />
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/status" className="font-mono text-xs text-ember-700 hover:text-ink">
                  Cek Status Pengajuan →
                </Link>
                {result.pic_wa_link && (
                  <a href={result.pic_wa_link} target="_blank" rel="noreferrer" className="font-mono text-xs text-emerald-600 hover:text-ink">
                    Hubungi Sarpras (wa.me) →
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          toSummary();
        }}
      >
        {error && !error.details && <Alert tone="error">{error.message}</Alert>}
        {conflict && <Alert tone="warning">{conflict}</Alert>}

        <div className="space-y-1.5">
          <p className="field-label">
            Jenis Peminjaman <span className="text-rose-600">*</span>
          </p>
          <Segmented
            value={type}
            onChange={(v) => {
              setType(v);
              setStep('form');
            }}
            options={[
              { value: 'RUANGAN', label: 'Ruangan' },
              { value: 'ASET', label: 'Barang' },
            ]}
          />
        </div>

        {type === 'RUANGAN' ? (
          <Select no={2} label="Ruangan" required value={roomId} onChange={(e) => setRoomId(e.target.value)} error={err('room_id')}>
            {rooms?.map((r) => (
              <option key={r.room_id} value={r.room_id}>
                {r.room_name}
                {r.capacity ? ` (kapasitas ${r.capacity})` : ''}
              </option>
            ))}
          </Select>
        ) : (
          <div className="space-y-1.5">
            <p className="field-label">
              Aset yang Dipinjam <span className="text-rose-600">*</span>
            </p>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-900/[0.08] bg-white p-2">
              {assets.length === 0 && <p className="p-2 text-sm text-ink/50">Memuat katalog…</p>}
              {assets.map((a) => (
                <label key={a.asset_id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition hover:bg-ember-50', a.status !== 'TERSEDIA' && 'opacity-50')}>
                  <input
                    type="checkbox"
                    className="check"
                    disabled={a.status !== 'TERSEDIA'}
                    checked={assetIds.includes(a.asset_id)}
                    onChange={() => setAssetIds((ids) => (ids.includes(a.asset_id) ? ids.filter((x) => x !== a.asset_id) : [...ids, a.asset_id]))}
                  />
                  <span className="font-mono text-xs text-brand-700">{a.asset_code}</span>
                  <span className="flex-1 text-ink/85">{a.asset_name}</span>
                  {a.status !== 'TERSEDIA' && <span className="font-mono text-[10px] text-ink/50">{a.status}</span>}
                </label>
              ))}
            </div>
            {err('asset_ids') && <p className="text-xs text-rose-600">{err('asset_ids')}</p>}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input no={3} label="Waktu Mulai" type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} error={err('start_at')} />
          <Input label="Waktu Selesai" type="datetime-local" required value={end} onChange={(e) => setEnd(e.target.value)} error={err('end_at')} />
        </div>
        {type === 'RUANGAN' && (
          <label className="flex items-center gap-3 text-sm text-ink/85">
            <input type="checkbox" className="check" checked={facilities} onChange={(e) => setFacilities(e.target.checked)} />
            Pakai fasilitas tambahan (sound system, proyektor) — khusus ruangan
          </label>
        )}

        <FormSection title="Penanggung Jawab" />
        <Input no={5} label="Nama Penanggung Jawab" required minLength={3} maxLength={150} value={p.borrower_name} onChange={setField('borrower_name')} error={err('borrower_name')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input no={6} label="Telepon" required inputMode="tel" placeholder="08xxxxxxxxxx" value={p.borrower_phone} onChange={setField('borrower_phone')} error={err('borrower_phone')} />
          <Input no={7} label="Email" type="email" required value={p.borrower_email} onChange={setField('borrower_email')} error={err('borrower_email')} />
        </div>
        <Alert tone="warning">Pastikan email aktif dan dapat menerima pesan. Konfirmasi dan keputusan peminjaman akan dikirim ke email ini. Periksa juga folder Spam.</Alert>
        <Input no={8} label="Instansi / Organisasi" placeholder="Opsional" maxLength={100} value={p.borrower_org} onChange={setField('borrower_org')} error={err('borrower_org')} />
        <Textarea no={9} label="Keperluan" required minLength={5} maxLength={255} value={p.purpose} onChange={setField('purpose')} error={err('purpose')} />
        <Alert tone="info" title="Informasi Pembayaran">
          Pemakaian fasilitas dapat dikenakan tarif. Pembayaran dilakukan di luar sistem dan dicatat oleh Bendahara.
        </Alert>
        <Button type="submit" variant="brand" icon="arrowRight" disabled={step === 'done'}>
          Lanjut ke Ringkasan
        </Button>
      </form>
    </PublicFormPage>
  );
}
