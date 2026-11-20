// FSD-2.10 (pengajuan publik), FSD-2.11 (persetujuan), FSD-2.12 (pengambilan & pengembalian)
import { z } from 'zod';
import { PHONE_REGEX } from '../../lib/phone.js';

export const LOAN_STATUSES = ['MENUNGGU', 'DISETUJUI', 'DITOLAK', 'DIAMBIL', 'SELESAI', 'DIBATALKAN'] as const;
const CONDITIONS = ['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT'] as const;

const phone = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, ''))
  .refine((s) => PHONE_REGEX.test(s), 'Nomor HP tidak valid (contoh 081234567890)');

const optText = (max: number) => z.preprocess((v) => (v === '' ? null : v), z.string().trim().max(max).nullable().optional());

export const createLoanSchema = z
  .object({
    request_type: z.enum(['RUANGAN', 'ASET']),
    room_id: z.coerce.number().int().positive().nullable().optional(),
    asset_ids: z.array(z.string().uuid()).max(30).default([]),
    start_at: z.coerce.date(),
    end_at: z.coerce.date(),
    use_facilities: z.boolean().default(false),
    borrower_name: z.string().trim().min(3).max(150),
    borrower_phone: phone,
    borrower_email: z.string().trim().toLowerCase().email('Format email tidak valid').max(150), // wajib khusus form peminjaman (FSD-2.10)
    borrower_org: optText(100),
    purpose: z.string().trim().min(5).max(255),
  })
  .superRefine((d, ctx) => {
    if (d.request_type === 'RUANGAN' && !d.room_id) ctx.addIssue({ code: 'custom', path: ['room_id'], message: 'Pilih ruangan' });
    if (d.request_type === 'ASET' && d.asset_ids.length === 0) ctx.addIssue({ code: 'custom', path: ['asset_ids'], message: 'Pilih minimal satu aset' });
    if (d.end_at <= d.start_at) ctx.addIssue({ code: 'custom', path: ['end_at'], message: 'Waktu selesai harus setelah waktu mulai' });
    if (d.start_at.getTime() < Date.now()) ctx.addIssue({ code: 'custom', path: ['start_at'], message: 'Waktu mulai tidak boleh lewat' });
  })
  .transform((d) => ({ ...d, use_facilities: d.request_type === 'RUANGAN' ? d.use_facilities : false }));

export const listLoanQuery = z.object({
  status: z.enum(LOAN_STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
  per_page: z.coerce.number().int().positive().optional(),
});

/** :id boleh UUID atau kode lacak (PJM-201126-004) */
export const loanKeyParam = z.object({ id: z.string().trim().min(3).max(50) });

export const approveSchema = z.object({ note: optText(500) });
export const rejectSchema = z.object({ reject_reason: z.string().trim().min(5, 'Alasan minimal 5 karakter').max(500) }); // BR-25

export const pickupSchema = z.object({
  items: z.array(z.object({ asset_id: z.string().uuid(), condition_out: z.enum(CONDITIONS) })).max(30).optional(),
  note: optText(500),
});

export const returnSchema = z.object({
  conditions: z.array(z.object({ asset_id: z.string().uuid(), condition: z.enum(CONDITIONS) })).max(30).optional(),
  return_note: optText(500),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ListLoanQuery = z.infer<typeof listLoanQuery>;
export type PickupInput = z.infer<typeof pickupSchema>;
export type ReturnInput = z.infer<typeof returnSchema>;
