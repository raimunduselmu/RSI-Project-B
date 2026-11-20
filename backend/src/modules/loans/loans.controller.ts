import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import type { ListLoanQuery } from './loans.schema.js';
import * as service from './loans.service.js';

export const submit = asyncHandler(async (req, res) => {
  created(res, await service.submit(req.body, req.ip), 'Pengajuan terkirim. Simpan kode lacak untuk Cek Status.');
});

export const list = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.list(req.query as unknown as ListLoanQuery, page, perPage);
  paginated(res, rows, page, perPage, total);
});

export const get = asyncHandler(async (req, res) => ok(res, await service.get(req.params.id)));

export const approve = asyncHandler(async (req, res) =>
  ok(res, await service.decide(req.params.id, true, req.body.note ?? null, req.user!, req.ip), 'Pengajuan disetujui. Email keputusan dikirim.'));

export const reject = asyncHandler(async (req, res) =>
  ok(res, await service.decide(req.params.id, false, req.body.reject_reason, req.user!, req.ip), 'Pengajuan ditolak. Email keputusan dikirim.'));

export const pickup = asyncHandler(async (req, res) =>
  ok(res, await service.pickup(req.params.id, req.body, req.user!, req.ip), 'Pengambilan dicatat'));

export const returnLoan = asyncHandler(async (req, res) => {
  const r = await service.returnLoan(req.params.id, req.body, req.user!, req.ip);
  ok(res, r, r.damaged_assets.length ? `Pengembalian dicatat. ${r.damaged_assets.length} aset masuk pemeliharaan.` : 'Pengembalian dicatat');
});
