// FSD-2.23: RBAC data umat
// TSD 3.2: Endpoint /members
//
// Admin, PHT, dan Pastor memiliki akses sesuai FSD v1.2.
// Tidak ada role Umat yang login.

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './members.controller.js';

// FSD-2.23: Schema validasi endpoint members
import {
  idParam,
  listMembersQuerySchema,
  createMemberSchema,
} from './members.schema.js';

export const membersRoutes = Router();

const authed = [
  requireAuth,
  enforcePasswordChange,
];

// FSD-2.23: Daftar umat
membersRoutes.get(
  '/',
  ...authed,
  requireRole('Admin', 'PHT', 'Pastor'),
  validate(listMembersQuerySchema, 'query'),
  c.list,
);


 // FSD-2.23: Tambah umat
 // Actor: Admin, PHT, Pastor
membersRoutes.post(
  '/',
  ...authed,
  requireRole('Admin', 'PHT', 'Pastor'),
  validate(createMemberSchema, 'body'),
  c.create,
);

// FSD-2.23: Detail Data Umat
// BR-57: Data lengkap hanya untuk Admin, PHT, dan Pastor
membersRoutes.get(
  '/:id',
  ...authed,
  requireRole('Admin', 'PHT', 'Pastor'),
  validate(idParam, 'params'),
  c.getById,
);

// FSD-2.23: Ubah data umat
membersRoutes.patch(
  '/:id',
  ...authed,
  requireRole('Admin', 'PHT', 'Pastor'),
  c.updateById,
);

// FSD-2.24: Riwayat umat
membersRoutes.get(
  '/:id/records',
  ...authed,
  requireRole('Admin', 'PHT', 'Pastor'),
  c.getByIdRecords,
);

// FSD-2.24: Tambah riwayat umat
membersRoutes.post(
  '/:id/records',
  ...authed,
  requireRole('Admin', 'PHT', 'Pastor'),
  c.postByIdRecords,
);