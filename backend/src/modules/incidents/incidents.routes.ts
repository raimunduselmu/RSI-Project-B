import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './incidents.controller.js';
import { createIncidentSchema, idParam, listIncidentQuery, suggestQuery, updateIncidentSchema } from './incidents.schema.js';

export const incidentsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
incidentsRoutes.get('/', ...authed, validate(listIncidentQuery, 'query'), c.list); // FSD-2.15
incidentsRoutes.get('/responsible-suggestion', ...authed, validate(suggestQuery, 'query'), c.getResponsibleSuggestion); // FSD-2.15 BR-36
incidentsRoutes.post('/', ...authed, validate(createIncidentSchema), c.create); // FSD-2.15
incidentsRoutes.get('/:id', ...authed, validate(idParam, 'params'), c.getById); // FSD-2.15
incidentsRoutes.patch('/:id', ...authed, requireRole('Sarpras'), validate(idParam, 'params'), validate(updateIncidentSchema), c.updateById); // FSD-2.15
