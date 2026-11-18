import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './stocktakes.service.js';

/** GET /  —  Daftar stock opname (FSD-2.16) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di stocktakes.schema.ts, logika di stocktakes.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.16)');
});

/** POST /  —  Buka periode opname (FSD-2.16) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di stocktakes.schema.ts, logika di stocktakes.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.16)');
});

/** PATCH /:id/items/:itemId  —  Catat hasil pemeriksaan item (FSD-2.16) */
export const updateByIdItemsByItemId = asyncHandler(async (_req, _res) => {
  // TODO: validasi di stocktakes.schema.ts, logika di stocktakes.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.16)');
});

/** POST /:id/close  —  Tutup opname (sp_close_stocktake) (FSD-2.16) */
export const postByIdClose = asyncHandler(async (_req, _res) => {
  // TODO: validasi di stocktakes.schema.ts, logika di stocktakes.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.16)');
});
