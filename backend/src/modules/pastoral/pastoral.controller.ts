import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './pastoral.service.js';

/** GET /mass-intentions  —  Daftar intensi (FSD-2.36) */
export const getMassIntentions = asyncHandler(async (_req, _res) => {
  // TODO: validasi di pastoral.schema.ts, logika di pastoral.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.36)');
});

/** POST /mass-intentions  —  Ajukan intensi publik (kode INT) (FSD-2.36) */
export const postMassIntentions = asyncHandler(async (_req, _res) => {
  // TODO: validasi di pastoral.schema.ts, logika di pastoral.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.36)');
});

/** PATCH /mass-intentions/:id  —  Konfirmasi/tolak intensi (FSD-2.36) */
export const updateMassIntentionsById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di pastoral.schema.ts, logika di pastoral.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.36)');
});

/** GET /pastoral-cares  —  Daftar layanan pastoral (FSD-2.37) */
export const getPastoralCares = asyncHandler(async (_req, _res) => {
  // TODO: validasi di pastoral.schema.ts, logika di pastoral.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.37)');
});

/** POST /pastoral-cares  —  Tambah layanan pastoral (FSD-2.37) */
export const postPastoralCares = asyncHandler(async (_req, _res) => {
  // TODO: validasi di pastoral.schema.ts, logika di pastoral.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.37)');
});

/** POST /pastoral-cares/requests  —  Permintaan pendampingan publik (kode PST) (FSD-2.37) */
export const postPastoralCaresRequests = asyncHandler(async (_req, _res) => {
  // TODO: validasi di pastoral.schema.ts, logika di pastoral.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.37)');
});
