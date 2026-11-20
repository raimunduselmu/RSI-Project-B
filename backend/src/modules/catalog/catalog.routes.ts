import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './catalog.controller.js';
import { createCategorySchema, createRoomSchema, intIdParam, updateCategorySchema, updateRoomSchema } from './catalog.schema.js';

export const catalogRoutes = Router();
const sarpras = [requireAuth, enforcePasswordChange, requireRole('Sarpras')];

catalogRoutes.get('/asset-categories', c.listCategories); // FSD-2.5 (publik)
catalogRoutes.post('/asset-categories', ...sarpras, validate(createCategorySchema), c.createCategory); // FSD-2.5
catalogRoutes.patch('/asset-categories/:id', ...sarpras, validate(intIdParam, 'params'), validate(updateCategorySchema), c.updateCategory); // FSD-2.5

catalogRoutes.get('/rooms', optionalAuth, c.listRooms); // FSD-2.9 (publik)
catalogRoutes.post('/rooms', ...sarpras, validate(createRoomSchema), c.createRoom); // FSD-2.9
catalogRoutes.patch('/rooms/:id', ...sarpras, validate(intIdParam, 'params'), validate(updateRoomSchema), c.updateRoom); // FSD-2.9
