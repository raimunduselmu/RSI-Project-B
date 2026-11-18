import { Router } from 'express';
import { statusLimiter } from '../../middleware/rateLimit.js';
import * as c from './public.controller.js';

export const publicRoutes = Router();

// Route statis ditulis sebelum route berparameter (/:id)
publicRoutes.get('/settings', c.getSettings); // FSD-2.45
publicRoutes.get('/events', c.getEvents); // FSD-2.30
publicRoutes.get('/calendar', c.getCalendar); // FSD-2.9
publicRoutes.get('/donor-transparency', c.getDonorTransparency); // FSD-2.42
publicRoutes.get('/status', statusLimiter, c.getStatus); // FSD-2.46
publicRoutes.post('/status/cancel', statusLimiter, c.postStatusCancel); // FSD-2.46
