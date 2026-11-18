import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './users.controller.js';

export const usersRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
usersRoutes.get('/', ...authed, requireRole('Admin'), c.list); // FSD-2.4
usersRoutes.post('/', ...authed, requireRole('Admin'), c.create); // FSD-2.4
usersRoutes.get('/:id', ...authed, requireRole('Admin'), c.getById); // FSD-2.4
usersRoutes.patch('/:id', ...authed, requireRole('Admin'), c.updateById); // FSD-2.4
usersRoutes.patch('/:id/roles', ...authed, requireRole('Admin'), c.updateByIdRoles); // FSD-2.4
usersRoutes.post('/:id/reset-password', ...authed, requireRole('Admin'), c.postByIdResetPassword); // FSD-2.3
