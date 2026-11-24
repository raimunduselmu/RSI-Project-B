// FSD-2.32 Kas Masuk/Keluar · FSD-2.33 Anggaran (alur over-budget) · FSD-2.34 Laporan
// Saldo & serapan hanya menghitung transaksi berstatus DISETUJUI. trg_budget_spent memperbarui budgets.spent_amount.
import { randomUUID } from 'node:crypto';
import { AppError } from '../../lib/AppError.js';
import { notifyRoles, notifyUsers } from '../../lib/notify.js';
import { removeFile } from '../../lib/storage.js';
import { isUniqueViolation, query, withTransaction } from '../../lib/sql.js';
import { todayWib } from '../../lib/time.js';
import type { AuthUser } from '../../types/express.js';
import type { CreateBudgetInput, CreateCashInput, ListCashQuery, UpdateBudgetInput } from './finance.schema.js';
import { rupiah } from '../../lib/format.js';

const ymd = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));

async function activePeriodId() {
  const rows = await query<{ period_id: number }>(`SELECT TOP 1 period_id FROM periods WHERE status = N'AKTIF' ORDER BY start_date DESC`);
  if (!rows[0]) throw new AppError('ERR-CFG-01', 'Belum ada periode kepengurusan yang aktif. Hubungi Admin');
  return rows[0].period_id;
}

/* ---------------- Anggaran (FSD-2.33) ---------------- */
const BUDGET_SELECT = `
  SELECT b.budget_id, b.period_id, p.period_name, b.pos_name, b.planned_amount, b.spent_amount,
         b.planned_amount - b.spent_amount AS remaining,
         CASE WHEN b.planned_amount > 0 THEN CAST(ROUND(b.spent_amount * 100.0 / b.planned_amount, 1) AS DECIMAL(6,1)) ELSE 0 END AS used_percent
  FROM budgets b JOIN periods p ON p.period_id = b.period_id`;

export async function listBudgets(periodId?: number) {
  const pid = periodId ?? (await activePeriodId());
  return query(`${BUDGET_SELECT} WHERE b.period_id = @p ORDER BY b.pos_name`, { p: pid });
}

async function getBudget(id: number) {
  const rows = await query(`${BUDGET_SELECT} WHERE b.budget_id = @id`, { id });
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Pos anggaran tidak ditemukan');
  return rows[0] as Record<string, unknown> & { budget_id: number; period_id: number; planned_amount: number; spent_amount: number };
}

export async function createBudget(input: CreateBudgetInput, user: AuthUser, ip?: string) {
  const periodId = input.period_id ?? (await activePeriodId());
  try {
    const rows = await withTransaction(user, ip, (tx) =>
      query<{ budget_id: number }>(
        `DECLARE @o TABLE (budget_id INT);
         INSERT INTO budgets (period_id, pos_name, planned_amount) OUTPUT inserted.budget_id INTO @o VALUES (@p, @n, @a);
         SELECT budget_id FROM @o;`,
        { p: periodId, n: input.pos_name, a: input.planned_amount },
        tx,
      ),
    );
    return getBudget(rows[0].budget_id);
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', undefined, { pos_name: ['Pos anggaran ini sudah ada di periode tersebut'] });
    throw e;
  }
}

export async function updateBudget(id: number, input: UpdateBudgetInput, user: AuthUser, ip?: string) {
  await getBudget(id);
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  if (input.pos_name !== undefined) { sets.push('pos_name = @n'); params.n = input.pos_name; }
  if (input.planned_amount !== undefined) { sets.push('planned_amount = @a'); params.a = input.planned_amount; }
  try {
    await withTransaction(user, ip, (tx) => query(`UPDATE budgets SET ${sets.join(', ')} WHERE budget_id = @id`, params, tx));
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', undefined, { pos_name: ['Pos anggaran ini sudah ada di periode tersebut'] });
    throw e;
  }
  return getBudget(id);
}

/* ---------------- Kas masuk/keluar (FSD-2.32) ---------------- */
const CASH_SELECT = `
  SELECT c.transaction_id, c.transaction_type, c.amount, c.category, c.budget_id, b.pos_name AS budget_name,
         c.transaction_date, c.period_id, c.source_ref, c.status, c.description, c.proof_path, c.created_at,
         u.full_name AS created_by_name
  FROM cash_transactions c LEFT JOIN budgets b ON b.budget_id = c.budget_id LEFT JOIN users u ON u.user_id = c.created_by`;

type CashRow = Record<string, unknown> & { transaction_id: string; transaction_date: unknown; proof_path: string | null; amount: number; status: string; created_by: string | null; description: string | null; transaction_type: string; category: string };
const mapCash = ({ proof_path, ...r }: CashRow) => ({ ...r, transaction_date: ymd(r.transaction_date), has_proof: !!proof_path });

export async function listCash(q: ListCashQuery, page: number, perPage: number) {
  const where: string[] = ['1=1'];
  const params: Record<string, unknown> = { off: (page - 1) * perPage, lim: perPage };
  if (q.type) { where.push('c.transaction_type = @t'); params.t = q.type; }
  if (q.status) { where.push('c.status = @s'); params.s = q.status; }
  if (q.budget_id) { where.push('c.budget_id = @b'); params.b = q.budget_id; }
  if (q.period_id) { where.push('c.period_id = @p'); params.p = q.period_id; }
  else if (!q.month) { where.push('c.period_id = @p'); params.p = await activePeriodId(); }
  if (q.month) {
    where.push('c.transaction_date >= @ms AND c.transaction_date < DATEADD(MONTH, 1, @ms)');
    params.ms = `${q.month}-01`;
  }
  if (q.q) { where.push('(c.category LIKE @q OR c.description LIKE @q OR c.source_ref LIKE @q)'); params.q = `%${q.q}%`; }
  const w = where.join(' AND ');
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM cash_transactions c WHERE ${w}`, params);
  const rows = await query<CashRow>(`${CASH_SELECT} WHERE ${w} ORDER BY c.transaction_date DESC, c.created_at DESC OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY`, params);
  return { rows: rows.map(mapCash), total };
}

export async function createCash(input: CreateCashInput, proofPath: string | null, user: AuthUser, ip?: string) {
  try {
    let periodId: number;
    let status = 'DISETUJUI';
    let overBudget: { name: string; remaining: number } | null = null;

    if (input.budget_id) {
      if (input.transaction_type !== 'KELUAR') throw new AppError('ERR-VAL-01', undefined, { budget_id: ['Pos anggaran hanya untuk kas keluar'] });
      const b = await getBudget(input.budget_id);
      periodId = b.period_id;
      const remaining = Number(b.planned_amount) - Number(b.spent_amount);
      if (input.amount > remaining) {
        // FSD-2.33 AF-1: melebihi anggaran → ERR-FIN-01, kecuali pengaju meminta persetujuan PHT
        if (!input.request_approval) throw new AppError('ERR-FIN-01', `Anggaran tidak mencukupi (sisa ${rupiah(remaining)}). Ajukan persetujuan PHT`, { amount: [`Sisa anggaran ${rupiah(remaining)}`] });
        status = 'MENUNGGU_PERSETUJUAN';
        overBudget = { name: String(b.pos_name), remaining };
      }
    } else {
      periodId = await activePeriodId();
    }

    const id = randomUUID();
    await withTransaction(user, ip, (tx) =>
      query(
        `INSERT INTO cash_transactions (transaction_id, transaction_type, amount, category, budget_id, transaction_date, proof_path, period_id, status, description, created_by)
         VALUES (@id, @t, @a, @c, @b, @d, @pf, @p, @s, @desc, @u)`,
        { id, t: input.transaction_type, a: input.amount, c: input.category, b: input.budget_id ?? null, d: input.transaction_date ?? todayWib(), pf: proofPath, p: periodId, s: status, desc: input.description ?? null, u: user.id },
        tx,
      ),
    );
    if (overBudget) {
      await notifyRoles(['PHT'], {
        type: 'CASH_OVER_BUDGET',
        title: 'Pengeluaran melebihi anggaran menunggu persetujuan',
        message: `${user.username} mengajukan kas keluar ${rupiah(input.amount)} pada pos "${overBudget.name}" (sisa ${rupiah(overBudget.remaining)}).`,
        relatedId: id,
      }, user.id);
    }
    return getCash(id);
  } catch (e) {
    await removeFile(proofPath);
    throw e;
  }
}

async function getCashRow(id: string) {
  const rows = await query<CashRow>(`${CASH_SELECT} WHERE c.transaction_id = @id`, { id });
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Transaksi kas tidak ditemukan');
  return rows[0];
}
export async function getCash(id: string) {
  return mapCash(await getCashRow(id));
}
export async function cashProofPath(id: string) {
  const r = await getCashRow(id);
  if (!r.proof_path) throw new AppError('ERR-DATA-01', 'Bukti tidak ditemukan');
  return r.proof_path;
}

/** PHT menyetujui/menolak pengeluaran yang melebihi anggaran (FSD-2.33 AF-1) */
export async function decideCash(id: string, approve: boolean, reason: string | null, user: AuthUser, ip?: string) {
  const r = await getCashRow(id);
  if (r.status !== 'MENUNGGU_PERSETUJUAN') throw new AppError('ERR-KAS-03', 'Transaksi ini tidak sedang menunggu persetujuan');
  if (r.created_by && r.created_by.toLowerCase() === user.id.toLowerCase() && !user.roles.includes('Admin')) {
    throw new AppError('ERR-AUTH-03', 'Anda tidak dapat menyetujui pengajuan Anda sendiri');
  }
  await withTransaction(user, ip, (tx) =>
    query(
      `UPDATE cash_transactions SET status = @s, description = CASE WHEN @note IS NULL THEN description ELSE CONCAT(ISNULL(description, N''), N' [Ditolak PHT: ', @note, N']') END
       WHERE transaction_id = @id AND status = N'MENUNGGU_PERSETUJUAN'`,
      { s: approve ? 'DISETUJUI' : 'DITOLAK', note: approve ? null : reason, id },
      tx,
    ),
  );
  if (r.created_by) {
    await notifyUsers([r.created_by], {
      type: approve ? 'CASH_APPROVED' : 'CASH_REJECTED',
      title: approve ? 'Pengeluaran disetujui PHT' : 'Pengeluaran ditolak PHT',
      message: `Kas keluar ${rupiah(Number(r.amount))} (${r.category}) ${approve ? 'disetujui' : `ditolak. Alasan: ${reason ?? '-'}`}.`,
      relatedId: id,
    });
  }
  return getCash(id);
}

/* ---------------- Laporan keuangan (FSD-2.34) ---------------- */
export async function report(periodId?: number) {
  const pid = periodId ?? (await activePeriodId());
  const [period] = await query<{ period_id: number; period_name: string; status: string }>(`SELECT period_id, period_name, status FROM periods WHERE period_id = @p`, { p: pid });
  if (!period) throw new AppError('ERR-DATA-01', 'Periode tidak ditemukan');

  const [sum] = await query<{ masuk: number; keluar: number }>(
    `SELECT ISNULL(SUM(CASE WHEN transaction_type = N'MASUK' THEN amount END), 0) AS masuk,
            ISNULL(SUM(CASE WHEN transaction_type = N'KELUAR' THEN amount END), 0) AS keluar
     FROM cash_transactions WHERE period_id = @p AND status = N'DISETUJUI'`,
    { p: pid },
  );
  const monthly = await query<{ bulan: string; masuk: number; keluar: number }>(
    `SELECT FORMAT(transaction_date, N'yyyy-MM') AS bulan,
            SUM(CASE WHEN transaction_type = N'MASUK' THEN amount ELSE 0 END) AS masuk,
            SUM(CASE WHEN transaction_type = N'KELUAR' THEN amount ELSE 0 END) AS keluar
     FROM cash_transactions WHERE period_id = @p AND status = N'DISETUJUI'
     GROUP BY FORMAT(transaction_date, N'yyyy-MM') ORDER BY bulan`,
    { p: pid },
  );
  const byCategory = await query(
    `SELECT transaction_type, category, SUM(amount) AS total, COUNT(*) AS jumlah
     FROM cash_transactions WHERE period_id = @p AND status = N'DISETUJUI'
     GROUP BY transaction_type, category ORDER BY transaction_type, total DESC`,
    { p: pid },
  );
  const budgets = await query(`${BUDGET_SELECT} WHERE b.period_id = @p ORDER BY b.pos_name`, { p: pid });
  const [pending] = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM cash_transactions WHERE period_id = @p AND status = N'MENUNGGU_PERSETUJUAN'`, { p: pid });
  let running = 0;
  return {
    period,
    ringkasan: { total_masuk: Number(sum.masuk), total_keluar: Number(sum.keluar), saldo: Number(sum.masuk) - Number(sum.keluar) },
    per_bulan: monthly.map((m) => {
      running += Number(m.masuk) - Number(m.keluar);
      return { bulan: m.bulan, masuk: Number(m.masuk), keluar: Number(m.keluar), saldo_akhir: running };
    }),
    per_kategori: byCategory,
    anggaran: budgets,
    menunggu_persetujuan: pending.c,
  };
}
