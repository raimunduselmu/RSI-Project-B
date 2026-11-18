import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { publicFormLimiter } from '../../middleware/rateLimit.js';
import * as c from './loans.controller.js';

export const loansRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
loansRoutes.post('/', publicFormLimiter, c.create); // FSD-2.10
loansRoutes.get('/', ...authed, requireRole('Sarpras', 'PHT'), c.list); // FSD-2.11
loansRoutes.get('/availability', c.getAvailability); // FSD-2.9
loansRoutes.get('/:id', ...authed, requireRole('Sarpras', 'PHT'), c.getById); // FSD-2.11
loansRoutes.post('/:id/approve', ...authed, requireRole('Sarpras'), c.postByIdApprove); // FSD-2.11
loansRoutes.post('/:id/reject', ...authed, requireRole('Sarpras'), c.postByIdReject); // FSD-2.11
loansRoutes.post('/:id/pickup', ...authed, requireRole('Sarpras'), c.postByIdPickup); // FSD-2.12
loansRoutes.post('/:id/return', ...authed, requireRole('Sarpras'), c.postByIdReturn); // FSD-2.12
