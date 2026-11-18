import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './finance.service.js';

/** GET /cash-transactions  —  Daftar transaksi kas (FSD-2.32) */
export const getCashTransactions = asyncHandler(async (_req, _res) => {
  // TODO: validasi di finance.schema.ts, logika di finance.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.32)');
});

/** POST /cash-transactions  —  Catat kas masuk/keluar (FSD-2.32) */
export const postCashTransactions = asyncHandler(async (_req, _res) => {
  // TODO: validasi di finance.schema.ts, logika di finance.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.32)');
});

/** GET /budgets  —  Daftar anggaran (FSD-2.33) */
export const getBudgets = asyncHandler(async (_req, _res) => {
  // TODO: validasi di finance.schema.ts, logika di finance.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.33)');
});

/** POST /budgets  —  Buat pos anggaran (FSD-2.33) */
export const postBudgets = asyncHandler(async (_req, _res) => {
  // TODO: validasi di finance.schema.ts, logika di finance.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.33)');
});

/** GET /reports  —  Laporan keuangan (FSD-2.34) */
export const getReports = asyncHandler(async (_req, _res) => {
  // TODO: validasi di finance.schema.ts, logika di finance.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.34)');
});
