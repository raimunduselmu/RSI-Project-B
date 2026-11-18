import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './dashboard.service.js';

/** GET /  —  Ringkasan dashboard per role (FSD-2.40) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di dashboard.schema.ts, logika di dashboard.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.40)');
});

/** GET /export  —  Ekspor laporan (FSD-2.41) */
export const getExport = asyncHandler(async (_req, _res) => {
  // TODO: validasi di dashboard.schema.ts, logika di dashboard.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.41)');
});
