import type { RequestHandler } from 'express';
import { COOKIE_NAME, type RoleName } from '../config/constants.js';
import { AppError } from '../lib/AppError.js';
import { verifyToken } from '../lib/jwt.js';
import { pool } from '../db/client.js';

/**
 * Wajib login. Membaca JWT dari cookie httpOnly kmk_token, lalu memastikan
 * token_version masih sama dengan DB (logout/reset menaikkan versi → token lama ditolak).
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new AppError('ERR-AUTH-01');
    const payload = verifyToken(token);

    const r = await pool.request().input('id', payload.sub).query(`
      SELECT u.user_id, u.username, u.full_name, u.is_active, u.token_version, u.must_change_password,
             (SELECT STRING_AGG(r.role_name, ',') FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id
              WHERE ur.user_id = u.user_id AND ur.revoked_at IS NULL) AS roles
      FROM users u WHERE u.user_id = @id`);
    const u = r.recordset[0];
    if (!u || !u.is_active || u.token_version !== payload.tv) throw new AppError('ERR-AUTH-01');

    req.user = {
      id: u.user_id,
      username: u.username,
      fullName: u.full_name,
      roles: (u.roles ? String(u.roles).split(',') : []) as RoleName[],
      mustChangePassword: !!u.must_change_password,
    };
    next();
  } catch (e) {
    next(e instanceof AppError ? e : new AppError('ERR-AUTH-01'));
  }
};
