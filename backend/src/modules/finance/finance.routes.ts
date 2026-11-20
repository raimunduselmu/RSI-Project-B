import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import * as c from './finance.controller.js';
import { budgetIdParam, createBudgetSchema, createCashSchema, idParam, listBudgetQuery, listCashQuery, rejectCashSchema, reportQuery, updateBudgetSchema } from './finance.schema.js';

export const financeRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];
const view = [...authed, requireRole('Bendahara', 'PHT')];

// Route statis ditulis sebelum route berparameter (/:id)
financeRoutes.get('/cash-transactions', ...view, validate(listCashQuery, 'query'), c.getCashTransactions); // FSD-2.32
financeRoutes.post('/cash-transactions', ...authed, requireRole('Bendahara'), upload.single('proof'), validate(createCashSchema), c.postCashTransactions); // FSD-2.32
financeRoutes.get('/cash-transactions/:id', ...view, validate(idParam, 'params'), c.getCashTransactionsById); // FSD-2.32
financeRoutes.get('/cash-transactions/:id/proof', ...view, validate(idParam, 'params'), c.getCashTransactionsByIdProof); // FSD-2.32
financeRoutes.post('/cash-transactions/:id/approve', ...authed, requireRole('PHT'), validate(idParam, 'params'), c.postCashTransactionsByIdApprove); // FSD-2.33 AF-1
financeRoutes.post('/cash-transactions/:id/reject', ...authed, requireRole('PHT'), validate(idParam, 'params'), validate(rejectCashSchema), c.postCashTransactionsByIdReject); // FSD-2.33 AF-1
financeRoutes.get('/budgets', ...view, validate(listBudgetQuery, 'query'), c.getBudgets); // FSD-2.33
financeRoutes.post('/budgets', ...authed, requireRole('Bendahara'), validate(createBudgetSchema), c.postBudgets); // FSD-2.33
financeRoutes.patch('/budgets/:id', ...authed, requireRole('Bendahara'), validate(budgetIdParam, 'params'), validate(updateBudgetSchema), c.patchBudgetsById); // FSD-2.33
financeRoutes.get('/reports', ...view, validate(reportQuery, 'query'), c.getReports); // FSD-2.34
