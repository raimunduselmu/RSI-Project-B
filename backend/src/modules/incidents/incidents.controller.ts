import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import type { ListIncidentQuery } from './incidents.schema.js';
import * as service from './incidents.service.js';

/** GET /  —  Daftar laporan (FSD-2.15). Sarpras/PHT semua, pengurus lain milik sendiri */
export const list = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.list(req.query as unknown as ListIncidentQuery, req.user!, page, perPage);
  paginated(res, rows, page, perPage, total);
});

/** GET /responsible-suggestion?asset_id=  —  Penanggung jawab bawaan (BR-36) */
export const getResponsibleSuggestion = asyncHandler(async (req, res) => ok(res, await service.suggestResponsible(String(req.query.asset_id))));

/** POST /  —  Lapor kehilangan/kerusakan (FSD-2.15) */
export const create = asyncHandler(async (req, res) =>
  created(res, await service.create(req.body, req.user!, req.ip), 'Laporan tersimpan. Sarpras sudah diberi tahu'),
);

/** GET /:id */
export const getById = asyncHandler(async (req, res) => ok(res, await service.get(req.params.id, req.user!)));

/** PATCH /:id  —  Tindak lanjut & ubah status (Sarpras, FSD-2.15) */
export const updateById = asyncHandler(async (req, res) =>
  ok(res, await service.update(req.params.id, req.body, req.user!, req.ip), 'Laporan diperbarui'),
);
