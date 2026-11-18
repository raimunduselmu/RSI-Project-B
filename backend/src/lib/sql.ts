import sql from 'mssql';
import { pool } from '../db/client.js';
import type { AuthUser } from '../types/express.js';

export { sql };

interface SpParam {
  type: sql.ISqlType | (() => sql.ISqlType);
  value?: unknown;
}

/**
 * Memanggil stored procedure di dalam transaksi, setelah mengisi SESSION_CONTEXT
 * (user_id, username, ip_address) agar trigger audit tahu siapa pelakunya (TSD 5).
 *
 * Contoh:
 *   const out = await callProcedure('sp_approve_loan',
 *     { loan_id: { type: sql.UniqueIdentifier, value: id }, ... },
 *     { result: sql.NVarChar(30) }, req.user, req.ip);
 */
export async function callProcedure(
  name: string,
  input: Record<string, SpParam>,
  output: Record<string, sql.ISqlType | (() => sql.ISqlType)>,
  user?: AuthUser,
  ip?: string,
) {
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    await setSessionContext(new sql.Request(tx), user, ip);
    const req = new sql.Request(tx);
    for (const [k, p] of Object.entries(input)) req.input(k, p.type, p.value);
    for (const [k, t] of Object.entries(output)) req.output(k, t);
    const result = await req.execute(name);
    await tx.commit();
    return { output: result.output as Record<string, unknown>, recordsets: result.recordsets };
  } catch (e) {
    await tx.rollback().catch(() => undefined);
    throw e;
  }
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
