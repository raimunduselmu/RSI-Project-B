import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { publicFormLimiter } from '../../middleware/rateLimit.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as c from './loans.controller.js';
import { approveSchema, createLoanSchema, listLoanQuery, loanKeyParam, pickupSchema, rejectSchema, returnSchema } from './loans.schema.js';

export const loansRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];
const sarpras = [...authed, requireRole('Sarpras')];
const key = validate(loanKeyParam, 'params');

loansRoutes.post('/', publicFormLimiter, validate(createLoanSchema), c.submit); // FSD-2.10 (publik, 5/jam/IP)
loansRoutes.get('/', ...authed, requireRole('Sarpras', 'PHT'), validate(listLoanQuery, 'query'), c.list); // FSD-2.11 (PHT baca saja)
loansRoutes.get('/:id', ...authed, requireRole('Sarpras', 'PHT'), key, c.get); // FSD-2.11
loansRoutes.post('/:id/approve', ...sarpras, key, validate(approveSchema), c.approve); // FSD-2.11
loansRoutes.post('/:id/reject', ...sarpras, key, validate(rejectSchema), c.reject); // FSD-2.11
loansRoutes.post('/:id/pickup', ...sarpras, key, validate(pickupSchema), c.pickup); // FSD-2.12
loansRoutes.post('/:id/return', ...sarpras, key, validate(returnSchema), c.returnLoan); // FSD-2.12
