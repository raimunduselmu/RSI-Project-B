// FSD-2.23: Controller modul Keumatan
// Controller hanya menangani request, memanggil service,
// dan membentuk response sesuai TSD 3.1.

import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import { created, ok, paginated } from '../../lib/response.js';
import type { ListMembersQuery } from './members.schema.js';
import * as service from './members.service.js';

/**
 * GET /members
 *
 * FSD-2.23:
 * Daftar umat, pencarian, filter, dan paginasi.
 */
export const list = asyncHandler(async (req, res) => {
  const filters = req.query as unknown as ListMembersQuery;

  const result = await service.listMembers(filters);

  return paginated(
    res,
    result.data,
    filters.page,
    filters.per_page,
    result.total,
  );
});


/** POST /members — FSD-2.23 */
export const create = asyncHandler(async (req, res) => {
  const member = await service.createMember(
    req.body,
    req.user!,
    req.ip,
  );

  return created(
    res,
    member,
    'Data umat berhasil ditambahkan',
  );
});

// ==================================================
// FSD-2.23: Detail Data Umat
// GET /members/:id
// ==================================================

export const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const member = await service.getMemberById(id);

  return ok(
    res,
    member,
    'Detail umat berhasil diperoleh',
  );
});

/** PATCH /members/:id — FSD-2.23 */
export const updateById = asyncHandler(async (_req, _res) => {
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.23)');
});

/** GET /members/:id/records — FSD-2.24 */
export const getByIdRecords = asyncHandler(async (_req, _res) => {
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.24)');
});

/** POST /members/:id/records — FSD-2.24 */
export const postByIdRecords = asyncHandler(async (_req, _res) => {
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.24)');
});