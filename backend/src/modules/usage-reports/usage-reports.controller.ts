import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import type { ListUsageQuery } from './usage-reports.schema.js';
import * as service from './usage-reports.service.js';

/** GET /  —  Daftar laporan pemakaian (FSD-2.13). Sarpras/PHT semua, pengurus lain milik sendiri */
export const list = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.list(req.query as unknown as ListUsageQuery, req.user!, page, perPage);
  paginated(res, rows, page, perPage, total);
});

/** POST /  —  Kirim laporan pemakaian internal (FSD-2.13) */
export const create = asyncHandler(async (req, res) =>
  created(res, await service.create(req.body, req.user!, req.ip), 'Laporan pemakaian tercatat. Aset berstatus DIGUNAKAN'),
);

/** GET /:id  —  Detail laporan + daftar aset */
export const getById = asyncHandler(async (req, res) => ok(res, await service.get(req.params.id, req.user!)));

/** POST /:id/finish  —  Selesai pemakaian + kondisi aset (FSD-2.13 langkah 6, AF-2) */
export const postByIdFinish = asyncHandler(async (req, res) =>
  ok(res, await service.finish(req.params.id, req.body, req.user!, req.ip), 'Pemakaian selesai'),
);
