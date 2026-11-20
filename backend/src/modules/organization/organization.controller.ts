import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import { created, ok } from '../../lib/response.js';
import type { ListOfficerQuery } from './organization.schema.js';
import * as service from './organization.service.js';

/* Periode (FSD-2.25) */
export const getPeriods = asyncHandler(async (_req, res) => ok(res, await service.listPeriods()));
export const getActivePeriod = asyncHandler(async (_req, res) => ok(res, await service.activePeriod()));
export const postPeriods = asyncHandler(async (req, res) => created(res, await service.createPeriod(req.body, req.user!, req.ip), 'Periode dibuat'));
export const updatePeriodsById = asyncHandler(async (req, res) => ok(res, await service.updatePeriod(Number(req.params.id), req.body, req.user!, req.ip)));
export const postPeriodsByIdArchive = asyncHandler(async (req, res) =>
  ok(res, await service.archivePeriod(Number(req.params.id), req.body.confirm_name, req.user!, req.ip), 'Periode diarsipkan. Data periode ini sekarang hanya bisa dibaca'),
);
export const postPeriodsByIdCopyStructure = asyncHandler(async (req, res) =>
  created(res, await service.copyStructure(Number(req.params.id), req.body.from_period_id, req.user!, req.ip), 'Struktur divisi & jabatan disalin'),
);

/* Divisi & jabatan (FSD-2.25) */
export const getDivisions = asyncHandler(async (req, res) => ok(res, await service.listDivisions(req.query.period_id ? Number(req.query.period_id) : undefined)));
export const postDivisions = asyncHandler(async (req, res) => created(res, await service.createDivision(req.body, req.user!, req.ip), 'Divisi ditambahkan'));
export const updateDivisionsById = asyncHandler(async (req, res) => ok(res, await service.updateDivision(Number(req.params.id), req.body, req.user!, req.ip)));
export const postDivisionsByIdPositions = asyncHandler(async (req, res) =>
  created(res, await service.createPosition(Number(req.params.id), req.body, req.user!, req.ip), 'Jabatan ditambahkan'),
);

/* Pengurus (FSD-2.25) */
export const getOfficers = asyncHandler(async (req, res) => ok(res, await service.listOfficers(req.query as unknown as ListOfficerQuery)));
export const getOfficersById = asyncHandler(async (req, res) => ok(res, await service.getOfficer(req.params.id)));
export const postOfficers = asyncHandler(async (req, res) => created(res, await service.createOfficer(req.body, req.user!, req.ip), 'Pengurus ditetapkan'));
export const updateOfficersById = asyncHandler(async (req, res) => ok(res, await service.updateOfficer(req.params.id, req.body, req.user!, req.ip)));

/* Serah terima (FSD-2.26) — menyusul, lihat docs/BACKLOG.md */
const handoverTodo = asyncHandler(async () => {
  throw new AppError('ERR-SYS-02', 'Serah terima jabatan belum diimplementasikan (FSD-2.26)');
});
export const getHandovers = handoverTodo;
export const postHandovers = handoverTodo;
export const postHandoversByIdApprove = handoverTodo;
export const postHandoversByIdReject = handoverTodo;
