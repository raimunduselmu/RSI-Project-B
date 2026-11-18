import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './kas.controller.js';

export const kasRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
kasRoutes.get('/dues/me', ...authed, c.getDuesMe); // FSD-2.43
kasRoutes.post('/payments', ...authed, c.postPayments); // FSD-2.43
kasRoutes.get('/payments/me', ...authed, c.getPaymentsMe); // FSD-2.43
kasRoutes.get('/payments', ...authed, requireRole('Bendahara', 'PHT'), c.getPayments); // FSD-2.44
kasRoutes.get('/payments/:id/proof', ...authed, requireRole('Bendahara', 'PHT'), c.getPaymentsByIdProof); // FSD-2.44
kasRoutes.post('/payments/:id/approve', ...authed, requireRole('Bendahara', 'PHT'), c.postPaymentsByIdApprove); // FSD-2.44
kasRoutes.post('/payments/:id/reject', ...authed, requireRole('Bendahara', 'PHT'), c.postPaymentsByIdReject); // FSD-2.44
