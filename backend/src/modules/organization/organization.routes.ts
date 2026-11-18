import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './organization.controller.js';

export const organizationRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
organizationRoutes.get('/periods', ...authed, c.getPeriods); // FSD-2.25
organizationRoutes.post('/periods', ...authed, requireRole('Admin'), c.postPeriods); // FSD-2.25
organizationRoutes.get('/officers', ...authed, c.getOfficers); // FSD-2.25
organizationRoutes.post('/officers', ...authed, requireRole('Admin', 'PHT'), c.postOfficers); // FSD-2.25
organizationRoutes.get('/handovers', ...authed, c.getHandovers); // FSD-2.26
organizationRoutes.post('/handovers', ...authed, c.postHandovers); // FSD-2.26
organizationRoutes.post('/periods/:id/archive', ...authed, requireRole('Admin', 'PHT'), c.postPeriodsByIdArchive); // FSD-2.26
organizationRoutes.patch('/officers/:id', ...authed, requireRole('Admin', 'PHT'), c.updateOfficersById); // FSD-2.25
organizationRoutes.post('/handovers/:id/approve', ...authed, requireRole('PHT'), c.postHandoversByIdApprove); // FSD-2.26
organizationRoutes.post('/handovers/:id/reject', ...authed, requireRole('PHT'), c.postHandoversByIdReject); // FSD-2.26
