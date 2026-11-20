// FSD-2.43 (ajukan iuran) & FSD-2.44 (verifikasi)
import { z } from 'zod';

/** due_ids dari multipart bisa berupa: field berulang (array), JSON '["..."]', atau 'id1,id2' */
const idList = z.preprocess((v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    const s = v.trim();
    if (s.startsWith('[')) {
      try { return JSON.parse(s); } catch { return [s]; }
    }
    return s ? s.split(',').map((x) => x.trim()).filter(Boolean) : [];
  }
  return v;
}, z.array(z.string().uuid('ID bulan tidak valid')).min(1, 'Pilih minimal satu bulan').max(24));

export const submitPaymentSchema = z.object({
  due_ids: idList,
  method: z.enum(['QRIS', 'CASH'], { errorMap: () => ({ message: 'Pilih metode QRIS atau Cash' }) }),
  note: z.preprocess((v) => (v === '' ? null : v), z.string().trim().max(255).nullable().optional()),
});

export const PAYMENT_STATUSES = ['MENUNGGU_VERIFIKASI', 'DISETUJUI', 'DITOLAK'] as const;

export const listPaymentQuery = z.object({
  status: z.enum(PAYMENT_STATUSES).optional(),
  method: z.enum(['QRIS', 'CASH']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM').optional(), // pengajuan yang memuat bulan ini
  q: z.string().trim().max(100).optional(),                               // kode IUR / nama pengurus
});

export const paymentKeyParam = z.object({
  id: z.string().refine((v) => /^IUR-\d{6}-\d{3}$/.test(v) || z.string().uuid().safeParse(v).success, 'ID atau kode IUR tidak valid'),
});

export const rejectSchema = z.object({ reject_reason: z.string().trim().min(3, 'Alasan penolakan wajib diisi').max(255) });

export const recapQuery = z.object({ q: z.string().trim().max(100).optional() });

export type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>;
export type ListPaymentQuery = z.infer<typeof listPaymentQuery>;
