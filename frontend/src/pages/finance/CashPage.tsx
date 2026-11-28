
// SCR-31 Kas & Anggaran (FSD-2.33, 2.44) — Template B (form di kiri)
// SCR-25 Kas & Transaksi (FSD-2.32)

import { useEffect, useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { Alert, Badge, Button, Input, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/shared/PageHeader';

interface CashTransaction {
  transaction_id: string;
  transaction_type: 'MASUK' | 'KELUAR';
  amount: number;
  category: string;
  budget_id: number | null;
  budget_name: string | null;
  transaction_date: string;
  period_id: number;
  source_ref: string | null;
  status: string;
  description: string | null;
  created_at: string;
  created_by_name: string | null;
  has_proof: boolean;
}

interface Budget {
  budget_id: number;
  pos_name: string;
  planned_amount: number;
  spent_amount: number;
  remaining: number;
  used_percent: number;
}

const STATUS_LABELS: Record<string, string> = {
  DISETUJUI: 'Disetujui',
  MENUNGGU_PERSETUJUAN: 'Menunggu Persetujuan PHT',
  DITOLAK: 'Ditolak',
};

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function CashPage() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [transactionType, setTransactionType] =
    useState<'MASUK' | 'KELUAR'>('MASUK');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactionDate, setTransactionDate] = useState(today());
  const [budgetId, setBudgetId] = useState('');
  const [description, setDescription] = useState('');
  const [requestApproval, setRequestApproval] = useState(false);
  const [proof, setProof] = useState<File | null>(null);

  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>(
    {},
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        per_page: '10',
      });

      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (monthFilter) params.set('month', monthFilter);
      if (search) params.set('q', search);

      try {
        const [cashResult, budgetResult] = await Promise.all([
          api.page<CashTransaction>(
            `/cash-transactions?${params.toString()}`,
          ),
          api.get<Budget[]>('/budgets'),
        ]);

        if (!active) return;

        setTransactions(cashResult.data);
        setMeta(cashResult.meta);
        setBudgets(budgetResult);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil data keuangan.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [
    page,
    typeFilter,
    statusFilter,
    monthFilter,
    search,
    refreshKey,
  ]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!category.trim() || Number(amount) <= 0) {
      setError('Kategori dan nominal transaksi harus diisi dengan benar.');
      return;
    }

    if (transactionType === 'MASUK' && budgetId) {
      setError(
        'Pos anggaran hanya boleh digunakan untuk transaksi kas keluar.',
      );
      return;
    }

    const formData = new FormData();

    formData.append('transaction_type', transactionType);
    formData.append('amount', amount);
    formData.append('category', category.trim());
    formData.append('transaction_date', transactionDate);

    if (transactionType === 'KELUAR' && budgetId) {
      formData.append('budget_id', budgetId);
    }

    if (description.trim()) {
      formData.append('description', description.trim());
    }

    formData.append('request_approval', String(requestApproval));

    if (proof) {
      formData.append('proof', proof);
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const result = await api.post<CashTransaction>(
        '/cash-transactions',
        formData,
      );

      setMessage(
        result.status === 'MENUNGGU_PERSETUJUAN'
          ? 'Transaksi berhasil diajukan dan menunggu persetujuan PHT.'
          : 'Transaksi kas berhasil dicatat.',
      );

      setAmount('');
      setCategory('');
      setTransactionDate(today());
      setBudgetId('');
      setDescription('');
      setRequestApproval(false);
      setProof(null);
      setShowForm(false);
      setPage(1);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mencatat transaksi.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDecision(id: string, approve: boolean) {
    const reason = rejectReasons[id]?.trim() ?? '';

    if (!approve && reason.length < 3) {
      setError('Alasan penolakan minimal 3 karakter.');
      return;
    }

    const confirmed = window.confirm(
      approve
        ? 'Setujui transaksi pengeluaran ini?'
        : 'Tolak transaksi pengeluaran ini?',
    );

    if (!confirmed) return;

    setBusyId(id);
    setError('');
    setMessage('');

    try {
      await api.post(
        `/cash-transactions/${encodeURIComponent(id)}/${approve ? 'approve' : 'reject'}`,
        approve ? undefined : { reason },
      );

      setMessage(
        approve
          ? 'Transaksi berhasil disetujui.'
          : 'Transaksi berhasil ditolak.',
      );

      setRejectReasons((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });

      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memproses transaksi.',
      );
    } finally {
      setBusyId('');
    }
  }

  function resetFilters() {
    setTypeFilter('');
    setStatusFilter('');
    setMonthFilter('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  const start =
    meta.total === 0
      ? 0
      : (meta.current_page - 1) * meta.per_page + 1;

  const end = Math.min(
    meta.current_page * meta.per_page,
    meta.total,
  );

  return (
    <>
      <PageHeader
        title="Kas Masuk/Keluar"
        subtitle="Pencatatan dan pengelolaan transaksi keuangan"
        code="SCR-25"
        actions={
          <Button onClick={() => setShowForm((value) => !value)}>
            {showForm ? 'Tutup Form' : 'Tambah Transaksi'}
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {message && (
        <div className="mb-4">
          <Alert tone="success">{message}</Alert>
        </div>
      )}

      {showForm && (
        <section className="mb-6 rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-stone-800">
            Catat Transaksi Baru
          </h2>

          <form
            onSubmit={handleCreate}
            className="grid gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Jenis Transaksi
              </label>

              <select
                value={transactionType}
                onChange={(event) => {
                  setTransactionType(
                    event.target.value as 'MASUK' | 'KELUAR',
                  );
                  setBudgetId('');
                  setRequestApproval(false);
                }}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              >
                <option value="MASUK">Kas Masuk</option>
                <option value="KELUAR">Kas Keluar</option>
              </select>
            </div>

            <Input
              label="Nominal (Rp)"
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Contoh: 500000"
              required
            />

            <Input
              label="Kategori"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Contoh: Donasi, Operasional"
              required
            />

            <Input
              label="Tanggal Transaksi"
              type="date"
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
              required
            />

            {transactionType === 'KELUAR' && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Pos Anggaran
                </label>

                <select
                  value={budgetId}
                  onChange={(event) => setBudgetId(event.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Tanpa pos anggaran</option>

                  {budgets.map((budget) => (
                    <option
                      key={budget.budget_id}
                      value={budget.budget_id}
                    >
                      {budget.pos_name} — Sisa{' '}
                      {rupiah(budget.remaining)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Deskripsi / Keterangan
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Keterangan transaksi (opsional)"
                className="w-full rounded-lg border border-stone-300 p-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Bukti Transaksi (opsional)
              </label>

              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) =>
                  setProof(event.target.files?.[0] ?? null)
                }
                className="w-full rounded-lg border border-stone-300 p-2 text-sm"
              />

              {proof && (
                <p className="mt-1 text-xs text-stone-500">
                  {proof.name}
                </p>
              )}
            </div>

            {transactionType === 'KELUAR' && budgetId && (
              <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                <input
                  type="checkbox"
                  checked={requestApproval}
                  onChange={(event) =>
                    setRequestApproval(event.target.checked)
                  }
                  className="mt-1"
                />

                <span>
                  Jika nominal melebihi sisa anggaran, ajukan
                  persetujuan PHT. Jika tidak dicentang, transaksi
                  akan ditolak backend saat anggaran tidak cukup.
                </span>
              </label>
            )}

            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
              >
                Simpan Transaksi
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Batal
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="mb-5 rounded-xl border border-stone-200 bg-white p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="grid gap-3 md:grid-cols-5"
        >
          <Input
            label="Cari Transaksi"
            placeholder="Kategori atau keterangan..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Jenis
            </label>

            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Semua Jenis</option>
              <option value="MASUK">Kas Masuk</option>
              <option value="KELUAR">Kas Keluar</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Semua Status</option>

              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Bulan"
            type="month"
            value={monthFilter}
            onChange={(event) => {
              setMonthFilter(event.target.value);
              setPage(1);
            }}
          />

          <div className="flex items-end gap-2">
            <Button type="submit">Cari</Button>

            <Button
              type="button"
              variant="secondary"
              onClick={resetFilters}
            >
              Reset
            </Button>
          </div>
        </form>
      </section>

      <div className="mb-3 flex items-center justify-between text-sm text-stone-600">
        <span>
          Total transaksi: <strong>{meta.total}</strong>
        </span>

        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Muat Ulang
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center gap-3 py-12">
          <Spinner />
          <span className="text-sm text-stone-500">
            Memuat transaksi...
          </span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white py-12 text-center text-sm text-stone-500">
          Belum ada transaksi yang ditemukan.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Jenis</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Pos Anggaran</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Status</th>
                <th className="p-3">Bukti</th>
                <th className="p-3">Tindakan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {transactions.map((item) => (
                <tr key={item.transaction_id}>
                  <td className="whitespace-nowrap p-3">
                    {item.transaction_date}
                  </td>

                  <td className="p-3">
                    <Badge
                      status={item.transaction_type}
                      label={
                        item.transaction_type === 'MASUK'
                          ? 'Kas Masuk'
                          : 'Kas Keluar'
                      }
                    />
                  </td>

                  <td className="p-3">
                    <p className="font-medium">{item.category}</p>

                    {item.description && (
                      <p className="mt-1 max-w-xs text-xs text-stone-500">
                        {item.description}
                      </p>
                    )}
                  </td>

                  <td className="p-3">
                    {item.budget_name ?? '-'}
                  </td>

                  <td className="whitespace-nowrap p-3 font-semibold">
                    {rupiah(item.amount)}
                  </td>

                  <td className="p-3">
                    <Badge
                      status={item.status}
                      label={
                        STATUS_LABELS[item.status] ?? item.status
                      }
                    />
                  </td>

                  <td className="p-3">
                    {item.has_proof ? (
                      <button
                        type="button"
                        className="text-brand-700 underline"
                        onClick={() => {
                          const base =
                            import.meta.env.VITE_API_URL ?? '/api/v1';

                          window.open(
                            `${base}/cash-transactions/${encodeURIComponent(item.transaction_id)}/proof`,
                            '_blank',
                            'noopener,noreferrer',
                          );
                        }}
                      >
                        Lihat Bukti
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="p-3">
                    {item.status === 'MENUNGGU_PERSETUJUAN' ? (
                      <div className="min-w-48 space-y-2">
                        <input
                          value={rejectReasons[item.transaction_id] ?? ''}
                          onChange={(event) =>
                            setRejectReasons((current) => ({
                              ...current,
                              [item.transaction_id]: event.target.value,
                            }))
                          }
                          placeholder="Alasan jika ditolak"
                          className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs"
                        />

                        <div className="flex gap-1">
                          <Button
                            loading={busyId === item.transaction_id}
                            disabled={!!busyId}
                            onClick={() =>
                              handleDecision(item.transaction_id, true)
                            }
                          >
                            Setujui
                          </Button>

                          <Button
                            variant="danger"
                            loading={busyId === item.transaction_id}
                            disabled={!!busyId}
                            onClick={() =>
                              handleDecision(item.transaction_id, false)
                            }
                          >
                            Tolak
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Menampilkan {start}–{end} dari {meta.total} transaksi
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            disabled={loading || page <= 1}
            onClick={() =>
              setPage((value) => Math.max(1, value - 1))
            }
          >
            Sebelumnya
          </Button>

          <span className="text-sm text-stone-600">
            {meta.current_page}/{meta.last_page}
          </span>

          <Button
            variant="secondary"
            disabled={loading || page >= meta.last_page}
            onClick={() =>
              setPage((value) =>
                Math.min(meta.last_page, value + 1),
              )
            }
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </>
  );
}
