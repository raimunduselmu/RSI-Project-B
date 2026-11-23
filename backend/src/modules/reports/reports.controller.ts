import { asyncHandler } from '../../lib/asyncHandler.js';
import { ok } from '../../lib/response.js';
import type { ExportQuery, InventoryReportQuery } from './reports.schema.js';
import * as service from './reports.service.js';

/** GET /inventory  —  Laporan inventaris/peminjaman/pemeliharaan/insiden (FSD-2.19) */
export const getInventory = asyncHandler(async (req, res) => ok(res, await service.inventoryReport(req.query as unknown as InventoryReportQuery)));

/** GET /inventory/export  —  Unduh PDF/XLSX (Sarpras/Admin, BR-44) */
export const getInventoryExport = asyncHandler(async (req, res) => {
  const f = await service.exportReport(req.query as unknown as ExportQuery, req.user!, req.ip);
  res.setHeader('Content-Type', f.mime);
  res.setHeader('Content-Disposition', `attachment; filename="${f.filename}"`);
  res.send(f.file);
});
