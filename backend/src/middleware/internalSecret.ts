import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../lib/AppError.js';

/** Untuk endpoint yang dipanggil cron-job.org (Opsi B). */
export const requireCronSecret: RequestHandler = (req, _res, next) =>
  req.header('x-cron-secret') === env.INTERNAL_CRON_SECRET ? next() : next(new AppError('ERR-AUTH-03'));
