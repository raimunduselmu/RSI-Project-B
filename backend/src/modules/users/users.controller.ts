import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import type { ListUserQuery } from './users.schema.js';
import * as service from './users.service.js';

/** GET /  —  Daftar pengguna (FSD-2.4) */
export const list = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.listUsers(req.query as unknown as ListUserQuery, page, perPage);
  paginated(res, rows, page, perPage, total);
});

/** POST /  —  Buat akun + role + password sementara (FSD-2.4). Password hanya tampil sekali. */
export const create = asyncHandler(async (req, res) =>
  created(res, await service.createUser(req.body, req.user!, req.ip), 'Akun dibuat. Catat password sementara, hanya tampil sekali'),
);

/** GET /:id  —  Detail pengguna (FSD-2.4) */
export const getById = asyncHandler(async (req, res) => ok(res, await service.getUser(req.params.id)));

/** PATCH /:id  —  Ubah data / aktif-nonaktif (FSD-2.4) */
export const updateById = asyncHandler(async (req, res) => ok(res, await service.updateUser(req.params.id, req.body, req.user!, req.ip), 'Data pengguna diperbarui'));

/** PATCH /:id/roles  —  Ganti daftar role (FSD-2.4) */
export const updateByIdRoles = asyncHandler(async (req, res) => ok(res, await service.setRoles(req.params.id, req.body.roles, req.user!, req.ip), 'Role diperbarui'));

/** POST /:id/reset-password  —  Password sementara baru (FSD-2.3) */
export const postByIdResetPassword = asyncHandler(async (req, res) =>
  ok(res, await service.resetPassword(req.params.id, req.user!, req.ip), 'Password direset. Catat password sementara, hanya tampil sekali'),
);
