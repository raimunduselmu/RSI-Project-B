import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './members.controller.js';

export const membersRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
membersRoutes.get('/', ...authed, requireRole('PHT', 'Pastor'), c.list); // FSD-2.23
membersRoutes.post('/', ...authed, requireRole('PHT'), c.create); // FSD-2.23
membersRoutes.get('/:id', ...authed, requireRole('PHT', 'Pastor'), c.getById); // FSD-2.23
membersRoutes.patch('/:id', ...authed, requireRole('PHT'), c.updateById); // FSD-2.23
membersRoutes.get('/:id/records', ...authed, requireRole('PHT', 'Pastor'), c.getByIdRecords); // FSD-2.24
membersRoutes.post('/:id/records', ...authed, requireRole('PHT', 'Pastor'), c.postByIdRecords); // FSD-2.24
