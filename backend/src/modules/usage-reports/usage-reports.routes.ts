import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { validate } from '../../middleware/validate.js';
import * as c from './usage-reports.controller.js';
import { createUsageSchema, finishUsageSchema, idParam, listUsageQuery } from './usage-reports.schema.js';

export const usageReportsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange]; // semua pengurus (FSD-2.13 actors)

// Route statis ditulis sebelum route berparameter (/:id)
usageReportsRoutes.get('/', ...authed, validate(listUsageQuery, 'query'), c.list); // FSD-2.13
usageReportsRoutes.post('/', ...authed, validate(createUsageSchema), c.create); // FSD-2.13
usageReportsRoutes.get('/:id', ...authed, validate(idParam, 'params'), c.getById); // FSD-2.13
usageReportsRoutes.post('/:id/finish', ...authed, validate(idParam, 'params'), validate(finishUsageSchema), c.postByIdFinish); // FSD-2.13
