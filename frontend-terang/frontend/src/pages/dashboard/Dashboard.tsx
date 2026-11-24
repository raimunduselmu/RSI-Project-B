// SCR-03 Dashboard Internal (FSD-2.2, 2.21, 2.40) — Template F
// Data (backend sudah jadi): GET /assets?status=…&per_page=1 (pakai meta.total) · GET /loans?status=MENUNGGU
// GET /dashboard dan /maintenance-schedules masih 501 di backend → panel pemeliharaan menunggu modulnya.
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardPage, ListPanel } from '@/components/templates';
import { Alert, Badge } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { qs, usePaged } from '@/hooks/usePaged';
import { tanggalJam } from '@/lib/format';
import type { LoanRow } from '@/lib/types';

const greeting = () => {
  const h = new Date().getHours();
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
};

type Counts = { total: number; TERSEDIA: number; DIPINJAM: number; PEMELIHARAAN: number; HILANG: number };
const STATUS_KEYS = ['TERSEDIA', 'DIPINJAM', 'PEMELIHARAAN', 'HILANG'] as const;

/** Jumlah aset per status, diambil dari meta.total tiap filter (1 baris per permintaan). */
function useAssetCounts() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  useEffect(() => {
    const total = (status?: string) => api.page(`/assets${qs({ status, per_page: 1 })}`).then((r) => r.meta.total);
    Promise.all([total(), ...STATUS_KEYS.map((s) => total(s))])
      .then(([t, ...rest]) => setCounts({ total: t, ...Object.fromEntries(STATUS_KEYS.map((k, i) => [k, rest[i]])) } as Counts))
      .catch((e) => setError(e as ApiError));
  }, []);
  return { counts, error };
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const first = user?.full_name.split(' ')[0] ?? '';
  const today = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());
  const canSeeLoans = hasRole('Sarpras', 'PHT');

  const { counts, error } = useAssetCounts();
  const loans = usePaged<LoanRow>(canSeeLoans ? `/loans${qs({ status: 'MENUNGGU', per_page: 5 })}` : null);
  const n = (v?: number) => (counts ? v ?? 0 : error ? '—' : '…');

  return (
    <DashboardPage
      code="SCR-03"
      eyebrow="Dashboard"
      title={
        <>
          {greeting()}, <em className="text-ember-600">{first}</em>
        </>
      }
      subtitle={`Ringkasan Sarana Prasarana hari ini, ${today}.`}
      topSlot={error && <Alert tone="error">Gagal memuat ringkasan aset: {error.message}</Alert>}
      statsTitle="Ringkasan Aset"
      stats={[
        { label: 'Total Aset', value: n(counts?.total) },
        { label: 'Tersedia', value: n(counts?.TERSEDIA), tone: 'green' },
        { label: 'Dipinjam', value: n(counts?.DIPINJAM), tone: 'brand' },
        { label: 'Pemeliharaan', value: n(counts?.PEMELIHARAAN), tone: 'amber' },
        { label: 'Hilang', value: n(counts?.HILANG), tone: 'ember' },
      ]}
    >
      {canSeeLoans && (
        <ListPanel
          no={2}
          title={`Pengajuan Menunggu${loans.meta ? ` (${loans.meta.total})` : ''}`}
          to="/admin/loans"
          items={
            loans.loading
              ? [{ key: 'l', title: <span className="text-ink/50">Memuat…</span> }]
              : loans.error
                ? [{ key: 'e', title: <span className="text-rose-600">{loans.error.message}</span> }]
                : loans.rows.length === 0
                  ? [{ key: '0', title: <span className="text-ink/50">Tidak ada pengajuan yang menunggu.</span> }]
                  : loans.rows.map((l) => ({
                      key: l.loan_id,
                      title: <span className="font-mono">{l.loan_code}</span>,
                      subtitle: `${l.borrower_name}${l.borrower_org ? ` · ${l.borrower_org}` : ''} · ${l.request_type === 'RUANGAN' ? l.room_name : l.asset_names}`,
                      right: <Badge status={l.status} />,
                      meta: tanggalJam(l.start_at),
                    }))
          }
        />
      )}
      <ListPanel
        no={3}
        title="Pemeliharaan Jatuh Tempo"
        to="/maintenance"
        items={[
          {
            key: 'na',
            title: <span className="text-ink/60">Belum tersedia</span>,
            subtitle: 'Modul pemeliharaan di backend (GET /maintenance-schedules) belum diimplementasikan.',
          },
        ]}
      />
    </DashboardPage>
  );
}
