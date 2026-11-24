import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './reports.controller.js';
import { exportQuery, inventoryReportQuery } from './reports.schema.js';

export const reportsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange]; // semua pengurus melihat (FSD-2.19)

reportsRoutes.get('/inventory', ...authed, validate(inventoryReportQuery, 'query'), c.getInventory); // FSD-2.19
reportsRoutes.get('/inventory/export', ...authed, requireRole('Sarpras'), validate(exportQuery, 'query'), c.getInventoryExport); // FSD-2.19 BR-44
