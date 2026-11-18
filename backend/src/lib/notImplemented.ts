import type { RequestHandler } from 'express';
import { AppError } from './AppError.js';

/** Placeholder endpoint yang belum dikerjakan → 501 ERR-SYS-02 */
export const notImplemented =
  (ref: string): RequestHandler =>
  (_req, _res, next) =>
    next(new AppError('ERR-SYS-02', `Belum diimplementasikan (${ref})`));
