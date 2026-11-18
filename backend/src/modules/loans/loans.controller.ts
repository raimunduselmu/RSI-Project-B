import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './loans.service.js';

/** POST /  —  Ajukan peminjaman publik (kode PJM, email wajib) (FSD-2.10) */
export const create = asyncHandler(async (_req, _res) => {
  // TODO: validasi di loans.schema.ts, logika di loans.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.10)');
});

/** GET /  —  Daftar pengajuan (FSD-2.11) */
export const list = asyncHandler(async (_req, _res) => {
  // TODO: validasi di loans.schema.ts, logika di loans.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.11)');
});

/** GET /:id  —  Detail pengajuan (FSD-2.11) */
export const getById = asyncHandler(async (_req, _res) => {
  // TODO: validasi di loans.schema.ts, logika di loans.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.11)');
});

/** POST /:id/approve  —  Setujui (sp_approve_loan) (FSD-2.11) */
export const postByIdApprove = asyncHandler(async (_req, _res) => {
  // TODO: validasi di loans.schema.ts, logika di loans.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.11)');
});

/** POST /:id/reject  —  Tolak, alasan wajib (FSD-2.11) */
export const postByIdReject = asyncHandler(async (_req, _res) => {
  // TODO: validasi di loans.schema.ts, logika di loans.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.11)');
});

/** POST /:id/pickup  —  Catat pengambilan (sp_handover_loan) (FSD-2.12) */
export const postByIdPickup = asyncHandler(async (_req, _res) => {
  // TODO: validasi di loans.schema.ts, logika di loans.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.12)');
});

/** POST /:id/return  —  Catat pengembalian (sp_return_loan) (FSD-2.12) */
export const postByIdReturn = asyncHandler(async (_req, _res) => {
  // TODO: validasi di loans.schema.ts, logika di loans.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.12)');
});

/** GET /availability  —  Cek ketersediaan ruangan/aset (FSD-2.9) */
export const getAvailability = asyncHandler(async (_req, _res) => {
  // TODO: validasi di loans.schema.ts, logika di loans.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.9)');
});
