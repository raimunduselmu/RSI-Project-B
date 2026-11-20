import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import { ok } from '../../lib/response.js';
import * as service from './dashboard.service.js';

/** GET /  —  Ringkasan dashboard per role (FSD-2.40) */
export const list = asyncHandler(async (req, res) => ok(res, await service.summary(req.user!)));

/** GET /export  —  Ekspor laporan (FSD-2.41) */
export const getExport = asyncHandler(async (_req, _res) => {
  throw new AppError('ERR-SYS-02', 'Ekspor laporan belum diimplementasikan (FSD-2.41)');
});
