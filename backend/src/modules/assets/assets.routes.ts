import { dateRangeQuery } from '../../lib/dateRange.js';
import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import * as c from './assets.controller.js';
import { assetKeyParam, codePreviewQuery, createAssetSchema, documentParam, labelSchema, listAssetQuery, updateAssetSchema, uploadDocumentSchema } from './assets.schema.js';

export const assetsRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis sebelum route berparameter (/:id)
assetsRoutes.get('/', optionalAuth, validate(listAssetQuery, 'query'), c.list); // FSD-2.7 (publik)
assetsRoutes.get('/code-preview', ...authed, requireRole('Sarpras'), validate(codePreviewQuery, 'query'), c.codePreview); // FSD-2.5
assetsRoutes.post('/', ...authed, requireRole('Sarpras'), upload.single('photo'), validate(createAssetSchema), c.create); // FSD-2.5
assetsRoutes.post('/labels', ...authed, requireRole('Sarpras'), validate(labelSchema), c.labels); // FSD-2.6 (PDF)

assetsRoutes.get('/:id', optionalAuth, validate(assetKeyParam, 'params'), c.get); // FSD-2.7 (publik, field terbatas)
assetsRoutes.get('/:id/photo', validate(assetKeyParam, 'params'), c.photo); // FSD-2.5
assetsRoutes.get('/:id/histories', ...authed, validate(assetKeyParam, 'params'), validate(dateRangeQuery, 'query'), c.histories); // FSD-2.8 (pengurus)
assetsRoutes.patch('/:id', ...authed, requireRole('Sarpras'), validate(assetKeyParam, 'params'), upload.single('photo'), validate(updateAssetSchema), c.update); // FSD-2.5
assetsRoutes.delete('/:id', ...authed, requireRole('Admin'), validate(assetKeyParam, 'params'), c.remove); // FSD-2.5 (soft delete)

// FSD-2.16 Dokumen aset: semua pengurus melihat & mengunduh, Sarpras mengunggah & menghapus
assetsRoutes.get('/:id/documents', ...authed, validate(assetKeyParam, 'params'), c.documents); // FSD-2.16
assetsRoutes.post('/:id/documents', ...authed, requireRole('Sarpras'), validate(assetKeyParam, 'params'), upload.single('file'), validate(uploadDocumentSchema), c.uploadDocument); // FSD-2.16
assetsRoutes.get('/:id/documents/:docId/download', ...authed, validate(documentParam, 'params'), c.downloadDocument); // FSD-2.16
assetsRoutes.delete('/:id/documents/:docId', ...authed, requireRole('Sarpras'), validate(documentParam, 'params'), c.deleteDocument); // FSD-2.16
