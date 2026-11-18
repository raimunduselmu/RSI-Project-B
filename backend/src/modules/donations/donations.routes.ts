import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './donations.controller.js';

export const donationsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
donationsRoutes.get('/', ...authed, requireRole('Bendahara', 'PHT'), c.list); // FSD-2.42
donationsRoutes.post('/', ...authed, requireRole('Bendahara'), c.create); // FSD-2.42
