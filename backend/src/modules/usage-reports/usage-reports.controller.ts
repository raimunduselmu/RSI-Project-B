import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './usage-reports.service.js';

/** GET /  —  Daftar laporan penggunaan internal (FSD-2.13) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di usage-reports.schema.ts, logika di usage-reports.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.13)');
});

/** POST /  —  Lapor penggunaan internal (sp_report_usage) (FSD-2.13) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di usage-reports.schema.ts, logika di usage-reports.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.13)');
});

/** POST /:id/finish  —  Selesaikan penggunaan (FSD-2.13) */
export const postByIdFinish = asyncHandler(async (_req, _res) => {
  // TODO: validasi di usage-reports.schema.ts, logika di usage-reports.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.13)');
});
