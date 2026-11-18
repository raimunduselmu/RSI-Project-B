import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './settings.controller.js';

export const settingsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
settingsRoutes.get('/', ...authed, requireRole('Bendahara'), c.list); // FSD-2.45
settingsRoutes.patch('/:key', ...authed, requireRole('Bendahara'), c.updateByKey); // FSD-2.45
