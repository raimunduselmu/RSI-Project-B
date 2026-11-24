// FSD-2.17 Pemeriksaan Fisik Inventaris
import { z } from 'zod';

const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);

export const idParam = z.object({ id: z.string().uuid('ID periode tidak valid') });
export const itemParam = z.object({ id: z.string().uuid('ID periode tidak valid'), itemId: z.string().uuid('ID item tidak valid') });

export const openStocktakeSchema = z.object({
  period_name: z.string().trim().min(3).max(150),
  start_date: z.preprocess(emptyToUndef, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD').optional()),
});

export const listItemsQuery = z.object({
  /** Cari berdasarkan kode unik pada label fisik (langkah 3) atau nama */
  q: z.string().trim().max(100).optional(),
  state: z.enum(['BELUM', 'DITEMUKAN', 'TIDAK_DITEMUKAN']).optional(),
});

export const checkItemSchema = z
  .object({
    found: z.boolean({ required_error: 'Tandai ditemukan atau tidak' }),
    actual_location: z.preprocess(emptyToUndef, z.string().trim().max(100).optional()),
    actual_condition: z.enum(['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT']).optional(),
    note: z.preprocess(emptyToUndef, z.string().trim().max(1000).optional()),
  })
  .superRefine((d, ctx) => {
    if (!d.found && !d.note) ctx.addIssue({ code: 'custom', path: ['note'], message: 'Beri catatan untuk aset yang tidak ditemukan' });
  });

/** Catatan untuk aset yang dilewati (BR-41: penutupan butuh diperiksa ATAU diberi catatan) */
export const noteItemSchema = z.object({ note: z.string().trim().min(3).max(1000) });

export type ListItemsQuery = z.infer<typeof listItemsQuery>;
export type CheckItemInput = z.infer<typeof checkItemSchema>;
