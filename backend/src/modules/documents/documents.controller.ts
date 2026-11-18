import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './documents.service.js';

/** GET /  —  Daftar dokumen (FSD-2.38) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di documents.schema.ts, logika di documents.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.38)');
});

/** POST /  —  Unggah dokumen (FSD-2.38) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di documents.schema.ts, logika di documents.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.38)');
});

/** GET /:id/download  —  Unduh dokumen (FSD-2.38) */
export const getByIdDownload = asyncHandler(async (_req, _res) => {
  // TODO: validasi di documents.schema.ts, logika di documents.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.38)');
});
