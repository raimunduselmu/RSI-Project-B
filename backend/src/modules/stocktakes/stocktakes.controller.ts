import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import type { ListItemsQuery } from './stocktakes.schema.js';
import * as service from './stocktakes.service.js';

/** GET /  —  Daftar periode pemeriksaan + progres (FSD-2.17) */
export const list = asyncHandler(async (_req, res) => ok(res, await service.list()));

/** POST /  —  Buka periode pemeriksaan (FSD-2.17, BR-40) */
export const create = asyncHandler(async (req, res) => created(res, await service.open(req.body, req.user!, req.ip), 'Periode pemeriksaan dibuka'));

/** GET /:id */
export const getById = asyncHandler(async (req, res) => ok(res, await service.get(req.params.id)));

/** GET /:id/items  —  Daftar aset yang diperiksa; q = kode label */
export const getByIdItems = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.listItems(req.params.id, req.query as unknown as ListItemsQuery, page, perPage);
  paginated(res, rows, page, perPage, total);
});

/** PATCH /:id/items/:itemId  —  Catat hasil pemeriksaan satu aset (FSD-2.17 langkah 4) */
export const updateByIdItemsByItemId = asyncHandler(async (req, res) =>
  ok(res, await service.checkItem(req.params.id, req.params.itemId, req.body, req.user!, req.ip), 'Hasil pemeriksaan tersimpan'),
);

/** PATCH /:id/items/:itemId/note  —  Beri catatan tanpa memeriksa (BR-41) */
export const updateByIdItemsByItemIdNote = asyncHandler(async (req, res) =>
  ok(res, await service.noteItem(req.params.id, req.params.itemId, req.body.note, req.user!, req.ip), 'Catatan tersimpan'),
);

/** POST /:id/close  —  Tutup periode (FSD-2.17, sp_close_stocktake) */
export const postByIdClose = asyncHandler(async (req, res) => ok(res, await service.close(req.params.id, req.user!, req.ip), 'Periode pemeriksaan ditutup'));
