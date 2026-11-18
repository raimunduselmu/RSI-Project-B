import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './donations.service.js';

/** GET /  —  Daftar donasi (FSD-2.42) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di donations.schema.ts, logika di donations.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.42)');
});

/** POST /  —  Catat donasi (sp_record_donation) (FSD-2.42) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di donations.schema.ts, logika di donations.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.42)');
});
