import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './organization.service.js';

/** GET /periods  —  Daftar periode (FSD-2.25) */
export const getPeriods = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.25)');
});

/** POST /periods  —  Buat periode (FSD-2.25) */
export const postPeriods = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.25)');
});

/** POST /periods/:id/archive  —  Arsipkan periode + cabut role (FSD-2.26) */
export const postPeriodsByIdArchive = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.26)');
});

/** GET /officers  —  Daftar pengurus (FSD-2.25) */
export const getOfficers = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.25)');
});

/** POST /officers  —  Tetapkan pengurus + beri role (FSD-2.25) */
export const postOfficers = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.25)');
});

/** PATCH /officers/:id  —  Ubah/akhiri jabatan (FSD-2.25) */
export const updateOfficersById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.25)');
});

/** GET /handovers  —  Daftar serah terima (FSD-2.26) */
export const getHandovers = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.26)');
});

/** POST /handovers  —  Ajukan serah terima (FSD-2.26) */
export const postHandovers = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.26)');
});

/** POST /handovers/:id/approve  —  Setujui serah terima (FSD-2.26) */
export const postHandoversByIdApprove = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.26)');
});

/** POST /handovers/:id/reject  —  Tolak serah terima (FSD-2.26) */
export const postHandoversByIdReject = asyncHandler(async (_req, _res) => {
  // TODO: validasi di organization.schema.ts, logika di organization.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.26)');
});
