import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './incidents.service.js';

/** GET /  —  Daftar insiden (FSD-2.15) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di incidents.schema.ts, logika di incidents.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.15)');
});

/** POST /  —  Laporkan kerusakan/kehilangan (FSD-2.15) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di incidents.schema.ts, logika di incidents.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.15)');
});

/** PATCH /:id  —  Tindak lanjut insiden (FSD-2.15) */
export const updateById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di incidents.schema.ts, logika di incidents.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.15)');
});
