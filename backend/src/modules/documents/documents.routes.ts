import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import * as c from './documents.controller.js';

export const documentsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
documentsRoutes.get('/', ...authed, c.list); // FSD-2.38
documentsRoutes.post('/', ...authed, c.create); // FSD-2.38
documentsRoutes.get('/:id/download', ...authed, c.getByIdDownload); // FSD-2.38
