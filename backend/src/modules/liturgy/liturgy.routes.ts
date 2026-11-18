import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './liturgy.controller.js';

export const liturgyRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
liturgyRoutes.get('/liturgy-schedules', ...authed, c.getLiturgySchedules); // FSD-2.27
liturgyRoutes.post('/liturgy-schedules', ...authed, requireRole('Liturgi'), c.postLiturgySchedules); // FSD-2.27
liturgyRoutes.get('/liturgy-schedules/:id/assignments', ...authed, requireRole('Liturgi', 'PHT', 'Pastor'), c.getLiturgySchedulesByIdAssignments); // FSD-2.28
liturgyRoutes.post('/liturgy-schedules/:id/assignments', ...authed, requireRole('Liturgi'), c.postLiturgySchedulesByIdAssignments); // FSD-2.28
liturgyRoutes.patch('/liturgy-assignments/:id/confirmation', ...authed, requireRole('Liturgi'), c.updateLiturgyAssignmentsByIdConfirmation); // FSD-2.28
