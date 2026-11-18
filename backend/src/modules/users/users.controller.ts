import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './users.service.js';

/** GET /  —  Daftar pengguna (FSD-2.4) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di users.schema.ts, logika di users.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.4)');
});

/** POST /  —  Buat akun + jabatan + password sementara (FSD-2.4) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di users.schema.ts, logika di users.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.4)');
});

/** GET /:id  —  Detail pengguna (FSD-2.4) */
export const getById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di users.schema.ts, logika di users.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.4)');
});

/** PATCH /:id  —  Ubah data / aktif-nonaktif (FSD-2.4) */
export const updateById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di users.schema.ts, logika di users.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.4)');
});

/** PATCH /:id/roles  —  Atur role tambahan (Admin/Pastor) (FSD-2.4) */
export const updateByIdRoles = asyncHandler(async (_req, _res) => {
  // TODO: validasi di users.schema.ts, logika di users.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.4)');
});

/** POST /:id/reset-password  —  Reset password oleh Admin (FSD-2.3) */
export const postByIdResetPassword = asyncHandler(async (_req, _res) => {
  // TODO: validasi di users.schema.ts, logika di users.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.3)');
});
