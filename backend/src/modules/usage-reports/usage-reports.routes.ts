import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './usage-reports.controller.js';

export const usageReportsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
usageReportsRoutes.get('/', ...authed, requireRole('Sarpras', 'PHT'), c.list); // FSD-2.13
usageReportsRoutes.post('/', ...authed, c.create); // FSD-2.13
usageReportsRoutes.post('/:id/finish', ...authed, c.postByIdFinish); // FSD-2.13
