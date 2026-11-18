import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './maintenance.service.js';

/** GET /maintenance-schedules  —  Jadwal pemeliharaan (FSD-2.14) */
export const getMaintenanceSchedules = asyncHandler(async (_req, _res) => {
  // TODO: validasi di maintenance.schema.ts, logika di maintenance.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.14)');
});

/** POST /maintenance-schedules  —  Buat jadwal (FSD-2.14) */
export const postMaintenanceSchedules = asyncHandler(async (_req, _res) => {
  // TODO: validasi di maintenance.schema.ts, logika di maintenance.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.14)');
});

/** POST /maintenance-schedules/:id/logs  —  Catat pemeliharaan (FSD-2.14) */
export const postMaintenanceSchedulesByIdLogs = asyncHandler(async (_req, _res) => {
  // TODO: validasi di maintenance.schema.ts, logika di maintenance.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.14)');
});
