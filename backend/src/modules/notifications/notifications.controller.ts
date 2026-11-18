import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './notifications.service.js';

/** GET /  —  Notifikasi aplikasi milik sendiri (FSD-2.21) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di notifications.schema.ts, logika di notifications.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.21)');
});

/** PATCH /:id/read  —  Tandai dibaca (FSD-2.21) */
export const updateByIdRead = asyncHandler(async (_req, _res) => {
  // TODO: validasi di notifications.schema.ts, logika di notifications.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.21)');
});
