import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './kas.service.js';

/** GET /dues/me  —  Status bulan iuran sendiri (FSD-2.43) */
export const getDuesMe = asyncHandler(async (_req, _res) => {
  // TODO: validasi di kas.schema.ts, logika di kas.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.43)');
});

/** POST /payments  —  Ajukan pembayaran iuran (multipart) (FSD-2.43) */
export const postPayments = asyncHandler(async (_req, _res) => {
  // TODO: validasi di kas.schema.ts, logika di kas.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.43)');
});

/** GET /payments/me  —  Riwayat pengajuan sendiri (FSD-2.43) */
export const getPaymentsMe = asyncHandler(async (_req, _res) => {
  // TODO: validasi di kas.schema.ts, logika di kas.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.43)');
});

/** GET /payments  —  Daftar pengajuan untuk verifikasi (FSD-2.44) */
export const getPayments = asyncHandler(async (_req, _res) => {
  // TODO: validasi di kas.schema.ts, logika di kas.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.44)');
});

/** GET /payments/:id/proof  —  Unduh bukti pembayaran (FSD-2.44) */
export const getPaymentsByIdProof = asyncHandler(async (_req, _res) => {
  // TODO: validasi di kas.schema.ts, logika di kas.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.44)');
});

/** POST /payments/:id/approve  —  Setujui (sp_verify_kas_payment) (FSD-2.44) */
export const postPaymentsByIdApprove = asyncHandler(async (_req, _res) => {
  // TODO: validasi di kas.schema.ts, logika di kas.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.44)');
});

/** POST /payments/:id/reject  —  Tolak, alasan wajib (FSD-2.44) */
export const postPaymentsByIdReject = asyncHandler(async (_req, _res) => {
  // TODO: validasi di kas.schema.ts, logika di kas.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.44)');
});
