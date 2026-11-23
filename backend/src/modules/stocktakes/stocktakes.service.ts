// FSD-2.17 Pemeriksaan Fisik Inventaris — BR-40 (satu periode TERBUKA), BR-41 (tutup → sp_close_stocktake)
import { randomUUID } from 'node:crypto';
import { AppError } from '../../lib/AppError.js';
import { ymd } from '../../lib/assetRef.js';
import { failResult } from '../../lib/spResult.js';
import { callProcedure, isUniqueViolation, query, sql, withTransaction } from '../../lib/sql.js';
import { todayWib } from '../../lib/time.js';
import type { AuthUser } from '../../types/express.js';
import type { CheckItemInput, ListItemsQuery } from './stocktakes.schema.js';

const SELECT = `
  SELECT p.period_id, p.period_name, p.start_date, p.end_date, p.status, p.closed_at, u.full_name AS created_by_name,
         (SELECT COUNT(*) FROM stocktake_items i WHERE i.period_id = p.period_id) AS total_items,
         (SELECT COUNT(*) FROM stocktake_items i WHERE i.period_id = p.period_id AND i.found = 1) AS ditemukan,
         (SELECT COUNT(*) FROM stocktake_items i WHERE i.period_id = p.period_id AND i.found = 0) AS tidak_ditemukan,
         (SELECT COUNT(*) FROM stocktake_items i WHERE i.period_id = p.period_id AND i.found IS NULL) AS belum_diperiksa
  FROM stocktake_periods p LEFT JOIN users u ON u.user_id = p.created_by`;

type PeriodRow = { [k: string]: unknown; period_id: string; status: string; start_date: unknown; end_date: unknown };
const mapPeriod = (r: PeriodRow) => ({ ...r, start_date: ymd(r.start_date), end_date: ymd(r.end_date) });

export async function list() {
  const rows = await query<PeriodRow>(`${SELECT} ORDER BY CASE p.status WHEN N'TERBUKA' THEN 0 ELSE 1 END, p.start_date DESC`);
  return rows.map(mapPeriod);
}

export async function get(id: string) {
  const rows = await query<PeriodRow>(`${SELECT} WHERE p.period_id = @id`, { id });
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Periode pemeriksaan tidak ditemukan');
  return mapPeriod(rows[0]);
}

/** Langkah 1–2: buka periode + daftar seluruh aset aktif (bukan NONAKTIF, tidak terhapus) */
export async function open(input: { period_name: string; start_date?: string }, user: AuthUser, ip?: string) {
  const [o] = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM stocktake_periods WHERE status = N'TERBUKA'`);
  if (o.c > 0) throw new AppError('ERR-STK-02');
  const id = randomUUID();
  try {
    await withTransaction(user, ip, async (tx) => {
      await query(
        `INSERT INTO stocktake_periods (period_id, period_name, start_date, status, created_by) VALUES (@id, @n, @d, N'TERBUKA', @u)`,
        { id, n: input.period_name, d: input.start_date ?? todayWib(), u: user.id },
        tx,
      );
      await query(
        `INSERT INTO stocktake_items (period_id, asset_id)
         SELECT @id, asset_id FROM assets WHERE is_deleted = 0 AND status <> N'NONAKTIF'`,
        { id },
        tx,
      );
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-STK-02'); // BR-40 (UQ_stocktake_one_open)
    throw e;
  }
  return get(id);
}

export async function listItems(id: string, q: ListItemsQuery, page: number, perPage: number) {
  await get(id);
  const where = ['i.period_id = @id'];
  const params: Record<string, unknown> = { id, off: (page - 1) * perPage, lim: perPage };
  if (q.q) { where.push('(a.asset_code LIKE @q OR a.asset_name LIKE @q)'); params.q = `%${q.q}%`; }
  if (q.state === 'BELUM') where.push('i.found IS NULL');
  if (q.state === 'DITEMUKAN') where.push('i.found = 1');
  if (q.state === 'TIDAK_DITEMUKAN') where.push('i.found = 0');
  const w = where.join(' AND ');
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM stocktake_items i JOIN assets a ON a.asset_id = i.asset_id WHERE ${w}`, params);
  const rows = await query(
    `SELECT i.item_id, i.asset_id, a.asset_code, a.asset_name, c.category_name,
            a.location_text AS recorded_location, a.asset_condition AS recorded_condition, a.status AS asset_status,
            i.found, i.actual_location, i.actual_condition, i.note, i.checked_at, u.full_name AS checked_by_name,
            CASE WHEN i.found = 1 AND (ISNULL(i.actual_location, a.location_text) <> a.location_text
                                       OR ISNULL(i.actual_condition, a.asset_condition) <> a.asset_condition) THEN 1 ELSE 0 END AS has_difference
     FROM stocktake_items i JOIN assets a ON a.asset_id = i.asset_id
     JOIN asset_categories c ON c.category_id = a.category_id
     LEFT JOIN users u ON u.user_id = i.checked_by
     WHERE ${w} ORDER BY CASE WHEN i.found IS NULL THEN 0 ELSE 1 END, a.asset_code
     OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY`,
    params,
  );
  return { rows, total };
}

async function assertOpenItem(periodId: string, itemId: string) {
  const p = await get(periodId);
  if (p.status !== 'TERBUKA') throw new AppError('ERR-STK-01');
  const [it] = await query<{ item_id: string }>(`SELECT item_id FROM stocktake_items WHERE item_id = @it AND period_id = @p`, { it: itemId, p: periodId });
  if (!it) throw new AppError('ERR-DATA-01', 'Aset tidak ada dalam periode ini');
}

/** Langkah 4: tandai ditemukan/tidak + lokasi & kondisi aktual. Kosong = sama dengan data tercatat */
export async function checkItem(periodId: string, itemId: string, input: CheckItemInput, user: AuthUser, ip?: string) {
  await assertOpenItem(periodId, itemId);
  await withTransaction(user, ip, (tx) =>
    query(
      `UPDATE i SET found = @f,
              actual_location = CASE WHEN @f = 1 THEN ISNULL(@loc, a.location_text) END,
              actual_condition = CASE WHEN @f = 1 THEN ISNULL(@cond, a.asset_condition) END,
              note = @note, checked_by = @u, checked_at = SYSUTCDATETIME()
       FROM stocktake_items i JOIN assets a ON a.asset_id = i.asset_id
       JOIN stocktake_periods p ON p.period_id = i.period_id AND p.status = N'TERBUKA'
       WHERE i.item_id = @it`,
      { f: input.found ? 1 : 0, loc: input.actual_location ?? null, cond: input.actual_condition ?? null, note: input.note ?? null, u: user.id, it: itemId },
      tx,
    ),
  );
  const [row] = await query(
    `SELECT i.item_id, a.asset_code, a.asset_name, i.found, i.actual_location, i.actual_condition, i.note, i.checked_at
     FROM stocktake_items i JOIN assets a ON a.asset_id = i.asset_id WHERE i.item_id = @it`,
    { it: itemId },
  );
  return { ...row, suggest_incident: !input.found }; // AF-1: tawarkan laporan kehilangan
}

/** Aset yang tidak bisa diperiksa cukup diberi catatan (BR-41) */
export async function noteItem(periodId: string, itemId: string, note: string, user: AuthUser, ip?: string) {
  await assertOpenItem(periodId, itemId);
  await withTransaction(user, ip, (tx) =>
    query(`UPDATE stocktake_items SET note = @n, checked_by = @u, checked_at = SYSUTCDATETIME() WHERE item_id = @it`, { n: note, u: user.id, it: itemId }, tx),
  );
  return { item_id: itemId, note };
}

/** Langkah 5–6: tutup periode → sp_close_stocktake menyesuaikan aset & menghitung selisih */
export async function close(id: string, user: AuthUser, ip?: string) {
  const { output } = await callProcedure(
    'sp_close_stocktake',
    { period_id: { type: sql.UniqueIdentifier, value: id }, actor_id: { type: sql.UniqueIdentifier, value: user.id } },
    { summary: sql.NVarChar(sql.MAX), result: sql.NVarChar(30) },
    user,
    ip,
  );
  if (output.result !== 'SUCCESS') {
    if (output.result === 'UNCHECKED_ITEMS') {
      const [{ c }] = await query<{ c: number }>(
        `SELECT COUNT(*) AS c FROM stocktake_items WHERE period_id = @id AND found IS NULL AND NULLIF(LTRIM(RTRIM(note)), N'') IS NULL`,
        { id },
      );
      throw new AppError('ERR-STK-03', `Masih ada ${c} aset yang belum diperiksa atau belum diberi catatan`);
    }
    failResult(output.result, { NOT_FOUND: ['ERR-DATA-01', 'Periode pemeriksaan tidak ditemukan'], ALREADY_CLOSED: ['ERR-STK-01'] });
  }
  const missing = await query(
    `SELECT i.asset_id, a.asset_code, a.asset_name, a.status AS asset_status, i.note,
            (SELECT COUNT(*) FROM incidents x WHERE x.asset_id = i.asset_id AND x.incident_type = N'HILANG' AND x.status <> N'SELESAI') AS open_loss_reports
     FROM stocktake_items i JOIN assets a ON a.asset_id = i.asset_id WHERE i.period_id = @id AND i.found = 0 ORDER BY a.asset_code`,
    { id },
  );
  return {
    period: await get(id),
    summary: JSON.parse(String(output.summary ?? '{}')),
    /** AF-1: aset tidak ditemukan → Sarpras dapat membuat laporan kehilangan (POST /incidents) */
    not_found_assets: missing,
  };
}
