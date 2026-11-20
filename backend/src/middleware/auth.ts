import type { Request, RequestHandler } from 'express';
import { COOKIE_NAME, type RoleName } from '../config/constants.js';
import { AppError } from '../lib/AppError.js';
import { verifyToken } from '../lib/jwt.js';
import { pool } from '../db/client.js';
import type { AuthUser } from '../types/express.js';

/** Token dari cookie httpOnly kmk_token, atau header "Authorization: Bearer …" (untuk Swagger/Thunder Client, TSD 3.1) */
function readToken(req: Request): string | undefined {
  const cookie = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (cookie) return cookie;
  const h = req.header('authorization');
  return h?.startsWith('Bearer ') ? h.slice(7) : undefined;
}

/**
 * Validasi token + token_version (logout/reset menaikkan versi → token lama ditolak, BR-03).
 * Mengembalikan null bila token tidak sah.
 */
async function loadUser(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token);
  const r = await pool.request().input('id', payload.sub).query(`
    SELECT u.user_id, u.username, u.full_name, u.is_active, u.token_version, u.must_change_password,
           (SELECT STRING_AGG(r.role_name, ',') FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id
            WHERE ur.user_id = u.user_id AND ur.revoked_at IS NULL) AS roles
    FROM users u WHERE u.user_id = @id`);
  const u = r.recordset[0];
  if (!u || !u.is_active || u.token_version !== payload.tv) return null;
  return {
    id: u.user_id,
    username: u.username,
    fullName: u.full_name,
    roles: (u.roles ? String(u.roles).split(',') : []) as RoleName[],
    mustChangePassword: !!u.must_change_password,
  };
}

/** Wajib login. */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = readToken(req);
    if (!token) throw new AppError('ERR-AUTH-01');
    const user = await loadUser(token);
    if (!user) throw new AppError('ERR-AUTH-01');
    req.user = user;
    next();
  } catch (e) {
    next(e instanceof AppError ? e : new AppError('ERR-AUTH-01'));
  }
};

/**
 * Login opsional, untuk endpoint publik yang menampilkan data lebih lengkap bila
 * yang membuka adalah pengurus (contoh: GET /assets, GET /calendar). Tidak pernah menolak request.
 */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = readToken(req);
    if (token) {
      const user = await loadUser(token);
      if (user && !user.mustChangePassword) req.user = user;
    }
  } catch {
    /* token rusak/kedaluwarsa: perlakukan sebagai publik */
  }
  next();
};
