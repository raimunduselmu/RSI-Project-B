import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforcePasswordChange } from '../../middleware/mustChangePassword.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as c from './finance.controller.js';

export const financeRoutes = Router();
const authed = [requireAuth, enforcePasswordChange];

// Route statis ditulis sebelum route berparameter (/:id)
financeRoutes.get('/cash-transactions', ...authed, requireRole('Bendahara', 'PHT'), c.getCashTransactions); // FSD-2.32
financeRoutes.post('/cash-transactions', ...authed, requireRole('Bendahara'), c.postCashTransactions); // FSD-2.32
financeRoutes.get('/budgets', ...authed, requireRole('Bendahara', 'PHT'), c.getBudgets); // FSD-2.33
financeRoutes.post('/budgets', ...authed, requireRole('Bendahara'), c.postBudgets); // FSD-2.33
financeRoutes.get('/reports', ...authed, requireRole('Bendahara', 'PHT'), c.getReports); // FSD-2.34
