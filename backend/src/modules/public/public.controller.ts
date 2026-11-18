import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './public.service.js';

/** GET /settings  —  Parameter publik (QRIS, WA) (FSD-2.45) */
export const getSettings = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.45)');
});

/** GET /events  —  Kegiatan terbuka (FSD-2.30) */
export const getEvents = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.30)');
});

/** GET /calendar  —  Kalender (label Terpakai) (FSD-2.9) */
export const getCalendar = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.9)');
});

/** GET /donor-transparency  —  Transparansi donasi (FSD-2.42) */
export const getDonorTransparency = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.42)');
});

/** GET /status  —  Cek status (?code=&phone=) (FSD-2.46) */
export const getStatus = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.46)');
});

/** POST /status/cancel  —  Batalkan pendaftaran kegiatan (FSD-2.46) */
export const postStatusCancel = asyncHandler(async (_req, _res) => {
  // TODO: validasi di public.schema.ts, logika di public.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.46)');
});
