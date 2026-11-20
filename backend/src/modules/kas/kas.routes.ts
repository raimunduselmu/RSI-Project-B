import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import * as c from './kas.controller.js';
import { listPaymentQuery, paymentKeyParam, recapQuery, rejectSchema, submitPaymentSchema } from './kas.schema.js';

export const kasRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];
// Admin selalu lolos requireRole (hanya baca: SP menolak verifikasi oleh Admin, BR-125)
const verifiers = [...authed, requireRole('Bendahara', 'PHT')];
const key = validate(paymentKeyParam, 'params');

// Route statis ditulis sebelum route berparameter (/:id)
// Pengurus aktif: status keaktifan dicek di SP (ERR-KAS-02), bukan role tertentu
kasRoutes.get('/dues/me', ...authed, c.getDuesMe); // FSD-2.43
kasRoutes.post('/payments', ...authed, upload.single('proof'), validate(submitPaymentSchema), c.postPayments); // FSD-2.43
kasRoutes.get('/payments/me', ...authed, c.getPaymentsMe); // FSD-2.43 AF-1
kasRoutes.get('/payments', ...verifiers, validate(listPaymentQuery, 'query'), c.getPayments); // FSD-2.44
kasRoutes.get('/recap', ...verifiers, validate(recapQuery, 'query'), c.getRecap); // FSD-2.44, BO-12

kasRoutes.get('/payments/:id', ...authed, key, c.getPaymentsById); // FSD-2.44 (pemilik / Bendahara / PHT / Admin)
kasRoutes.get('/payments/:id/proof', ...authed, key, c.getPaymentsByIdProof); // FSD-2.44 (pemilik / Bendahara / PHT / Admin)
kasRoutes.post('/payments/:id/approve', ...verifiers, key, c.postPaymentsByIdApprove); // FSD-2.44
kasRoutes.post('/payments/:id/reject', ...verifiers, key, validate(rejectSchema), c.postPaymentsByIdReject); // FSD-2.44
