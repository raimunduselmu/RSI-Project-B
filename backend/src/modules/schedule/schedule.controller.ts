import { asyncHandler } from '../../lib/asyncHandler.js';
import { ok } from '../../lib/response.js';
import type { AvailabilityQuery, CalendarQuery } from './schedule.schema.js';
import * as service from './schedule.service.js';

export const availability = asyncHandler(async (req, res) =>
  ok(res, await service.availability(req.query as unknown as AvailabilityQuery, !!req.user)));

export const calendar = asyncHandler(async (req, res) =>
  ok(res, await service.calendar(req.query as unknown as CalendarQuery, !!req.user)));
