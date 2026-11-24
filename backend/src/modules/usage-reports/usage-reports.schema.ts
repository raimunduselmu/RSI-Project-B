// FSD-2.13 Lapor Pemakaian Internal
import { z } from 'zod';
import { PHONE_REGEX } from '../../lib/phone.js';

export const CONDITIONS = ['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT'] as const;

const phone = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, ''))
  .refine((s) => PHONE_REGEX.test(s), 'Masukkan nomor telepon yang valid (contoh: 08123456789)');

export const idParam = z.object({ id: z.string().uuid('ID laporan tidak valid') });

export const listUsageQuery = z.object({
  status: z.enum(['BERLANGSUNG', 'SELESAI']).optional(),
  mine: z.enum(['true', 'false']).optional(),
  q: z.string().trim().max(100).optional(),
});

export const createUsageSchema = z
  .object({
    reporter_name: z.string().trim().min(3).max(150),
    reporter_phone: phone,
    division: z.string().trim().min(2).max(100),
    activity_name: z.string().trim().min(3).max(150),
    room_id: z.coerce.number().int().positive().nullable().optional(),
    asset_ids: z.array(z.string().uuid()).max(30).default([]),
    start_at: z.coerce.date(),
    planned_end_at: z.coerce.date(),
  })
  .superRefine((d, ctx) => {
    if (!d.room_id && d.asset_ids.length === 0) ctx.addIssue({ code: 'custom', path: ['asset_ids'], message: 'Pilih ruangan atau minimal satu aset' });
    if (d.planned_end_at <= d.start_at) ctx.addIssue({ code: 'custom', path: ['planned_end_at'], message: 'Waktu selesai harus setelah waktu mulai' });
    if (d.planned_end_at.getTime() <= Date.now()) ctx.addIssue({ code: 'custom', path: ['planned_end_at'], message: 'Perkiraan selesai tidak boleh di masa lalu' });
  });

export const finishUsageSchema = z.object({
  /** Kondisi setiap aset setelah dipakai. Aset yang tidak disebut dianggap BAIK. */
  items: z.array(z.object({ asset_id: z.string().uuid(), condition_after: z.enum(CONDITIONS) })).max(30).default([]),
});

export type ListUsageQuery = z.infer<typeof listUsageQuery>;
export type CreateUsageInput = z.infer<typeof createUsageSchema>;
export type FinishUsageInput = z.infer<typeof finishUsageSchema>;
