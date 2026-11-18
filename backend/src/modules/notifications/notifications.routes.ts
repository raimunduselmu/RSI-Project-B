import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import * as c from './notifications.controller.js';

export const notificationsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
notificationsRoutes.get('/', ...authed, c.list); // FSD-2.21
notificationsRoutes.patch('/:id/read', ...authed, c.updateByIdRead); // FSD-2.21
