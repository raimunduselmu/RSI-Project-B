// FSD-2.25 — periode, divisi, jabatan, pengurus
import { z } from 'zod';

/** Role yang boleh melekat ke divisi/jabatan (BR-115). Admin & Pastor diberikan Admin lewat Kelola Pengguna. */
export const DIVISION_ROLES = ['Sarpras', 'PHT', 'Liturgi', 'Bendahara'] as const;

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD');
const optText = (max: number) => z.preprocess((v) => (v === '' ? null : v), z.string().trim().max(max).nullable().optional());
const optRole = z.preprocess((v) => (v === '' ? null : v), z.enum(DIVISION_ROLES).nullable().optional());

export const intIdParam = z.object({ id: z.coerce.number().int().positive() });
export const uuidParam = z.object({ id: z.string().uuid() });

export const createPeriodSchema = z
  .object({
    period_name: z.string().trim().regex(/^\d{4}\/\d{4}$/, 'Format YYYY/YYYY, contoh 2026/2027'),
    start_date: date,
    end_date: date,
  })
  .refine((d) => d.end_date > d.start_date, { path: ['end_date'], message: 'Tanggal selesai harus setelah tanggal mulai' });

export const updatePeriodSchema = z
  .object({
    period_name: z.string().trim().regex(/^\d{4}\/\d{4}$/).optional(),
    start_date: date.optional(),
    end_date: date.optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), 'Tidak ada data yang diubah');

/** Pengarsipan tidak bisa dibatalkan → wajib ketik ulang nama periode */
export const archivePeriodSchema = z.object({ confirm_name: z.string().trim().min(1, 'Ketik ulang nama periode') });

export const copyStructureSchema = z.object({ from_period_id: z.coerce.number().int().positive() });

export const listDivisionQuery = z.object({ period_id: z.coerce.number().int().positive().optional() });

export const createDivisionSchema = z.object({
  period_id: z.coerce.number().int().positive().optional(), // default: periode AKTIF
  division_name: z.string().trim().min(2).max(150),
  description: optText(2000),
  role_name: optRole,
});

export const updateDivisionSchema = z
  .object({ division_name: z.string().trim().min(2).max(150).optional(), description: optText(2000), role_name: optRole })
  .refine((d) => Object.values(d).some((v) => v !== undefined), 'Tidak ada data yang diubah');

export const createPositionSchema = z.object({
  position_name: z.string().trim().min(2).max(150),
  is_leader: z.boolean().default(false),
  role_name: optRole, // kosong = ikut role divisi
});

export const listOfficerQuery = z.object({
  period_id: z.coerce.number().int().positive().optional(),
  division_id: z.coerce.number().int().positive().optional(),
  active: z.enum(['1', '0']).optional(),
  q: z.string().trim().max(100).optional(),
});

export const createOfficerSchema = z.object({
  member_id: z.string().uuid(),
  position_id: z.coerce.number().int().positive(),
  user_id: z.string().uuid().nullable().optional(), // kosong = pakai akun yang tertaut ke data umat
  start_date: date.optional(),                       // default: hari ini (WIB)
});

export const updateOfficerSchema = z
  .object({
    end_date: date.nullable().optional(), // isi = akhiri jabatan
    user_id: z.string().uuid().optional(), // tautkan akun bila sebelumnya kosong
  })
  .refine((d) => d.end_date !== undefined || d.user_id !== undefined, 'Tidak ada data yang diubah');

export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type UpdatePeriodInput = z.infer<typeof updatePeriodSchema>;
export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;
export type UpdateDivisionInput = z.infer<typeof updateDivisionSchema>;
export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type ListOfficerQuery = z.infer<typeof listOfficerQuery>;
export type CreateOfficerInput = z.infer<typeof createOfficerSchema>;
export type UpdateOfficerInput = z.infer<typeof updateOfficerSchema>;
