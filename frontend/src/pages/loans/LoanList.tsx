// SCR-10 Daftar & Proses Peminjaman (FSD-2.11, 2.12) — Template C
// Data: GET /loans · GET /loans/:id · POST /loans/:id/approve|reject|pickup|return
import { useEffect, useState } from 'react';
import { DecisionBox, PanelSection, ProcessPage } from '@/components/templates';
import { Alert, Badge, Button, InfoGrid, Select, Spinner, Textarea } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useFetch } from '@/hooks/useFetch';
import { qs, usePaged } from '@/hooks/usePaged';
import { api, ApiError } from '@/lib/api';
import { tanggalJam } from '@/lib/format';
import type { LoanDetail, LoanRow } from '@/lib/types';

const STATUSES = ['MENUNGGU', 'DISETUJUI', 'DIAMBIL', 'SELESAI', 'DITOLAK', 'DIBATALKAN'];
const CONDITIONS = ['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT'];

const jam = (d: string) => new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(new Date(d));
const jadwal = (l: { start_at: string; end_at: string }) => `${tanggalJam(l.start_at)}–${jam(l.end_at)}`;
const tempat = (l: LoanRow) => (l.room_name ? `${l.room_name}${l.use_facilities ? ' + fasilitas' : ''}` : l.asset_names ?? '—');

export default function LoanList() {
  const { hasRole } = useAuth();
  const canProcess = hasRole('Sarpras');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<LoanRow | null>(null);

  const { rows, loading, error, reload } = usePaged<LoanRow>(`/loans${qs({ status, q, per_page: 50 })}`);

  // pilih baris pertama otomatis
  useEffect(() => {
    if (!sel && rows.length) setSel(rows[0]);
  }, [rows, sel]);

  return (
    <ProcessPage<LoanRow>
      code="SCR-10"
      eyebrow="Sarana Prasarana"
      title="Daftar & Proses Peminjaman"
      subtitle={!canProcess && 'Mode baca — hanya Divisi Sarpras yang dapat memproses.'}
      listTitle="Pengajuan"
      listActions={
        <>
          <input className="field !w-48 !py-1.5" placeholder="Cari kode / pemohon" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="!w-40 !py-1.5" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </>
      }
      rows={rows}
      rowKey={(l) => l.loan_code}
      selected={sel}
      onSelect={setSel}
      emptyPanel={loading ? 'Memuat…' : error ? error.message : 'Belum ada pengajuan.'}
      columns={[
        { header: 'Kode', cell: (l) => <span className="whitespace-nowrap font-mono text-[13px] text-brand-700">{l.loan_code}</span> },
        { header: 'Pemohon', cell: (l) => l.borrower_name },
        { header: 'Ruangan/Aset', cell: (l) => tempat(l) },
        { header: 'Jadwal', cell: (l) => <span className="whitespace-nowrap font-mono text-[12.5px]">{jadwal(l)}</span> },
        { header: 'Status', cell: (l) => <Badge status={l.status} /> },
      ]}
      panel={(l) => (
        <LoanPanel
          key={l.loan_code}
          code={l.loan_code}
          canProcess={canProcess}
          onChanged={async () => {
            await reload();
          }}
        />
      )}
    />
  );
}

function LoanPanel({ code, canProcess, onChanged }: { code: string; canProcess: boolean; onChanged: () => Promise<void> }) {
  const { data: d, loading, error, reload } = useFetch<LoanDetail>(`/loans/${code}`);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [cond, setCond] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');

  if (loading && !d) return <div className="flex justify-center p-10"><Spinner /></div>;
  if (error || !d) return <div className="p-5"><Alert tone="error">{error?.message ?? 'Gagal memuat'}</Alert></div>;

  const act = async (path: string, body: Record<string, unknown>, done: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await api.post(`/loans/${d.loan_code}/${path}`, body);
      setMsg({ tone: 'success', text: done });
      setNote('');
      await Promise.all([reload(), onChanged()]);
    } catch (e) {
      const err = e as ApiError;
      setMsg({ tone: 'error', text: err.details ? Object.values(err.details).flat().join(' ') : err.message });
    } finally {
      setBusy(false);
    }
  };

  const condOf = (assetId: string) => cond[assetId] ?? 'BAIK';

  return (
    <>
      <PanelSection>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-base text-ink">{d.loan_code}</p>
            <p className="mt-0.5 text-sm text-ink/60">
              {d.borrower_name}
              {d.borrower_org && ` · ${d.borrower_org}`}
            </p>
          </div>
          <Badge status={d.status} />
        </div>
      </PanelSection>

      <PanelSection>
        <InfoGrid
          items={[
            { label: d.request_type === 'RUANGAN' ? 'Ruangan' : 'Aset', value: d.room_name ?? (d.items.map((i) => i.asset_name).join(', ') || '—') },
            { label: 'Fasilitas', value: d.request_type === 'RUANGAN' ? (d.use_facilities ? 'Ya' : 'Tidak') : '—' },
            { label: 'Mulai', value: tanggalJam(d.start_at) },
            { label: 'Selesai', value: tanggalJam(d.end_at) },
            { label: 'Telepon', value: d.borrower_phone },
            { label: 'Email', value: <span className="break-all">{d.borrower_email}</span> },
          ]}
        />
        <p className="mt-4 rounded-xl border border-slate-900/[0.08] bg-white p-3 text-sm text-ink/80">{d.purpose}</p>
        {d.workflow_name && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-900/[0.08] bg-white px-4 py-3 text-sm">
            <span className="text-ink/60">
              Workflow: <b className="text-ink">{d.workflow_name}</b>
            </span>
            {d.reviewed_by_name && <span className="font-mono text-xs text-ember-700">{d.reviewed_by_name}</span>}
          </div>
        )}
        {d.reject_reason && (
          <div className="mt-3">
            <Alert tone="error" title="Alasan ditolak">
              {d.reject_reason}
            </Alert>
          </div>
        )}
      </PanelSection>

      {msg && (
        <div className="px-5 pt-4">
          <Alert tone={msg.tone}>{msg.text}</Alert>
        </div>
      )}

      {canProcess && d.status === 'MENUNGGU' && (
        <PanelSection>
          <DecisionBox
            onApprove={() => act('approve', {}, 'Pengajuan disetujui. Email keputusan dikirim.')}
            onReject={(reason) => act('reject', { reject_reason: reason }, 'Pengajuan ditolak. Email keputusan dikirim.')}
          />
        </PanelSection>
      )}

      {canProcess && (d.status === 'DISETUJUI' || d.status === 'DIAMBIL') && (
        <PanelSection title={d.status === 'DISETUJUI' ? 'Catat Pengambilan' : 'Catat Pengembalian'}>
          <div className="space-y-4">
            {d.items.map((i) => (
              <Select
                key={i.asset_id}
                label={`${i.asset_code} — ${i.asset_name}`}
                hint={d.status === 'DIAMBIL' && i.condition_out ? `Kondisi saat keluar: ${i.condition_out}` : undefined}
                value={condOf(i.asset_id)}
                onChange={(e) => setCond((c) => ({ ...c, [i.asset_id]: e.target.value }))}
                options={CONDITIONS}
              />
            ))}
            <Textarea label="Catatan" placeholder="Opsional" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            {d.status === 'DISETUJUI' ? (
              <Button
                variant="brand"
                loading={busy}
                onClick={() => act('pickup', { items: d.items.map((i) => ({ asset_id: i.asset_id, condition_out: condOf(i.asset_id) })), note }, 'Pengambilan dicatat.')}
              >
                Catat Pengambilan
              </Button>
            ) : (
              <Button
                variant="brand"
                loading={busy}
                onClick={() =>
                  act('return', { conditions: d.items.map((i) => ({ asset_id: i.asset_id, condition: condOf(i.asset_id) })), return_note: note }, 'Pengembalian dicatat.')
                }
              >
                Catat Pengembalian
              </Button>
            )}
          </div>
        </PanelSection>
      )}

      {d.approvals.length > 0 && (
        <PanelSection title="Jejak Persetujuan">
          <ul className="space-y-2 text-sm">
            {d.approvals.map((a, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  <Badge status={a.decision} /> <span className="text-ink/70">{a.approver_name ?? a.approver_role}</span>
                </span>
                <span className="font-mono text-[11px] text-ink/50">{tanggalJam(a.decided_at)}</span>
              </li>
            ))}
          </ul>
        </PanelSection>
      )}
    </>
  );
}
