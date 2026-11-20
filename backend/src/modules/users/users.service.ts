// FSD-2.3 Reset Password · FSD-2.4 Kelola Pengguna (Admin)
import { randomUUID } from 'node:crypto';
import type { ROLES } from '../../config/constants.js';
import { AppError } from '../../lib/AppError.js';
import { hashPassword, tempPassword } from '../../lib/password.js';
import { isUniqueViolation, query, withTransaction } from '../../lib/sql.js';
import type { AuthUser } from '../../types/express.js';
import type { CreateUserInput, ListUserQuery, UpdateUserInput } from './users.schema.js';

type RoleName = (typeof ROLES)[number];
type Tx = Parameters<typeof query>[2];

const USER_SELECT = `
  SELECT u.user_id, u.full_name, u.username, u.email, u.phone, u.division, u.is_active, u.must_change_password,
         u.locked_until, u.last_login_at, u.created_at,
         (SELECT STRING_AGG(r.role_name, N',') WITHIN GROUP (ORDER BY r.role_name)
            FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id
            WHERE ur.user_id = u.user_id AND ur.revoked_at IS NULL) AS roles
  FROM users u`;

type UserRow = Record<string, unknown> & { user_id: string; is_active: boolean; roles: string | null; locked_until: Date | null };
const mapUser = (r: UserRow) => ({
  ...r,
  roles: r.roles ? r.roles.split(',') : [],
  is_locked: !!r.locked_until && r.locked_until > new Date(),
});

export async function listUsers(q: ListUserQuery, page: number, perPage: number) {
  const where: string[] = ['1=1'];
  const params: Record<string, unknown> = { off: (page - 1) * perPage, lim: perPage };
  if (q.q) {
    where.push('(u.full_name LIKE @q OR u.username LIKE @q OR u.email LIKE @q)');
    params.q = `%${q.q}%`;
  }
  if (q.is_active) {
    where.push('u.is_active = @act');
    params.act = q.is_active === 'true' ? 1 : 0;
  }
  if (q.role) {
    where.push(`EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id WHERE ur.user_id = u.user_id AND ur.revoked_at IS NULL AND r.role_name = @role)`);
    params.role = q.role;
  }
  const w = where.join(' AND ');
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM users u WHERE ${w}`, params);
  const rows = await query<UserRow>(`${USER_SELECT} WHERE ${w} ORDER BY u.full_name OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY`, params);
  return { rows: rows.map(mapUser), total };
}

export async function getUser(id: string) {
  const rows = await query<UserRow>(`${USER_SELECT} WHERE u.user_id = @id`, { id });
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Pengguna tidak ditemukan');
  return mapUser(rows[0]);
}

async function grantRoles(userId: string, roles: RoleName[], tx: Tx) {
  for (const r of roles) {
    await query(
      `INSERT INTO user_roles (user_id, role_id) SELECT @u, role_id FROM roles WHERE role_name = @r
       AND NOT EXISTS (SELECT 1 FROM user_roles x JOIN roles rr ON rr.role_id = x.role_id WHERE x.user_id = @u AND rr.role_name = @r AND x.revoked_at IS NULL)`,
      { u: userId, r },
      tx,
    );
  }
}

/** Jumlah Admin aktif selain `exceptUserId` (BR: minimal 1 Admin aktif) */
async function otherActiveAdmins(exceptUserId: string, tx?: Tx) {
  const [{ c }] = await query<{ c: number }>(
    `SELECT COUNT(DISTINCT u.user_id) AS c FROM users u
     JOIN user_roles ur ON ur.user_id = u.user_id AND ur.revoked_at IS NULL
     JOIN roles r ON r.role_id = ur.role_id AND r.role_name = N'Admin'
     WHERE u.is_active = 1 AND u.user_id <> @ex`,
    { ex: exceptUserId },
    tx,
  );
  return c;
}

export async function createUser(input: CreateUserInput, user: AuthUser, ip?: string) {
  const id = randomUUID();
  const temp = tempPassword();
  const hash = await hashPassword(temp);
  try {
    await withTransaction(user, ip, async (tx) => {
      await query(
        `INSERT INTO users (user_id, full_name, username, email, phone, division, password_hash, must_change_password, is_active)
         VALUES (@id, @n, @un, @em, @ph, @dv, @h, 1, 1)`,
        { id, n: input.full_name, un: input.username, em: input.email ?? null, ph: input.phone ?? null, dv: input.division ?? null, h: hash },
        tx,
      );
      await grantRoles(id, input.roles, tx);
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', undefined, { username: ['Username sudah dipakai'] });
    throw e;
  }
  return { user: await getUser(id), temporary_password: temp };
}

export async function updateUser(id: string, input: UpdateUserInput, user: AuthUser, ip?: string) {
  const before = await getUser(id);
  if (input.is_active === false && before.is_active) {
    if (id === user.id) throw new AppError('ERR-USR-02');
    if (before.roles.includes('Admin') && (await otherActiveAdmins(id)) < 1) throw new AppError('ERR-USR-01');
  }
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  const map: Record<string, string> = { full_name: 'full_name', email: 'email', phone: 'phone', division: 'division' };
  for (const [k, col] of Object.entries(map)) {
    if (k in input) {
      sets.push(`${col} = @${k}`);
      params[k] = (input as Record<string, unknown>)[k] ?? null;
    }
  }
  if (input.is_active !== undefined) {
    sets.push('is_active = @act');
    params.act = input.is_active ? 1 : 0;
    if (!input.is_active) sets.push('token_version = token_version + 1'); // sesi aktif langsung tidak berlaku (BR-03)
  }
  await withTransaction(user, ip, (tx) => query(`UPDATE users SET ${sets.join(', ')}, updated_at = SYSUTCDATETIME() WHERE user_id = @id`, params, tx));
  return getUser(id);
}

export async function setRoles(id: string, roles: RoleName[], user: AuthUser, ip?: string) {
  const before = await getUser(id);
  const removed = before.roles.filter((r) => !roles.includes(r as RoleName));
  if (removed.includes('Admin') && before.is_active && (await otherActiveAdmins(id)) < 1) throw new AppError('ERR-USR-01');
  await withTransaction(user, ip, async (tx) => {
    for (const r of removed) {
      await query(
        `UPDATE user_roles SET revoked_at = SYSUTCDATETIME()
         WHERE user_id = @u AND revoked_at IS NULL AND role_id = (SELECT role_id FROM roles WHERE role_name = @r)`,
        { u: id, r },
        tx,
      );
    }
    await grantRoles(id, roles, tx);
    await query(`UPDATE users SET token_version = token_version + 1, updated_at = SYSUTCDATETIME() WHERE user_id = @u`, { u: id }, tx);
  });
  return getUser(id);
}

/** FSD-2.3: password sementara baru, wajib diganti saat login berikutnya, akun dibuka kuncinya */
export async function resetPassword(id: string, user: AuthUser, ip?: string) {
  await getUser(id);
  const temp = tempPassword();
  const hash = await hashPassword(temp);
  await withTransaction(user, ip, (tx) =>
    query(
      `UPDATE users SET password_hash = @h, must_change_password = 1, failed_attempts = 0, locked_until = NULL,
              token_version = token_version + 1, updated_at = SYSUTCDATETIME() WHERE user_id = @id`,
      { h: hash, id },
      tx,
    ),
  );
  return { temporary_password: temp };
}
