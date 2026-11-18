import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { publicFormLimiter } from '../../middleware/rateLimit.js';
import * as c from './events.controller.js';

export const eventsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
eventsRoutes.get('/', ...authed, c.list); // FSD-2.29
eventsRoutes.post('/', ...authed, requireRole('PHT'), c.create); // FSD-2.29
eventsRoutes.get('/:id', ...authed, c.getById); // FSD-2.29
eventsRoutes.patch('/:id', ...authed, requireRole('PHT'), c.updateById); // FSD-2.29
eventsRoutes.post('/:id/registrations', publicFormLimiter, c.postByIdRegistrations); // FSD-2.30
eventsRoutes.get('/:id/registrations', ...authed, requireRole('PHT'), c.getByIdRegistrations); // FSD-2.30
eventsRoutes.get('/:id/report', ...authed, requireRole('PHT'), c.getByIdReport); // FSD-2.31
