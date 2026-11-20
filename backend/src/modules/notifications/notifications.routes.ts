import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { validate } from '../../middleware/validate.js';
import * as c from './notifications.controller.js';
import { idParam, listNotificationQuery } from './notifications.schema.js';

export const notificationsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
notificationsRoutes.get('/', ...authed, validate(listNotificationQuery, 'query'), c.list); // FSD-2.21
notificationsRoutes.post('/read-all', ...authed, c.postReadAll); // FSD-2.21
notificationsRoutes.patch('/:id/read', ...authed, validate(idParam, 'params'), c.updateByIdRead); // FSD-2.21
