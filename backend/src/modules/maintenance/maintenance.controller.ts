import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import type { ListScheduleQuery } from './maintenance.schema.js';
import * as service from './maintenance.service.js';

/** GET /maintenance-schedules  —  Daftar jadwal; due_state TERLAMBAT/SEGERA/TERJADWAL/NONAKTIF (FSD-2.14) */
export const getMaintenanceSchedules = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.list(req.query as unknown as ListScheduleQuery, page, perPage);
  paginated(res, rows, page, perPage, total);
});

/** POST /maintenance-schedules  —  Tambah jadwal (FSD-2.14) */
export const postMaintenanceSchedules = asyncHandler(async (req, res) =>
  created(res, await service.create(req.body, req.user!, req.ip), 'Jadwal pemeliharaan dibuat'),
);

/** GET /maintenance-schedules/:id */
export const getMaintenanceSchedulesById = asyncHandler(async (req, res) => ok(res, await service.get(req.params.id)));

/** PATCH /maintenance-schedules/:id  —  Ubah / nonaktifkan (FSD-2.14 AF-2) */
export const patchMaintenanceSchedulesById = asyncHandler(async (req, res) =>
  ok(res, await service.update(req.params.id, req.body, req.user!, req.ip), 'Jadwal pemeliharaan diperbarui'),
);

/** GET /maintenance-schedules/:id/logs  —  Riwayat pelaksanaan */
export const getMaintenanceSchedulesByIdLogs = asyncHandler(async (req, res) => ok(res, await service.listLogs(req.params.id)));

/** POST /maintenance-schedules/:id/logs  —  Catat pelaksanaan (FSD-2.14 langkah 4–6) */
export const postMaintenanceSchedulesByIdLogs = asyncHandler(async (req, res) =>
  created(res, await service.createLog(req.params.id, req.body, req.user!, req.ip), 'Pelaksanaan pemeliharaan tercatat'),
);
