// FSD-2.14 Kelola Jadwal Pemeliharaan
import { z } from 'zod';
import { todayWib } from '../../lib/time.js';

const CONDITIONS = ['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT'] as const;
const ymdStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD');
const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);

export const idParam = z.object({ id: z.string().uuid('ID jadwal tidak valid') });

export const listScheduleQuery = z.object({
  asset_id: z.string().trim().min(3).max(50).optional(), // UUID atau kode aset
  is_active: z.enum(['true', 'false']).optional(),
  /** Hanya yang jatuh tempo dalam N hari ke depan (termasuk yang terlambat) */
  due_within_days: z.coerce.number().int().min(0).max(365).optional(),
  overdue: z.enum(['true', 'false']).optional(),
});

export const createScheduleSchema = z.object({
  asset_id: z.string().trim().min(3).max(50), // UUID atau kode aset
  task_name: z.string().trim().min(3).max(150),
  /** Kosong → maintenance_default_days kategori aset (AF-1) */
  interval_days: z.preprocess(emptyToUndef, z.coerce.number().int().positive('Interval harus lebih dari 0').max(3650).optional()),
  next_due_date: ymdStr,
  reminder_days_before: z.preprocess(emptyToUndef, z.coerce.number().int().min(0).max(90).optional()),
});

export const updateScheduleSchema = z
  .object({
    task_name: z.string().trim().min(3).max(150).optional(),
    interval_days: z.coerce.number().int().positive('Interval harus lebih dari 0').max(3650).optional(),
    next_due_date: ymdStr.optional(),
    reminder_days_before: z.coerce.number().int().min(0).max(90).optional(),
    is_active: z.boolean().optional(), // AF-2: nonaktifkan tanpa menghapus log
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Tidak ada data yang diubah' });

export const createLogSchema = z.object({
  performed_date: ymdStr.refine((d) => d <= todayWib(), 'Tanggal pelaksanaan tidak boleh di masa depan'),
  performed_by: z.string().trim().min(2).max(100),
  result_condition: z.enum(CONDITIONS),
  notes: z.preprocess(emptyToUndef, z.string().trim().max(2000).optional()),
});

export type ListScheduleQuery = z.infer<typeof listScheduleQuery>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type CreateLogInput = z.infer<typeof createLogSchema>;
