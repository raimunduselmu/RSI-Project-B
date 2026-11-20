import { Router } from 'express';
import { optionalAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as c from './schedule.controller.js';
import { availabilityQuery, calendarQuery } from './schedule.schema.js';

export const scheduleRoutes = Router();

scheduleRoutes.get('/availability', optionalAuth, validate(availabilityQuery, 'query'), c.availability); // FSD-2.9 (publik)
scheduleRoutes.get('/calendar', optionalAuth, validate(calendarQuery, 'query'), c.calendar); // FSD-2.9 (publik)
