// FSD-2.19 Laporan Inventaris
import { z } from 'zod';
import { checkDateRange, ymdStr } from '../../lib/dateRange.js';

export const REPORT_TYPES = ['INVENTARIS', 'PEMINJAMAN', 'PEMELIHARAAN', 'INSIDEN'] as const;

const baseReportQuery = z.object({
  report_type: z.enum(REPORT_TYPES).default('INVENTARIS'),
  /** Periode kepengurusan (tabel periods). Diabaikan bila date_from/date_to diisi */
  period_id: z.coerce.number().int().positive().optional(),
  date_from: ymdStr.optional(),
  date_to: ymdStr.optional(),
  category_id: z.coerce.number().int().positive().optional(),
});

export const inventoryReportQuery = baseReportQuery.superRefine(checkDateRange);
export const exportQuery = baseReportQuery.extend({ format: z.enum(['PDF', 'XLSX']).default('XLSX') }).superRefine(checkDateRange);

export type InventoryReportQuery = z.infer<typeof inventoryReportQuery>;
export type ExportQuery = z.infer<typeof exportQuery>;
