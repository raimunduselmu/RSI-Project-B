// ==================================================
// FSD-2.23: RBAC dan endpoint data umat
// TSD 3.2: /api/v1/members
// Admin, PHT, dan Pastor sesuai FSD; DELETE khusus Admin sesuai TSD.
// ==================================================

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './members.controller.js';
import {
  idParam,
  listMembersQuerySchema,
  createMemberSchema,
  updateMemberSchema,
  updateMemberStatusSchema,
} from './members.schema.js';
import {
  createMemberRecordSchema,
  listMemberRecordsQuerySchema,
} from './member-records.schema.js';

export const membersRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];
const memberManagers = requireRole('Admin', 'PHT', 'Pastor');

// FSD-2.23 Main Flow Step 1: daftar, pencarian, filter kategori/status/periode.
membersRoutes.get(
  '/', ...authed, memberManagers,
  validate(listMembersQuerySchema, 'query'), c.list,
);

// FSD-2.23 Main Flow Step 2-4: tambah umat dengan consent eksplisit.
membersRoutes.post(
  '/', ...authed, memberManagers,
  validate(createMemberSchema, 'body'), c.create,
);

// FSD-2.24: route tetap terdaftar; implementasi dipindahkan ke branch riwayat umat.
membersRoutes.get(
  '/:id/records', ...authed, memberManagers,
  validate(idParam, 'params'), c.getByIdRecords,
);
membersRoutes.post(
  '/:id/records', ...authed, memberManagers,
  validate(idParam, 'params'), c.postByIdRecords,
);

// FSD-2.23: detail data umat.
membersRoutes.get(
  '/:id', ...authed, memberManagers,
  validate(idParam, 'params'), c.getById,
);

// FSD-2.23: ubah identitas/kontak/consent umat.
membersRoutes.patch(
  '/:id', ...authed, memberManagers,
  validate(idParam, 'params'),
  validate(updateMemberSchema, 'body'), c.updateById,
);

// FSD-2.23 AF-1: perubahan status wajib disertai alasan.
membersRoutes.patch(
  '/:id/status', ...authed, memberManagers,
  validate(idParam, 'params'),
  validate(updateMemberStatusSchema, 'body'), c.updateStatus,
);

// TSD endpoint matrix: soft-delete hanya dapat dilakukan Admin.
membersRoutes.delete(
  '/:id', ...authed, requireRole('Admin'),
  validate(idParam, 'params'), c.remove,
);

// FSD-2.24 GET/POST /:id/records ditambahkan pada branch riwayat umat.
// ==================================================
// FSD-2.24: Riwayat Pelayanan & Sakramen/Katekese
// Admin, PHT, Pastor
// ==================================================

// GET /members/:id/records
// Menampilkan riwayat umat dan filter jenis/periode.
membersRoutes.get(
  '/:id/records',
  ...authed,
  memberManagers,
  validate(idParam, 'params'),
  validate(listMemberRecordsQuerySchema, 'query'),
  c.getByIdRecords,
);

// POST /members/:id/records
// Menambahkan riwayat baru secara append-only.
membersRoutes.post(
  '/:id/records',
  ...authed,
  memberManagers,
  validate(idParam, 'params'),
  validate(createMemberRecordSchema, 'body'),
  c.postByIdRecords,
);