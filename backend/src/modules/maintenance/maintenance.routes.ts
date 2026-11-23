import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './maintenance.controller.js';
import { createLogSchema, createScheduleSchema, idParam, listScheduleQuery, updateScheduleSchema } from './maintenance.schema.js';

export const maintenanceRoutes = Router();
const authed = [requireAuth, enforcePasswordChange]; // semua pengurus boleh melihat (FSD-2.14)
const sarpras = [...authed, requireRole('Sarpras')];

// Route statis ditulis sebelum route berparameter (/:id)
maintenanceRoutes.get('/maintenance-schedules', ...authed, validate(listScheduleQuery, 'query'), c.getMaintenanceSchedules); // FSD-2.14
maintenanceRoutes.post('/maintenance-schedules', ...sarpras, validate(createScheduleSchema), c.postMaintenanceSchedules); // FSD-2.14
maintenanceRoutes.get('/maintenance-schedules/:id', ...authed, validate(idParam, 'params'), c.getMaintenanceSchedulesById); // FSD-2.14
maintenanceRoutes.patch('/maintenance-schedules/:id', ...sarpras, validate(idParam, 'params'), validate(updateScheduleSchema), c.patchMaintenanceSchedulesById); // FSD-2.14
maintenanceRoutes.get('/maintenance-schedules/:id/logs', ...authed, validate(idParam, 'params'), c.getMaintenanceSchedulesByIdLogs); // FSD-2.14
maintenanceRoutes.post('/maintenance-schedules/:id/logs', ...sarpras, validate(idParam, 'params'), validate(createLogSchema), c.postMaintenanceSchedulesByIdLogs); // FSD-2.14
