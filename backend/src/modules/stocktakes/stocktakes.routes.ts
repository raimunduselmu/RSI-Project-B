import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './stocktakes.controller.js';

export const stocktakesRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
stocktakesRoutes.get('/', ...authed, requireRole('Sarpras'), c.list); // FSD-2.16
stocktakesRoutes.post('/', ...authed, requireRole('Sarpras'), c.create); // FSD-2.16
stocktakesRoutes.patch('/:id/items/:itemId', ...authed, requireRole('Sarpras'), c.updateByIdItemsByItemId); // FSD-2.16
stocktakesRoutes.post('/:id/close', ...authed, requireRole('Sarpras'), c.postByIdClose); // FSD-2.16
