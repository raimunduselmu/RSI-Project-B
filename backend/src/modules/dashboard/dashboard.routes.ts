import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './dashboard.controller.js';

export const dashboardRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
dashboardRoutes.get('/', ...authed, c.list); // FSD-2.40
dashboardRoutes.get('/export', ...authed, requireRole('PHT'), c.getExport); // FSD-2.41
