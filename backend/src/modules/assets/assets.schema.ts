// FSD-2.5 (registrasi & ubah aset), FSD-2.7 (cari aset), FSD-2.8 (riwayat)
import { z } from 'zod';

/** Field multipart datang sebagai string: '' → null, 'true'/'false' → boolean */
const emptyToNull = (v: unknown) => (v === '' ? null : v);
const boolish = z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean());
const optText = (max: number) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional());

export const ASSET_CONDITIONS = ['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT'] as const;
export const ASSET_STATUSES = ['TERSEDIA', 'DIPINJAM', 'DIGUNAKAN', 'PEMELIHARAAN', 'HILANG', 'NONAKTIF'] as const;
/** Status yang boleh diubah manual; DIPINJAM/DIGUNAKAN hanya lewat proses peminjaman/pemakaian */
export const MANUAL_STATUSES = ['TERSEDIA', 'PEMELIHARAAN', 'HILANG', 'NONAKTIF'] as const;
export const SOURCE_TYPES = ['KAS', 'DONASI', 'HIBAH'] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD');

const base = z.object({
  asset_name: z.string().trim().min(1).max(150),
  category_id: z.coerce.number().int().positive(),
  location_text: z.string().trim().min(1).max(100),
  asset_condition: z.enum(ASSET_CONDITIONS),
  is_lendable: boolish,
  source_type: z.enum(SOURCE_TYPES),
  donor_name: optText(150),
  acquired_date: isoDate,
  acquisition_value: z.preprocess(emptyToNull, z.coerce.number().nonnegative().max(9_999_999_999_999).nullable().optional()),
  description: optText(2000),
});

const notFuture = (d?: string) => !d || d <= new Date().toISOString().slice(0, 10);

export const createAssetSchema = base
  .extend({ asset_condition: z.enum(ASSET_CONDITIONS).default('BAIK'), is_lendable: boolish.default(true) })
  .refine((d) => d.source_type === 'KAS' || !!d.donor_name, { path: ['donor_name'], message: 'Wajib diisi bila sumber DONASI/HIBAH' })
  .refine((d) => notFuture(d.acquired_date), { path: ['acquired_date'], message: 'Tanggal perolehan tidak boleh di masa depan' });

export const updateAssetSchema = base
  .partial()
  .extend({ status: z.enum(MANUAL_STATUSES).optional() })
  .refine((d) => notFuture(d.acquired_date), { path: ['acquired_date'], message: 'Tanggal perolehan tidak boleh di masa depan' });

export const listAssetQuery = z.object({
  q: z.string().trim().min(2, 'Kata kunci minimal 2 karakter').max(100).optional(),
  category_id: z.coerce.number().int().positive().optional(),
  status: z.enum(ASSET_STATUSES).optional(),
  page: z.coerce.number().int().positive().optional(),
  per_page: z.coerce.number().int().positive().optional(),
});

export const codePreviewQuery = z.object({ category_id: z.coerce.number().int().positive() });

/** :id boleh UUID atau kode aset (contoh ELEC-120326) */
export const assetKeyParam = z.object({ id: z.string().trim().min(3).max(50) });

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type ListAssetQuery = z.infer<typeof listAssetQuery>;

/* ---------- FSD-2.6 Cetak label & FSD-2.16 Dokumen aset (gelombang 4) ---------- */
export const labelSchema = z.object({
  /** UUID atau kode aset; 1–200 per sekali cetak */
  asset_ids: z.array(z.string().trim().min(3).max(50)).min(1, 'Pilih minimal satu aset').max(200),
  label_size: z.enum(['kecil', 'sedang']).default('sedang'),
});

export const DOC_TYPES = ['NOTA', 'GARANSI', 'BERITA_ACARA', 'FOTO', 'LAINNYA'] as const;
export const uploadDocumentSchema = z.object({
  doc_type: z.enum(DOC_TYPES, { errorMap: () => ({ message: 'Pilih jenis dokumen' }) }),
  doc_title: z.string().trim().min(3).max(150),
});
export const documentParam = z.object({ id: z.string().trim().min(3).max(50), docId: z.string().uuid('ID dokumen tidak valid') });

export type LabelInput = z.infer<typeof labelSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
