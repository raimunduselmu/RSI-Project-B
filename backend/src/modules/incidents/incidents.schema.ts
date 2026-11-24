// FSD-2.15 Kelola Kehilangan & Kerusakan Aset
import { z } from 'zod';
import { todayWib } from '../../lib/time.js';

const emptyToUndef = (v: unknown) => (v === '' || v === null ? undefined : v);

export const idParam = z.object({ id: z.string().uuid('ID laporan tidak valid') });

export const listIncidentQuery = z.object({
  status: z.enum(['DILAPORKAN', 'DIPROSES', 'SELESAI']).optional(),
  incident_type: z.enum(['HILANG', 'RUSAK']).optional(),
  asset_id: z.string().trim().min(3).max(50).optional(),
  open: z.enum(['true', 'false']).optional(), // true = DILAPORKAN + DIPROSES
});

export const suggestQuery = z.object({ asset_id: z.string().trim().min(3).max(50) });

export const createIncidentSchema = z.object({
  asset_id: z.string().trim().min(3).max(50), // UUID atau kode aset
  incident_type: z.enum(['HILANG', 'RUSAK'], { errorMap: () => ({ message: 'Pilih HILANG atau RUSAK' }) }),
  occurred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  description: z.string().trim().min(5).max(2000),
  /** Kosong → diisi peminjam/pengguna terakhir (BR-36) */
  responsible_name: z.preprocess(emptyToUndef, z.string().trim().max(150).optional()),
});

export const updateIncidentSchema = z
  .object({
    status: z.enum(['DIPROSES', 'SELESAI']).optional(),
    follow_up: z.preprocess(emptyToUndef, z.string().trim().max(2000).optional()),
    responsible_name: z.preprocess(emptyToUndef, z.string().trim().max(150).optional()),
    /** Saat SELESAI: status aset sesudahnya (AF-2: hilang ditemukan → TERSEDIA). Kosong = tidak diubah */
    asset_status_after: z.enum(['TERSEDIA', 'PEMELIHARAAN', 'HILANG', 'NONAKTIF']).optional(),
    asset_condition_after: z.enum(['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT']).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Tidak ada data yang diubah' })
  .superRefine((d, ctx) => {
    if ((d.asset_status_after || d.asset_condition_after) && d.status !== 'SELESAI') {
      ctx.addIssue({ code: 'custom', path: ['asset_status_after'], message: 'Status/kondisi aset hanya diubah saat laporan diselesaikan' });
    }
    if (d.status === 'SELESAI' && !d.follow_up) ctx.addIssue({ code: 'custom', path: ['follow_up'], message: 'Isi tindak lanjut sebelum menyelesaikan laporan' });
  });

/** Dipakai di service: tanggal kejadian tidak boleh di masa depan (EF-2 → ERR-VAL-04) */
export const isFutureDate = (d: string) => d > todayWib();

export type ListIncidentQuery = z.infer<typeof listIncidentQuery>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
