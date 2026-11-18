import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { publicFormLimiter } from '../../middleware/rateLimit.js';
import * as c from './pastoral.controller.js';

export const pastoralRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
pastoralRoutes.get('/mass-intentions', ...authed, requireRole('Pastor', 'Liturgi'), c.getMassIntentions); // FSD-2.36
pastoralRoutes.post('/mass-intentions', publicFormLimiter, c.postMassIntentions); // FSD-2.36
pastoralRoutes.get('/pastoral-cares', ...authed, requireRole('Pastor'), c.getPastoralCares); // FSD-2.37
pastoralRoutes.post('/pastoral-cares', ...authed, requireRole('Pastor'), c.postPastoralCares); // FSD-2.37
pastoralRoutes.post('/pastoral-cares/requests', publicFormLimiter, c.postPastoralCaresRequests); // FSD-2.37
pastoralRoutes.patch('/mass-intentions/:id', ...authed, requireRole('Pastor'), c.updateMassIntentionsById); // FSD-2.36
