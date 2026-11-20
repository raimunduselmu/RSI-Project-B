import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import * as c from './assets.controller.js';
import { assetKeyParam, codePreviewQuery, createAssetSchema, listAssetQuery, updateAssetSchema } from './assets.schema.js';

export const assetsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis sebelum route berparameter (/:id)
assetsRoutes.get('/', optionalAuth, validate(listAssetQuery, 'query'), c.list); // FSD-2.7 (publik)
assetsRoutes.get('/code-preview', ...authed, requireRole('Sarpras'), validate(codePreviewQuery, 'query'), c.codePreview); // FSD-2.5
assetsRoutes.post('/', ...authed, requireRole('Sarpras'), upload.single('photo'), validate(createAssetSchema), c.create); // FSD-2.5

assetsRoutes.get('/:id', optionalAuth, validate(assetKeyParam, 'params'), c.get); // FSD-2.7 (publik, field terbatas)
assetsRoutes.get('/:id/photo', validate(assetKeyParam, 'params'), c.photo); // FSD-2.5
assetsRoutes.get('/:id/histories', ...authed, validate(assetKeyParam, 'params'), c.histories); // FSD-2.8 (pengurus)
assetsRoutes.patch('/:id', ...authed, requireRole('Sarpras'), validate(assetKeyParam, 'params'), upload.single('photo'), validate(updateAssetSchema), c.update); // FSD-2.5
assetsRoutes.delete('/:id', ...authed, requireRole('Admin'), validate(assetKeyParam, 'params'), c.remove); // FSD-2.5 (soft delete)
