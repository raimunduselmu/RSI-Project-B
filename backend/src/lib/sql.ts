import sql from 'mssql';
import { pool } from '../db/client.js';
import type { AuthUser } from '../types/express.js';

export { sql };

interface SpParam {
  type: sql.ISqlType | (() => sql.ISqlType);
  value?: unknown;
}

const SET_CTX = `
  EXEC sp_set_session_context N'user_id', @ctx_uid;
  EXEC sp_set_session_context N'username', @ctx_uname;
  EXEC sp_set_session_context N'ip_address', @ctx_ip;`;
const CLEAR_CTX = `
  EXEC sp_set_session_context N'user_id', NULL;
  EXEC sp_set_session_context N'username', NULL;
  EXEC sp_set_session_context N'ip_address', NULL;`;

/**
 * Memanggil stored procedure dalam SATU batch: SESSION_CONTEXT pelaku (user_id, username, ip)
 * diisi dulu agar trigger audit/riwayat tahu pelakunya (TSD 5), lalu dikosongkan lagi.
 * SP mengatur transaksinya sendiri (BEGIN/COMMIT/ROLLBACK), jadi di sini TIDAK dibungkus transaksi.
 *
 * Contoh:
 *   const { output } = await callProcedure('sp_approve_loan',
 *     { loan_id: { type: sql.UniqueIdentifier, value: id }, decision: { type: sql.NVarChar(10), value: 'SETUJU' } },
 *     { result: sql.NVarChar(30) }, req.user, req.ip);
 */
export async function callProcedure(
  name: string,
  input: Record<string, SpParam>,
  output: Record<string, sql.ISqlType | (() => sql.ISqlType)>,
  user?: AuthUser,
  ip?: string,
) {
  if (!/^[a-z_]+$/.test(name)) throw new Error(`Nama SP tidak valid: ${name}`);
  const req = pool.request();
  req.input('ctx_uid', sql.NVarChar(50), user?.id ?? null);
  req.input('ctx_uname', sql.NVarChar(150), user?.username ?? null);
  req.input('ctx_ip', sql.NVarChar(45), ip ?? null);
  for (const [k, p] of Object.entries(input)) req.input(k, p.type, p.value);
  for (const [k, t] of Object.entries(output)) req.output(k, t);
  const args = [
    ...Object.keys(input).map((k) => `@${k} = @${k}`),
    ...Object.keys(output).map((k) => `@${k} = @${k} OUTPUT`),
  ].join(', ');
  const result = await req.query(`${SET_CTX}
  BEGIN TRY
    EXEC dbo.${name} ${args};
  END TRY
  BEGIN CATCH
    ${CLEAR_CTX}
    THROW;
  END CATCH;
  ${CLEAR_CTX}`);
  return { output: (result.output ?? {}) as Record<string, unknown>, recordsets: result.recordsets };
}

export async function setSessionContext(req: sql.Request, user?: AuthUser, ip?: string) {
  await req
    .input('uid', sql.NVarChar(50), user?.id ?? null)
    .input('uname', sql.NVarChar(150), user?.username ?? null)
    .input('ip', sql.NVarChar(45), ip ?? null)
    .query(`
      EXEC sp_set_session_context N'user_id', @uid;
      EXEC sp_set_session_context N'username', @uname;
      EXEC sp_set_session_context N'ip_address', @ip;
    `);
}

/** Parameter query: nama → nilai. Tipe SQL ditebak mssql dari nilai JS. */
export type Params = Record<string, unknown>;

/** Query berparameter (SELECT/INSERT/UPDATE). Pakai `tx` bila di dalam transaksi. */
export async function query<T = Record<string, unknown>>(text: string, params: Params = {}, tx?: sql.Transaction): Promise<T[]> {
  const r = tx ? new sql.Request(tx) : pool.request();
  for (const [k, v] of Object.entries(params)) r.input(k, v);
  const res = await r.query(text);
  return (res.recordset ?? []) as T[];
}

/**
 * Menjalankan beberapa query dalam satu transaksi, dengan SESSION_CONTEXT pelaku
 * sudah terisi (dipakai trigger audit & riwayat aset).
 */
export async function withTransaction<T>(user: AuthUser | undefined, ip: string | undefined, fn: (tx: sql.Transaction) => Promise<T>): Promise<T> {
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    await setSessionContext(new sql.Request(tx), user, ip);
    const out = await fn(tx);
    await new sql.Request(tx).query(CLEAR_CTX);
    await tx.commit();
    return out;
  } catch (e) {
    await new sql.Request(tx).query(CLEAR_CTX).catch(() => undefined);
    await tx.rollback().catch(() => undefined);
    throw e;
  }
}

/** Pelanggaran UNIQUE / PRIMARY KEY di SQL Server (2627, 2601) */
export function isUniqueViolation(e: unknown) {
  const n = (e as { number?: number })?.number;
  return n === 2627 || n === 2601;
}
