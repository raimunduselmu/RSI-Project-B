
// ==================================================
// FSD-2.23 & FSD-2.24: Controller modul Keumatan
// TSD 3.1: Respons API { status, data, message, meta }
//
// Controller bertanggung jawab menangani request,
// meneruskan proses ke service, dan mengirim respons.
// ==================================================

import { asyncHandler } from '../../lib/asyncHandler.js';
import { created, ok, paginated } from '../../lib/response.js';

import type {
  ListMembersQuery,
  UpdateMemberInput,
  UpdateMemberStatusInput,
} from './members.schema.js';

import * as membersService from './members.service.js';

import type {
  ListMemberRecordsQuery,
  CreateMemberRecordInput,
} from './member-records.schema.js';

import * as recordsService from './member-records.service.js';

// ==================================================
// FSD-2.23: Manajemen Data Umat
// ==================================================

/**
 * GET /members
 * Menampilkan daftar umat dengan pencarian,
 * filter, dan paginasi.
 */
export const list = asyncHandler(async (req, res) => {
  const filters = req.query as unknown as ListMembersQuery;
  const result = await membersService.listMembers(filters);

  return paginated(
    res,
    result.data,
    filters.page,
    filters.per_page,
    result.total,
  );
});

/**
 * POST /members
 * Menambahkan data umat setelah persetujuan consent.
 */
export const create = asyncHandler(async (req, res) => {
  const member = await membersService.createMember(
    req.body,
    req.user!,
    req.ip,
  );

  return created(
    res,
    member,
    'Data umat berhasil ditambahkan',
  );
});

/**
 * GET /members/:id
 * Menampilkan detail data umat.
 */
export const getById = asyncHandler(async (req, res) => {
  const member = await membersService.getMemberById(req.params.id);

  return ok(
    res,
    member,
    'Detail umat berhasil diperoleh',
  );
});

/**
 * PATCH /members/:id
 * Memperbarui profil dan data consent umat.
 */
export const updateById = asyncHandler(async (req, res) => {
  const member = await membersService.updateMember(
    req.params.id,
    req.body as UpdateMemberInput,
    req.user!,
    req.ip,
  );

  return ok(
    res,
    member,
    'Data umat berhasil diperbarui',
  );
});

/**
 * PATCH /members/:id/status
 * Memperbarui status umat beserta alasan dan waktu perubahan.
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const result = await membersService.updateMemberStatus(
    req.params.id,
    req.body as UpdateMemberStatusInput,
    req.user!,
    req.ip,
  );

  return ok(
    res,
    result,
    'Status umat berhasil diperbarui',
  );
});

/**
 * DELETE /members/:id
 * Menonaktifkan data umat menggunakan soft-delete.
 */
export const remove = asyncHandler(async (req, res) => {
  const result = await membersService.softDeleteMember(
    req.params.id,
    req.user!,
    req.ip,
  );

  return ok(
    res,
    result,
    'Data umat berhasil dinonaktifkan secara soft-delete',
  );
});

// ==================================================
// FSD-2.24: Riwayat Pelayanan, Sakramen, dan Katekese
// ==================================================

/**
 * GET /members/:id/records
 * Menampilkan riwayat pelayanan, sakramen, dan katekese
 * secara kronologis berdasarkan data umat.
 */
export const getByIdRecords = asyncHandler(async (req, res) => {
  const records = await recordsService.listMemberRecords(
    req.params.id,
    req.query as unknown as ListMemberRecordsQuery,
  );

  return ok(
    res,
    records,
    'Riwayat umat berhasil diperoleh',
  );
});

/**
 * POST /members/:id/records
 * Menambahkan riwayat pelayanan, sakramen, atau katekese.
 *
 * Data bersifat append-only. Koreksi dilakukan melalui
 * catatan koreksi atau pencatatan baru sesuai jenis riwayat.
 */
export const postByIdRecords = asyncHandler(async (req, res) => {
  const record = await recordsService.createMemberRecord(
    req.params.id,
    req.body as CreateMemberRecordInput,
    req.user!,
    req.ip,
  );

  return created(
    res,
    record,
    'Riwayat umat berhasil ditambahkan',
  );
});
