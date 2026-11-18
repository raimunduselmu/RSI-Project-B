import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './assets.controller.js';

export const assetsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
assetsRoutes.get('/', ...authed, requireRole('Sarpras', 'PHT'), c.list); // FSD-2.5
assetsRoutes.post('/', ...authed, requireRole('Sarpras'), c.create); // FSD-2.6
assetsRoutes.get('/categories', ...authed, requireRole('Sarpras'), c.getCategories); // FSD-2.5
assetsRoutes.get('/rooms', ...authed, c.getRooms); // FSD-2.5
assetsRoutes.get('/:id', ...authed, requireRole('Sarpras', 'PHT'), c.getById); // FSD-2.7
assetsRoutes.patch('/:id', ...authed, requireRole('Sarpras'), c.updateById); // FSD-2.7
assetsRoutes.delete('/:id', ...authed, requireRole('Sarpras'), c.removeById); // FSD-2.7
assetsRoutes.get('/:id/histories', ...authed, requireRole('Sarpras', 'PHT'), c.getByIdHistories); // FSD-2.8
