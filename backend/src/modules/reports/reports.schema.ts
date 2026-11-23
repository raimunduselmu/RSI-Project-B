// FSD-2.19 Laporan Inventaris
import { z } from 'zod';

const ymdStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD');

export const REPORT_TYPES = ['INVENTARIS', 'PEMINJAMAN', 'PEMELIHARAAN', 'INSIDEN'] as const;

export const inventoryReportQuery = z.object({
  report_type: z.enum(REPORT_TYPES).default('INVENTARIS'),
  /** Periode kepengurusan (tabel periods). Diabaikan bila date_from/date_to diisi */
  period_id: z.coerce.number().int().positive().optional(),
  date_from: ymdStr.optional(),
  date_to: ymdStr.optional(),
  category_id: z.coerce.number().int().positive().optional(),
});

export const exportQuery = inventoryReportQuery.extend({ format: z.enum(['PDF', 'XLSX']).default('XLSX') });

export type InventoryReportQuery = z.infer<typeof inventoryReportQuery>;
export type ExportQuery = z.infer<typeof exportQuery>;
