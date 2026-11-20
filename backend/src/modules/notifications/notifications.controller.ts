import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { ok } from '../../lib/response.js';
import * as service from './notifications.service.js';

/** GET /  —  Notifikasi aplikasi milik sendiri; meta.unread = jumlah belum dibaca (FSD-2.21) */
export const list = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total, unread } = await service.listMine(req.user!.id, req.query.unread === 'true', page, perPage);
  ok(res, rows, undefined, { current_page: page, per_page: perPage, total, last_page: Math.max(1, Math.ceil(total / perPage)), unread });
});

/** PATCH /:id/read  —  Tandai dibaca (FSD-2.21) */
export const updateByIdRead = asyncHandler(async (req, res) => {
  await service.markRead(req.params.id, req.user!.id);
  ok(res, null, 'Notifikasi ditandai dibaca');
});

/** POST /read-all  —  Tandai semua dibaca (FSD-2.21) */
export const postReadAll = asyncHandler(async (req, res) => {
  await service.markAllRead(req.user!.id);
  ok(res, null, 'Semua notifikasi ditandai dibaca');
});
