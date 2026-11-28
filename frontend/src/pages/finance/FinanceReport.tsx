
// SCR-33 Laporan Keuangan & Donasi (FSD-2.35)

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Alert, Badge, Button, Card, Spinner } from '@/components/ui';
import { PageHeader } from '@/components/shared/PageHeader';

interface MonthlyReport {
  bulan: string;
  masuk: number;
  keluar: number;
  saldo_akhir: number;
}

interface CategoryReport {
  kategori?: string;
  category?: string;
  masuk?: number;
  keluar?: number;
  total_masuk?: number;
  total_keluar?: number;
}

interface BudgetReport {
  pos_name?: string;
  planned_amount?: number;
  spent_amount?: number;
  remaining?: number;
  used_percent?: number;
}

interface FinanceReportData {
  period?: {
    period_id?: number;
    period_name?: string;
    name?: string;
  } | null;
  ringkasan: {
    total_masuk: number;
    total_keluar: number;
    saldo: number;
  };
  per_bulan: MonthlyReport[];
  per_kategori: CategoryReport[];
  anggaran: BudgetReport[];
  menunggu_persetujuan: number;
}

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function compactRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'IDR',
  }).format(Number(value) || 0);
}

export default function FinanceReport() {
  const [report, setReport] = useState<FinanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadReport() {
      setLoading(true);
      setError('');

      try {
        const result = await api.get<FinanceReportData>('/reports');

        if (active) {
          setReport(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil laporan keuangan.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const summary = report?.ringkasan;

  return (
    <>
      <PageHeader
        code="SCR-33"
        title="Laporan Keuangan & Donasi"
        subtitle="Ringkasan pemasukan, pengeluaran, dan penggunaan anggaran."
        actions={
          <Button
            variant="secondary"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
          >
            Muat Ulang
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center gap-3 py-16">
          <Spinner />
          <span className="text-sm text-stone-500">
            Memuat laporan keuangan...
          </span>
        </div>
      ) : !report ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
          <p className="text-sm text-stone-500">
            Data laporan belum tersedia.
          </p>
          <Button
            className="mt-4"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-stone-500">Periode laporan</p>
              <p className="font-semibold text-stone-800">
                {report.period?.period_name ??
                  report.period?.name ??
                  'Periode aktif'}
              </p>
            </div>

            <Badge
              status={
                report.menunggu_persetujuan > 0
                  ? 'MENUNGGU_PERSETUJUAN'
                  : 'DISETUJUI'
              }
              label={`${report.menunggu_persetujuan} transaksi menunggu persetujuan`}
            />
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <p className="text-sm text-stone-500">Total Kas Masuk</p>
              <p className="mt-2 text-xl font-bold text-emerald-600">
                {compactRupiah(summary?.total_masuk ?? 0)}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Seluruh pemasukan disetujui
              </p>
            </Card>

            <Card>
              <p className="text-sm text-stone-500">Total Kas Keluar</p>
              <p className="mt-2 text-xl font-bold text-red-600">
                {compactRupiah(summary?.total_keluar ?? 0)}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Seluruh pengeluaran disetujui
              </p>
            </Card>

            <Card>
              <p className="text-sm text-stone-500">Saldo Akhir</p>
              <p className="mt-2 text-xl font-bold text-brand-700">
                {compactRupiah(summary?.saldo ?? 0)}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Saldo kas periode
              </p>
            </Card>

            <Card>
              <p className="text-sm text-stone-500">
                Menunggu Persetujuan
              </p>
              <p className="mt-2 text-xl font-bold text-amber-600">
                {report.menunggu_persetujuan}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Transaksi menunggu keputusan PHT
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="mb-4 font-semibold text-stone-800">
              Ringkasan Kas Per Bulan
            </h2>

            {report.per_bulan.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500">
                Belum ada data laporan bulanan.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-stone-50 text-stone-600">
                    <tr>
                      <th className="p-3">Bulan</th>
                      <th className="p-3 text-right">Kas Masuk</th>
                      <th className="p-3 text-right">Kas Keluar</th>
                      <th className="p-3 text-right">Saldo Akhir</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {report.per_bulan.map((item, index) => (
                      <tr key={`${item.bulan}-${index}`}>
                        <td className="p-3 font-medium text-stone-800">
                          {item.bulan}
                        </td>
                        <td className="p-3 text-right text-emerald-600">
                          {rupiah(item.masuk)}
                        </td>
                        <td className="p-3 text-right text-red-600">
                          {rupiah(item.keluar)}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {rupiah(item.saldo_akhir)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-semibold text-stone-800">
                Laporan Per Kategori
              </h2>

              {report.per_kategori.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">
                  Belum ada data kategori.
                </p>
              ) : (
                <div className="space-y-3">
                  {report.per_kategori.map((item, index) => (
                    <div
                      key={`${item.kategori ?? item.category ?? 'kategori'}-${index}`}
                      className="rounded-lg border border-stone-100 p-3"
                    >
                      <p className="mb-2 font-medium text-stone-800">
                        {item.kategori ?? item.category ?? 'Tanpa kategori'}
                      </p>

                      <div className="flex flex-wrap justify-between gap-2 text-sm">
                        <span className="text-emerald-600">
                          Masuk:{' '}
                          {rupiah(item.masuk ?? item.total_masuk ?? 0)}
                        </span>
                        <span className="text-red-600">
                          Keluar:{' '}
                          {rupiah(item.keluar ?? item.total_keluar ?? 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="mb-4 font-semibold text-stone-800">
                Ringkasan Anggaran
              </h2>

              {report.anggaran.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">
                  Belum ada data anggaran.
                </p>
              ) : (
                <div className="space-y-4">
                  {report.anggaran.map((item, index) => {
                    const percent = Math.min(
                      100,
                      Math.max(0, Number(item.used_percent) || 0),
                    );

                    return (
                      <div key={`${item.pos_name ?? 'anggaran'}-${index}`}>
                        <div className="mb-1 flex justify-between gap-2 text-sm">
                          <span className="font-medium text-stone-800">
                            {item.pos_name ?? 'Pos anggaran'}
                          </span>
                          <span className="text-stone-500">
                            {percent.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-brand-600"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="mt-1 flex justify-between gap-2 text-xs text-stone-500">
                          <span>
                            Terpakai:{' '}
                            {rupiah(item.spent_amount ?? 0)}
                          </span>
                          <span>
                            Anggaran:{' '}
                            {rupiah(item.planned_amount ?? 0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}