import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import * as c from './settings.controller.js';
import { keyParam, updateSettingSchema } from './settings.schema.js';

export const settingsRoutes = Router();
// Admin semua parameter; Bendahara hanya QRIS_IMAGE, KAS_MONTHLY_RATE, FACILITY_RATE (dicek di service, ERR-AUTH-03)
const authed = [requireAuth, enforcePasswordChange, requireRole('Bendahara')];

settingsRoutes.get('/', ...authed, c.list); // FSD-2.45
settingsRoutes.patch('/:key', ...authed, validate(keyParam, 'params'), upload.single('file'), validate(updateSettingSchema), c.updateByKey); // FSD-2.45
