import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import { resolveFile, saveFile } from '../../lib/storage.js';
import type { ListCashQuery } from './finance.schema.js';
import * as service from './finance.service.js';

/** GET /cash-transactions  —  Daftar transaksi kas (FSD-2.32) */
export const getCashTransactions = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.listCash(req.query as unknown as ListCashQuery, page, perPage);
  paginated(res, rows, page, perPage, total);
});

/** POST /cash-transactions  —  Catat kas masuk/keluar (multipart; proof opsional) (FSD-2.32) */
export const postCashTransactions = asyncHandler(async (req, res) => {
  const proof = req.file ? await saveFile(req.file.buffer, req.file.originalname, 'kas-umum') : null;
  const row = await service.createCash(req.body, proof, req.user!, req.ip);
  created(res, row, row.status === 'MENUNGGU_PERSETUJUAN' ? 'Melebihi anggaran: menunggu persetujuan PHT' : 'Transaksi kas tercatat');
});

/** GET /cash-transactions/:id */
export const getCashTransactionsById = asyncHandler(async (req, res) => ok(res, await service.getCash(req.params.id)));

/** GET /cash-transactions/:id/proof */
export const getCashTransactionsByIdProof = asyncHandler(async (req, res) => {
  res.sendFile(resolveFile(await service.cashProofPath(req.params.id)));
});

/** POST /cash-transactions/:id/approve  —  PHT menyetujui over-budget (FSD-2.33 AF-1) */
export const postCashTransactionsByIdApprove = asyncHandler(async (req, res) =>
  ok(res, await service.decideCash(req.params.id, true, null, req.user!, req.ip), 'Pengeluaran disetujui'),
);

/** POST /cash-transactions/:id/reject  —  PHT menolak over-budget (FSD-2.33 AF-1) */
export const postCashTransactionsByIdReject = asyncHandler(async (req, res) =>
  ok(res, await service.decideCash(req.params.id, false, req.body.reason, req.user!, req.ip), 'Pengeluaran ditolak'),
);

/** GET /budgets  —  Daftar anggaran (FSD-2.33) */
export const getBudgets = asyncHandler(async (req, res) => {
  const pid = req.query.period_id ? Number(req.query.period_id) : undefined;
  ok(res, await service.listBudgets(pid));
});

/** POST /budgets  —  Buat pos anggaran (FSD-2.33) */
export const postBudgets = asyncHandler(async (req, res) => created(res, await service.createBudget(req.body, req.user!, req.ip), 'Pos anggaran dibuat'));

/** PATCH /budgets/:id  —  Ubah pos anggaran (FSD-2.33) */
export const patchBudgetsById = asyncHandler(async (req, res) =>
  ok(res, await service.updateBudget(Number(req.params.id), req.body, req.user!, req.ip), 'Pos anggaran diperbarui'),
);

/** GET /reports  —  Laporan keuangan (FSD-2.34) */
export const getReports = asyncHandler(async (req, res) => {
  const pid = req.query.period_id ? Number(req.query.period_id) : undefined;
  ok(res, await service.report(pid));
});
