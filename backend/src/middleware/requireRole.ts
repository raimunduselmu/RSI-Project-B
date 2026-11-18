import type { RequestHandler } from 'express';
import type { RoleName } from '../config/constants.js';
import { AppError } from '../lib/AppError.js';

/** Izinkan bila pengguna memiliki salah satu role. Admin selalu lolos. Pakai setelah requireAuth. */
export const requireRole =
  (...allowed: RoleName[]): RequestHandler =>
  (req, _res, next) => {
    const roles = req.user?.roles ?? [];
    if (roles.includes('Admin') || roles.some((r) => allowed.includes(r))) return next();
    next(new AppError('ERR-AUTH-03'));
  };
