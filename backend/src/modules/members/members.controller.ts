import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './members.service.js';

/** GET /  —  Daftar umat (FSD-2.23) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di members.schema.ts, logika di members.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.23)');
});

/** POST /  —  Tambah umat (FSD-2.23) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di members.schema.ts, logika di members.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.23)');
});

/** GET /:id  —  Detail umat (FSD-2.23) */
export const getById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di members.schema.ts, logika di members.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.23)');
});

/** PATCH /:id  —  Ubah umat (FSD-2.23) */
export const updateById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di members.schema.ts, logika di members.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.23)');
});

/** GET /:id/records  —  Riwayat pelayanan & sakramen (FSD-2.24) */
export const getByIdRecords = asyncHandler(async (_req, _res) => {
  // TODO: validasi di members.schema.ts, logika di members.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.24)');
});

/** POST /:id/records  —  Tambah riwayat (append-only) (FSD-2.24) */
export const postByIdRecords = asyncHandler(async (_req, _res) => {
  // TODO: validasi di members.schema.ts, logika di members.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.24)');
});
