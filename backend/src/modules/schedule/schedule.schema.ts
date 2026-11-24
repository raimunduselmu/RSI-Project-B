// FSD-2.9 — cek ketersediaan & kalender (publik)
import { z } from 'zod';

/** asset_ids boleh "a,b" atau ?asset_ids=a&asset_ids=b */
const idList = z.preprocess(
  (v) => (Array.isArray(v) ? v : typeof v === 'string' && v ? v.split(',') : []),
  z.array(z.string().uuid()).max(50),
);

export const availabilityQuery = z
  .object({
    room_id: z.coerce.number().int().positive().optional(),
    asset_ids: idList,
    start_at: z.coerce.date(),
    end_at: z.coerce.date(),
  })
  .refine((d) => d.room_id || d.asset_ids.length > 0, { path: ['room_id'], message: 'Pilih ruangan atau minimal satu aset' })
  .refine((d) => d.end_at > d.start_at, { path: ['end_at'], message: 'Waktu selesai harus setelah waktu mulai' })
  .refine((d) => d.start_at.getTime() >= Date.now() - 5 * 60_000, { path: ['start_at'], message: 'Waktu mulai tidak boleh lewat' });

export const calendarQuery = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM').optional(),
  room_id: z.coerce.number().int().positive().optional(),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuery>;
export type CalendarQuery = z.infer<typeof calendarQuery>;
