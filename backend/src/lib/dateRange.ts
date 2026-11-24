// Validasi rentang tanggal YYYY-MM-DD bersama (FSD Bagian 6: ERR-VAL-04)
import { z } from 'zod';

export const ymdStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD');

/** Tambahkan ke skema yang punya date_from & date_to: date_to tidak boleh sebelum date_from */
export function checkDateRange(d: { date_from?: string; date_to?: string }, ctx: z.RefinementCtx) {
  if (d.date_from && d.date_to && d.date_to < d.date_from) {
    ctx.addIssue({ code: 'custom', path: ['date_to'], message: 'Tanggal akhir harus setelah tanggal awal' });
  }
}

/** Query rentang tanggal umum (riwayat, dashboard) */
export const dateRangeQuery = z
  .object({ date_from: ymdStr.optional(), date_to: ymdStr.optional() })
  .passthrough()
  .superRefine(checkDateRange);
