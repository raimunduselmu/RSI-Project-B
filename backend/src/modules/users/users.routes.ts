import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './users.controller.js';
import { createUserSchema, idParam, listUserQuery, updateRolesSchema, updateUserSchema } from './users.schema.js';

export const usersRoutes = Router();
const admin = [requireAuth, enforcePasswordChange, requireRole('Admin')];

// Route statis ditulis sebelum route berparameter (/:id)
usersRoutes.get('/', ...admin, validate(listUserQuery, 'query'), c.list); // FSD-2.4
usersRoutes.post('/', ...admin, validate(createUserSchema), c.create); // FSD-2.4
usersRoutes.get('/:id', ...admin, validate(idParam, 'params'), c.getById); // FSD-2.4
usersRoutes.patch('/:id', ...admin, validate(idParam, 'params'), validate(updateUserSchema), c.updateById); // FSD-2.4
usersRoutes.patch('/:id/roles', ...admin, validate(idParam, 'params'), validate(updateRolesSchema), c.updateByIdRoles); // FSD-2.4
usersRoutes.post('/:id/reset-password', ...admin, validate(idParam, 'params'), c.postByIdResetPassword); // FSD-2.3
