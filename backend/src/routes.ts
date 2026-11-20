import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { assetsRoutes } from './modules/assets/assets.routes.js';
import { loansRoutes } from './modules/loans/loans.routes.js';
import { catalogRoutes } from './modules/catalog/catalog.routes.js';
import { scheduleRoutes } from './modules/schedule/schedule.routes.js';
import { usageReportsRoutes } from './modules/usage-reports/usage-reports.routes.js';
import { maintenanceRoutes } from './modules/maintenance/maintenance.routes.js';
import { incidentsRoutes } from './modules/incidents/incidents.routes.js';
import { stocktakesRoutes } from './modules/stocktakes/stocktakes.routes.js';
import { membersRoutes } from './modules/members/members.routes.js';
import { organizationRoutes } from './modules/organization/organization.routes.js';
import { liturgyRoutes } from './modules/liturgy/liturgy.routes.js';
import { eventsRoutes } from './modules/events/events.routes.js';
import { financeRoutes } from './modules/finance/finance.routes.js';
import { kasRoutes } from './modules/kas/kas.routes.js';
import { donationsRoutes } from './modules/donations/donations.routes.js';
import { documentsRoutes } from './modules/documents/documents.routes.js';
import { pastoralRoutes } from './modules/pastoral/pastoral.routes.js';
import { workflowsRoutes } from './modules/workflows/workflows.routes.js';
import { notificationsRoutes } from './modules/notifications/notifications.routes.js';
import { settingsRoutes } from './modules/settings/settings.routes.js';
import { publicRoutes } from './modules/public/public.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { requireCronSecret } from './middleware/internalSecret.js';
import { retryFailedEmails } from './jobs/retryEmail.js';
import { asyncHandler } from './lib/asyncHandler.js';
import { ok } from './lib/response.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => ok(res, { service: 'kmk-uns-api', time: new Date().toISOString() }));
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/assets', assetsRoutes);
apiRouter.use('/loans', loansRoutes);
apiRouter.use('/', catalogRoutes); // /asset-categories, /rooms
apiRouter.use('/', scheduleRoutes); // /availability, /calendar
apiRouter.use('/usage-reports', usageReportsRoutes);
apiRouter.use('/', maintenanceRoutes);
apiRouter.use('/incidents', incidentsRoutes);
apiRouter.use('/stocktakes', stocktakesRoutes);
apiRouter.use('/members', membersRoutes);
apiRouter.use('/', organizationRoutes);
apiRouter.use('/', liturgyRoutes);
apiRouter.use('/events', eventsRoutes);
apiRouter.use('/finance', financeRoutes);
apiRouter.use('/kas', kasRoutes);
apiRouter.use('/donations', donationsRoutes);
apiRouter.use('/documents', documentsRoutes);
apiRouter.use('/', pastoralRoutes);
apiRouter.use('/workflows', workflowsRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/public', publicRoutes);
apiRouter.use('/admin', auditRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

// Opsi B: dipanggil cron-job.org setiap menit (FSD-2.21)
apiRouter.post('/internal/notifications/retry', requireCronSecret, asyncHandler(async (_req, res) => {
  ok(res, { processed: await retryFailedEmails() });
}));
