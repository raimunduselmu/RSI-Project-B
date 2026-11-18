import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './events.service.js';

/** GET /  —  Daftar kegiatan (FSD-2.29) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di events.schema.ts, logika di events.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.29)');
});

/** POST /  —  Buat kegiatan (FSD-2.29) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di events.schema.ts, logika di events.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.29)');
});

/** GET /:id  —  Detail kegiatan (FSD-2.29) */
export const getById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di events.schema.ts, logika di events.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.29)');
});

/** PATCH /:id  —  Ubah kegiatan (FSD-2.29) */
export const updateById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di events.schema.ts, logika di events.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.29)');
});

/** POST /:id/registrations  —  Daftar peserta publik (kode REG) (FSD-2.30) */
export const postByIdRegistrations = asyncHandler(async (_req, _res) => {
  // TODO: validasi di events.schema.ts, logika di events.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.30)');
});

/** GET /:id/registrations  —  Daftar peserta (FSD-2.30) */
export const getByIdRegistrations = asyncHandler(async (_req, _res) => {
  // TODO: validasi di events.schema.ts, logika di events.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.30)');
});

/** GET /:id/report  —  Laporan kegiatan (FSD-2.31) */
export const getByIdReport = asyncHandler(async (_req, _res) => {
  // TODO: validasi di events.schema.ts, logika di events.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.31)');
});
