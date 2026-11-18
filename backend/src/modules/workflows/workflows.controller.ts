import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './workflows.service.js';

/** GET /  —  Daftar workflow (read-only) (FSD-2.39) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di workflows.schema.ts, logika di workflows.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.39)');
});

/** GET /:id  —  Detail langkah workflow (FSD-2.39) */
export const getById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di workflows.schema.ts, logika di workflows.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.39)');
});
