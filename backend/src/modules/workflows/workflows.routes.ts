import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './workflows.controller.js';

export const workflowsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
workflowsRoutes.get('/', ...authed, requireRole('Admin', 'PHT'), c.list); // FSD-2.39
workflowsRoutes.get('/:id', ...authed, requireRole('Admin', 'PHT'), c.getById); // FSD-2.39
