// FSD-2.32 Kas Masuk/Keluar · FSD-2.33 Anggaran · FSD-2.34 Laporan Keuangan
import { z } from 'zod';
import { checkDateRange } from '../../lib/dateRange.js';

const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);
const ymdStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD');
const amount = z.coerce.number({ invalid_type_error: 'Nominal harus berupa angka' }).positive('Nominal harus lebih dari 0').max(9_999_999_999_999);
const bool = z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean());

export const idParam = z.object({ id: z.string().uuid('ID transaksi tidak valid') });
export const budgetIdParam = z.object({ id: z.coerce.number().int().positive() });

export const listCashQuery = z.object({
  type: z.enum(['MASUK', 'KELUAR']).optional(),
  status: z.enum(['DISETUJUI', 'MENUNGGU_PERSETUJUAN', 'DITOLAK']).optional(),
  period_id: z.coerce.number().int().positive().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM').optional(),
  budget_id: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(100).optional(),
});

/** multipart: semua nilai datang sebagai string, jadi coerce */
export const createCashSchema = z.object({
  transaction_type: z.enum(['MASUK', 'KELUAR'], { errorMap: () => ({ message: 'Pilih MASUK atau KELUAR' }) }),
  amount,
  category: z.string().trim().min(2).max(100),
  transaction_date: z.preprocess(emptyToUndef, ymdStr.optional()),
  budget_id: z.preprocess(emptyToUndef, z.coerce.number().int().positive().optional()),
  description: z.preprocess(emptyToUndef, z.string().trim().max(1000).optional()),
  /** true = tetap ajukan walau melebihi anggaran; menunggu persetujuan PHT (FSD-2.33 AF-1) */
  request_approval: z.preprocess(emptyToUndef, bool.optional()),
});

export const rejectCashSchema = z.object({ reason: z.string().trim().min(3, 'Alasan wajib diisi').max(255) });

export const listBudgetQuery = z.object({ period_id: z.coerce.number().int().positive().optional() });
export const createBudgetSchema = z.object({
  period_id: z.coerce.number().int().positive().optional(),
  pos_name: z.string().trim().min(2).max(150),
  planned_amount: amount,
});
export const updateBudgetSchema = z
  .object({ pos_name: z.string().trim().min(2).max(150).optional(), planned_amount: amount.optional() })
  .refine((d) => Object.keys(d).length > 0, { message: 'Tidak ada data yang diubah' });

export const reportQuery = z
  .object({ period_id: z.coerce.number().int().positive().optional(), date_from: ymdStr.optional(), date_to: ymdStr.optional() })
  .superRefine(checkDateRange);

export type ListCashQuery = z.infer<typeof listCashQuery>;
export type CreateCashInput = z.infer<typeof createCashSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
