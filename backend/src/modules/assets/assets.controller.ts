import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import { resolveFile, saveFile } from '../../lib/storage.js';
import * as service from './assets.service.js';
import type { ListAssetQuery } from './assets.schema.js';

/** Publik melihat field terbatas; pengurus (login) melihat semua field (TSD 3.2) */
export const list = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.list(req.query as unknown as ListAssetQuery, !!req.user, page, perPage);
  paginated(res, rows, page, perPage, total);
});

export const get = asyncHandler(async (req, res) => ok(res, await service.get(req.params.id, !!req.user)));

export const codePreview = asyncHandler(async (req, res) => ok(res, await service.previewCode(Number(req.query.category_id))));

export const create = asyncHandler(async (req, res) => {
  const photo = req.file ? await saveFile(req.file.buffer, req.file.originalname, 'assets') : undefined;
  const a = await service.create(req.body, req.user!, req.ip, photo);
  created(res, await service.get(a.asset_id, true), `Aset terdaftar dengan kode ${a.asset_code}`);
});

export const update = asyncHandler(async (req, res) => {
  const photo = req.file ? await saveFile(req.file.buffer, req.file.originalname, 'assets') : undefined;
  const a = await service.update(req.params.id, req.body, req.user!, req.ip, photo);
  ok(res, await service.get(a.asset_id, true), 'Data aset diperbarui');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user!, req.ip);
  ok(res, null, 'Aset dihapus');
});

export const histories = asyncHandler(async (req, res) => ok(res, await service.histories(req.params.id)));

export const photo = asyncHandler(async (req, res) => {
  res.sendFile(resolveFile(await service.photoPath(req.params.id)));
});
