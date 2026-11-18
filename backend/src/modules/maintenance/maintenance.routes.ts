import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './maintenance.controller.js';

export const maintenanceRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
maintenanceRoutes.get('/maintenance-schedules', ...authed, requireRole('Sarpras'), c.getMaintenanceSchedules); // FSD-2.14
maintenanceRoutes.post('/maintenance-schedules', ...authed, requireRole('Sarpras'), c.postMaintenanceSchedules); // FSD-2.14
maintenanceRoutes.post('/maintenance-schedules/:id/logs', ...authed, requireRole('Sarpras'), c.postMaintenanceSchedulesByIdLogs); // FSD-2.14
