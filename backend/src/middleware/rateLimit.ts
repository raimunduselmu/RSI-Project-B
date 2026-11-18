import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../config/constants.js';
import { AppError } from '../lib/AppError.js';

const handler = (_req: unknown, _res: unknown, next: (e: unknown) => void) => next(new AppError('ERR-RATE-01'));

/** Formulir publik: peminjaman, pendaftaran, intensi, pastoral (5/jam/IP) */
export const publicFormLimiter = rateLimit({ ...RATE_LIMIT.PUBLIC_FORM, standardHeaders: true, legacyHeaders: false, handler });

/** Cek Status (10/jam/IP) */
export const statusLimiter = rateLimit({ ...RATE_LIMIT.STATUS_CHECK, standardHeaders: true, legacyHeaders: false, handler });
