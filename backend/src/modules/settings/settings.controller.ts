import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './settings.service.js';

/** GET /  —  Daftar parameter (FSD-2.45) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di settings.schema.ts, logika di settings.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.45)');
});

/** PATCH /:key  —  Ubah parameter (QRIS: multipart) (FSD-2.45) */
export const updateByKey = asyncHandler(async (_req, _res) => {
  // TODO: validasi di settings.schema.ts, logika di settings.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.45)');
});
