import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './incidents.controller.js';

export const incidentsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
incidentsRoutes.get('/', ...authed, requireRole('Sarpras', 'PHT'), c.list); // FSD-2.15
incidentsRoutes.post('/', ...authed, c.create); // FSD-2.15
incidentsRoutes.patch('/:id', ...authed, requireRole('Sarpras'), c.updateById); // FSD-2.15
