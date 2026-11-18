import type { RequestHandler } from 'express';
import { AppError } from '../lib/AppError.js';

/** Akun dengan must_change_password hanya boleh ke /auth/me, /auth/password, /auth/logout (BR-06). */
const ALLOWED = ['/api/v1/auth/me', '/api/v1/auth/password', '/api/v1/auth/logout'];

export const enforcePasswordChange: RequestHandler = (req, _res, next) => {
  if (req.user?.mustChangePassword && !ALLOWED.includes(req.originalUrl.split('?')[0])) {
    return next(new AppError('ERR-AUTH-06'));
  }
  next();
};
