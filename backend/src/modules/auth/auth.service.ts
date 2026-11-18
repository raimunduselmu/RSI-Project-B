// FSD-2.1 Login, FSD-2.2 Logout, FSD-2.3 Ganti Password
import { LOGIN, type RoleName } from '../../config/constants.js';
import { pool } from '../../db/client.js';
import { AppError } from '../../lib/AppError.js';
import { signToken } from '../../lib/jwt.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import type { ChangePasswordInput, LoginInput } from './auth.schema.js';

async function writeAudit(userId: string | null, action: string, ip?: string) {
  await pool.request().input('u', userId).input('a', action).input('ip', ip ?? null).query(
    `INSERT INTO audit_logs (user_id, action_type, resource_type, ip_address) VALUES (@u, @a, N'auth', @ip)`);
}

export async function login({ username, password }: LoginInput, ip?: string) {
  const r = await pool.request().input('u', username).query(`
    SELECT user_id, username, full_name, password_hash, is_active, failed_attempts, locked_until,
           token_version, must_change_password
    FROM users WHERE username = @u`);
  const u = r.recordset[0];

  if (!u) {
    await writeAudit(null, 'LOGIN_FAILED', ip);
    throw new AppError('ERR-AUTH-02');
  }
  if (!u.is_active) throw new AppError('ERR-AUTH-05');
  if (u.locked_until && new Date(u.locked_until) > new Date()) throw new AppError('ERR-LOCK-01');

  if (!(await verifyPassword(password, u.password_hash))) {
    const fails = u.failed_attempts + 1;
    await pool.request().input('id', u.user_id).input('f', fails).input('m', LOGIN.LOCK_MINUTES).query(`
      UPDATE users SET failed_attempts = CASE WHEN @f >= ${LOGIN.MAX_FAILED} THEN 0 ELSE @f END,
             locked_until = CASE WHEN @f >= ${LOGIN.MAX_FAILED} THEN DATEADD(MINUTE, @m, SYSUTCDATETIME()) ELSE locked_until END
      WHERE user_id = @id`);
    await writeAudit(u.user_id, 'LOGIN_FAILED', ip);
    throw new AppError(fails >= LOGIN.MAX_FAILED ? 'ERR-LOCK-01' : 'ERR-AUTH-02');   // BR-01
  }

  const roles = await getRoles(u.user_id);
  await pool.request().input('id', u.user_id).query(
    `UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = SYSUTCDATETIME() WHERE user_id = @id`);
  await writeAudit(u.user_id, 'LOGIN_SUCCESS', ip);

  const token = signToken({ sub: u.user_id, username: u.username, roles, tv: u.token_version });
  return {
    token,
    user: { id: u.user_id, full_name: u.full_name, username: u.username, roles, must_change_password: !!u.must_change_password },
  };
}

export async function logout(userId: string, ip?: string) {
  // BR-03: token lama tidak berlaku lagi
  await pool.request().input('id', userId).query(`UPDATE users SET token_version = token_version + 1 WHERE user_id = @id`);
  await writeAudit(userId, 'LOGOUT', ip);
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const r = await pool.request().input('id', userId).query('SELECT password_hash FROM users WHERE user_id = @id');
  if (!r.recordset[0]) throw new AppError('ERR-DATA-01');
  if (!(await verifyPassword(input.current_password, r.recordset[0].password_hash))) throw new AppError('ERR-AUTH-04');

  const hash = await hashPassword(input.new_password);
  await pool.request().input('id', userId).input('h', hash).query(`
    UPDATE users SET password_hash = @h, must_change_password = 0, token_version = token_version + 1,
           updated_at = SYSUTCDATETIME()
    WHERE user_id = @id`);
}

export async function getRoles(userId: string): Promise<RoleName[]> {
  const r = await pool.request().input('id', userId).query(`
    SELECT r.role_name FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id
    WHERE ur.user_id = @id AND ur.revoked_at IS NULL`);
  return r.recordset.map((x) => x.role_name as RoleName);
}
