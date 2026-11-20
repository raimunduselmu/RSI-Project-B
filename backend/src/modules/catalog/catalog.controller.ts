import { asyncHandler } from '../../lib/asyncHandler.js';
import { created, ok } from '../../lib/response.js';
import * as service from './catalog.service.js';

export const listCategories = asyncHandler(async (_req, res) => ok(res, await service.listCategories()));
export const createCategory = asyncHandler(async (req, res) => created(res, await service.createCategory(req.body)));
export const updateCategory = asyncHandler(async (req, res) => ok(res, await service.updateCategory(Number(req.params.id), req.body)));

/** Publik hanya melihat ruangan aktif; pengurus dapat ?all=1 */
export const listRooms = asyncHandler(async (req, res) => ok(res, await service.listRooms(!!req.user && req.query.all === '1')));
export const createRoom = asyncHandler(async (req, res) => created(res, await service.createRoom(req.body)));
export const updateRoom = asyncHandler(async (req, res) => ok(res, await service.updateRoom(Number(req.params.id), req.body)));
