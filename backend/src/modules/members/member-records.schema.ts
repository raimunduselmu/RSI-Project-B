// FSD-2.24 — Kelola Riwayat Pelayanan & Sakramen/Katekese
// BR-59: append-only
// BR-60: tanggal kejadian tidak boleh di masa depan

import { z } from 'zod';

// Format tanggal YYYY-MM-DD sekaligus memastikan tanggal kalender valid.
const ymd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Gunakan format tanggal YYYY-MM-DD')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, 'Tanggal tidak valid');

// Catatan boleh kosong, null, atau tidak dikirim.
const optionalNote = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().max(255).nullable().optional(),
);

// FSD-2.24 AF-2: filter jenis dan periode.
export const listMemberRecordsQuerySchema = z.object({
  record_type: z
    .enum(['PELAYANAN', 'SAKRAMEN', 'KATEKESE'])
    .optional(),

  period_id: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
});

// Riwayat pelayanan dan katekese.
// TSD Table 28: period_id wajib.
const memberServiceRecordSchema = z.object({
  record_type: z.enum(['PELAYANAN', 'KATEKESE']),

  title: z.string().trim().min(1).max(150),

  record_date: ymd,

  period_id: z.coerce
    .number()
    .int()
    .positive(),

  note: optionalNote,

  // Koreksi menunjuk record lama.
  corrects_record_id: z.string().uuid().optional(),
}).strict();

// Riwayat sakramen.
// TSD Table 29 tidak memiliki kolom period_id atau corrects_record_id.
const sacramentRecordSchema = z.object({
  record_type: z.literal('SAKRAMEN'),

  // title API dipetakan menjadi sacrament_type pada database.
  title: z.string().trim().min(1).max(30),

  record_date: ymd,

  place: z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().trim().max(150).nullable().optional(),
  ),

  note: optionalNote,
}).strict();

// Satu endpoint menerima tiga jenis riwayat.
export const createMemberRecordSchema = z
  .discriminatedUnion('record_type', [
    memberServiceRecordSchema,
    sacramentRecordSchema,
  ])
  .superRefine((value, ctx) => {
    // Koreksi pelayanan/katekese harus memiliki penjelasan.
    if (
      value.record_type !== 'SAKRAMEN' &&
      value.corrects_record_id &&
      !value.note?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['note'],
        message: 'Catatan koreksi wajib diisi',
      });
    }
  });

export type ListMemberRecordsQuery =
  z.infer<typeof listMemberRecordsQuerySchema>;

export type CreateMemberRecordInput =
  z.infer<typeof createMemberRecordSchema>;