import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './organization.controller.js';
import {
  archivePeriodSchema,
  copyStructureSchema,
  createDivisionSchema,
  createOfficerSchema,
  createPeriodSchema,
  createPositionSchema,
  intIdParam,
  listDivisionQuery,
  listOfficerQuery,
  updateDivisionSchema,
  updateOfficerSchema,
  updatePeriodSchema,
  uuidParam,
} from './organization.schema.js';

export const organizationRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];
const manage = [...authed, requireRole('PHT')]; // Admin selalu lolos requireRole
const intId = validate(intIdParam, 'params');
const uuid = validate(uuidParam, 'params');

// Route statis ditulis sebelum route berparameter (/:id)
organizationRoutes.get('/periods', ...authed, c.getPeriods); // FSD-2.25
organizationRoutes.get('/periods/active', ...authed, c.getActivePeriod); // FSD-2.25
organizationRoutes.post('/periods', ...manage, validate(createPeriodSchema), c.postPeriods); // FSD-2.25
organizationRoutes.patch('/periods/:id', ...manage, intId, validate(updatePeriodSchema), c.updatePeriodsById); // FSD-2.25
organizationRoutes.post('/periods/:id/archive', ...manage, intId, validate(archivePeriodSchema), c.postPeriodsByIdArchive); // FSD-2.25 AF-1
organizationRoutes.post('/periods/:id/copy-structure', ...manage, intId, validate(copyStructureSchema), c.postPeriodsByIdCopyStructure); // FSD-2.25 AF-2

organizationRoutes.get('/divisions', ...authed, validate(listDivisionQuery, 'query'), c.getDivisions); // FSD-2.25
organizationRoutes.post('/divisions', ...manage, validate(createDivisionSchema), c.postDivisions); // FSD-2.25
organizationRoutes.patch('/divisions/:id', ...manage, intId, validate(updateDivisionSchema), c.updateDivisionsById); // FSD-2.25
organizationRoutes.post('/divisions/:id/positions', ...manage, intId, validate(createPositionSchema), c.postDivisionsByIdPositions); // FSD-2.25

organizationRoutes.get('/officers', ...authed, validate(listOfficerQuery, 'query'), c.getOfficers); // FSD-2.25
organizationRoutes.get('/officers/:id', ...authed, uuid, c.getOfficersById); // FSD-2.25
organizationRoutes.post('/officers', ...manage, validate(createOfficerSchema), c.postOfficers); // FSD-2.25
organizationRoutes.patch('/officers/:id', ...manage, uuid, validate(updateOfficerSchema), c.updateOfficersById); // FSD-2.25

// FSD-2.26 serah terima — menyusul (501)
organizationRoutes.get('/handovers', ...authed, c.getHandovers);
organizationRoutes.post('/handovers', ...authed, c.postHandovers);
organizationRoutes.post('/handovers/:id/approve', ...manage, c.postHandoversByIdApprove);
organizationRoutes.post('/handovers/:id/reject', ...manage, c.postHandoversByIdReject);
