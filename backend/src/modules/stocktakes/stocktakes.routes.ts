import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './stocktakes.controller.js';
import { checkItemSchema, idParam, itemParam, listItemsQuery, noteItemSchema, openStocktakeSchema } from './stocktakes.schema.js';

export const stocktakesRoutes = Router();
const sarpras = [requireAuth, enforcePasswordChange, requireRole('Sarpras')]; // FSD-2.17: Sarpras, Admin

// Route statis ditulis sebelum route berparameter (/:id)
stocktakesRoutes.get('/', ...sarpras, c.list); // FSD-2.17
stocktakesRoutes.post('/', ...sarpras, validate(openStocktakeSchema), c.create); // FSD-2.17
stocktakesRoutes.get('/:id', ...sarpras, validate(idParam, 'params'), c.getById); // FSD-2.17
stocktakesRoutes.get('/:id/items', ...sarpras, validate(idParam, 'params'), validate(listItemsQuery, 'query'), c.getByIdItems); // FSD-2.17
stocktakesRoutes.patch('/:id/items/:itemId', ...sarpras, validate(itemParam, 'params'), validate(checkItemSchema), c.updateByIdItemsByItemId); // FSD-2.17
stocktakesRoutes.patch('/:id/items/:itemId/note', ...sarpras, validate(itemParam, 'params'), validate(noteItemSchema), c.updateByIdItemsByItemIdNote); // FSD-2.17 BR-41
stocktakesRoutes.post('/:id/close', ...sarpras, validate(idParam, 'params'), c.postByIdClose); // FSD-2.17
