import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import { ok } from '../../lib/response.js';
import type { StatusQuery } from './public.schema.js';
import * as service from './public.service.js';
import * as settings from '../settings/settings.service.js';

/** GET /settings  —  Parameter publik (QRIS, WA) (FSD-2.45) */
export const getSettings = asyncHandler(async (_req, res) => ok(res, await settings.publicSettings()));

/** GET /settings/qris-image  —  Gambar QRIS KMK (FSD-2.43, 2.45) */
export const getQrisImage = asyncHandler(async (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(await settings.qrisImagePath());
});

/** GET /events  —  Kegiatan terbuka (FSD-2.30) */
export const getEvents = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.30)');
});

/** GET /donor-transparency  —  Transparansi donasi (FSD-2.42) */
export const getDonorTransparency = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.42)');
});

/** GET /status  —  Cek status (?code=&phone=) (FSD-2.46). Saat ini kode PJM; INT/PST/REG menyusul modulnya. */
export const getStatus = asyncHandler(async (req, res) => {
  const { code, phone } = req.query as unknown as StatusQuery;
  ok(res, await service.checkStatus(code, phone));
});

/** POST /status/cancel  —  Batalkan pendaftaran kegiatan (FSD-2.46) */
export const postStatusCancel = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.46)');
});
