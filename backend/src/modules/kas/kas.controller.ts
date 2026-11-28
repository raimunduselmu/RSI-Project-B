import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import { saveFile, sendStoredFile } from '../../lib/storage.js';
import type { ListPaymentQuery } from './kas.schema.js';
import * as service from './kas.service.js';

/** GET /dues/me — status bulan iuran milik sendiri + opsi pembayaran (FSD-2.43, SCR-40) */
export const getDuesMe = asyncHandler(async (req, res) => ok(res, await service.myDues(req.user!, req.ip)));

/** POST /payments — ajukan pembayaran (multipart: due_ids, method, note, proof) (FSD-2.43) */
export const postPayments = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('ERR-VAL-01', 'Bukti pembayaran wajib diunggah', { proof: ['Unggah bukti transfer (QRIS) atau foto pertemuan (Cash)'] });
  const proof = await saveFile(req.file.buffer, req.file.originalname, 'kas');
  created(res, await service.submitPayment(req.body, proof, req.user!, req.ip), 'Pengajuan iuran terkirim dan menunggu verifikasi');
});

/** GET /payments/me — riwayat pengajuan sendiri (FSD-2.43 AF-1) */
export const getPaymentsMe = asyncHandler(async (req, res) => ok(res, await service.myPayments(req.user!)));

/** GET /payments — daftar pengajuan untuk verifikasi (FSD-2.44) */
export const getPayments = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.listPayments(req.query as unknown as ListPaymentQuery, req.user!, page, perPage);
  paginated(res, rows, page, perPage, total);
});

/** GET /payments/:id — detail pengajuan (pemilik, Bendahara, PHT, Admin) */
export const getPaymentsById = asyncHandler(async (req, res) => ok(res, await service.getPayment(req.params.id, req.user!)));

/** GET /payments/:id/proof — pratinjau/unduh bukti (FSD-2.44) */
export const getPaymentsByIdProof = asyncHandler(async (req, res) => {
  await sendStoredFile(res, await service.proofPath(req.params.id, req.user!));
});

/** POST /payments/:id/approve — bulan LUNAS + Kas Masuk otomatis (FSD-2.44) */
export const postPaymentsByIdApprove = asyncHandler(async (req, res) =>
  ok(res, await service.verify(req.params.id, true, null, req.user!, req.ip), 'Iuran lunas dan Kas Masuk tercatat'),
);

/** POST /payments/:id/reject — alasan wajib, bulan kembali BELUM_LUNAS (FSD-2.44) */
export const postPaymentsByIdReject = asyncHandler(async (req, res) =>
  ok(res, await service.verify(req.params.id, false, req.body.reject_reason, req.user!, req.ip), 'Pengajuan ditolak'),
);

/** GET /recap — rekap status iuran per pengurus per bulan (BO-12) */
export const getRecap = asyncHandler(async (req, res) => ok(res, await service.recap(req.query.q as string | undefined)));
