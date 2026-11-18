import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './liturgy.service.js';

/** GET /liturgy-schedules  —  Jadwal liturgi (FSD-2.27) */
export const getLiturgySchedules = asyncHandler(async (_req, _res) => {
  // TODO: validasi di liturgy.schema.ts, logika di liturgy.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.27)');
});

/** POST /liturgy-schedules  —  Buat jadwal liturgi (FSD-2.27) */
export const postLiturgySchedules = asyncHandler(async (_req, _res) => {
  // TODO: validasi di liturgy.schema.ts, logika di liturgy.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.27)');
});

/** GET /liturgy-schedules/:id/assignments  —  Petugas liturgi (FSD-2.28) */
export const getLiturgySchedulesByIdAssignments = asyncHandler(async (_req, _res) => {
  // TODO: validasi di liturgy.schema.ts, logika di liturgy.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.28)');
});

/** POST /liturgy-schedules/:id/assignments  —  Tugaskan petugas (FSD-2.28) */
export const postLiturgySchedulesByIdAssignments = asyncHandler(async (_req, _res) => {
  // TODO: validasi di liturgy.schema.ts, logika di liturgy.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.28)');
});

/** PATCH /liturgy-assignments/:id/confirmation  —  Catat konfirmasi petugas (FSD-2.28) */
export const updateLiturgyAssignmentsByIdConfirmation = asyncHandler(async (_req, _res) => {
  // TODO: validasi di liturgy.schema.ts, logika di liturgy.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.28)');
});
