import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './assets.service.js';

/** GET /  —  Daftar aset (FSD-2.5) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di assets.schema.ts, logika di assets.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.5)');
});

/** POST /  —  Registrasi aset (kode unik otomatis) (FSD-2.6) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di assets.schema.ts, logika di assets.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.6)');
});

/** GET /:id  —  Detail aset (FSD-2.7) */
export const getById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di assets.schema.ts, logika di assets.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.7)');
});

/** PATCH /:id  —  Ubah aset (FSD-2.7) */
export const updateById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di assets.schema.ts, logika di assets.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.7)');
});

/** DELETE /:id  —  Soft delete aset (FSD-2.7) */
export const removeById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di assets.schema.ts, logika di assets.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.7)');
});

/** GET /:id/histories  —  Riwayat aset (FSD-2.8) */
export const getByIdHistories = asyncHandler(async (_req, _res) => {
  // TODO: validasi di assets.schema.ts, logika di assets.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.8)');
});

/** GET /categories  —  Kategori aset (FSD-2.5) */
export const getCategories = asyncHandler(async (_req, _res) => {
  // TODO: validasi di assets.schema.ts, logika di assets.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.5)');
});

/** GET /rooms  —  Daftar ruangan (FSD-2.5) */
export const getRooms = asyncHandler(async (_req, _res) => {
  // TODO: validasi di assets.schema.ts, logika di assets.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.5)');
});
