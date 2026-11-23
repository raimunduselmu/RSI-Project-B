// FSD-2.13 Lapor Pemakaian Internal — sp_report_usage (bentrok & status DIGUNAKAN), selesai → aset kembali
import { AppError } from '../../lib/AppError.js';
import { notifyRoles } from '../../lib/notify.js';
import { failResult } from '../../lib/spResult.js';
import { callProcedure, query, sql, withTransaction } from '../../lib/sql.js';
import type { AuthUser } from '../../types/express.js';
import type { CreateUsageInput, FinishUsageInput, ListUsageQuery } from './usage-reports.schema.js';

/** Sarpras/PHT (dan Admin) melihat semua laporan; pengurus lain hanya laporannya sendiri */
export const canSeeAll = (u: AuthUser) => u.roles.some((r) => ['Admin', 'Sarpras', 'PHT'].includes(r));

const SELECT = `
  SELECT ur.report_id, ur.reporter_user_id, ur.reporter_name, ur.reporter_phone, ur.division, ur.activity_name,
         ur.room_id, r.room_name, ur.start_at, ur.planned_end_at, ur.finished_at, ur.status, ur.created_at,
         CASE WHEN ur.status = N'BERLANGSUNG' AND ur.planned_end_at < SYSUTCDATETIME() THEN 1 ELSE 0 END AS is_overdue,
         (SELECT COUNT(*) FROM usage_report_items ui WHERE ui.report_id = ur.report_id) AS asset_count
  FROM usage_reports ur LEFT JOIN rooms r ON r.room_id = ur.room_id`;

type UsageRow = { report_id: string; reporter_user_id: string | null; status: string; activity_name: string; [k: string]: unknown };

export async function list(q: ListUsageQuery, user: AuthUser, page: number, perPage: number) {
  const where = ['1=1'];
  const params: Record<string, unknown> = { off: (page - 1) * perPage, lim: perPage };
  if (!canSeeAll(user) || q.mine === 'true') {
    where.push('ur.reporter_user_id = @me');
    params.me = user.id;
  }
  if (q.status) {
    where.push('ur.status = @s');
    params.s = q.status;
  }
  if (q.q) {
    where.push('(ur.activity_name LIKE @q OR ur.reporter_name LIKE @q OR ur.division LIKE @q)');
    params.q = `%${q.q}%`;
  }
  const w = where.join(' AND ');
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM usage_reports ur WHERE ${w}`, params);
  const rows = await query(`${SELECT} WHERE ${w} ORDER BY ur.start_at DESC OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY`, params);
  return { rows, total };
}

export async function get(id: string, user: AuthUser) {
  const rows = await query<UsageRow>(`${SELECT} WHERE ur.report_id = @id`, { id });
  const r = rows[0];
  if (!r || (!canSeeAll(user) && String(r.reporter_user_id).toLowerCase() !== user.id.toLowerCase())) {
    throw new AppError('ERR-DATA-01', 'Laporan pemakaian tidak ditemukan');
  }
  const items = await query(
    `SELECT ui.asset_id, a.asset_code, a.asset_name, a.status, ui.condition_after
     FROM usage_report_items ui JOIN assets a ON a.asset_id = ui.asset_id WHERE ui.report_id = @id ORDER BY a.asset_code`,
    { id },
  );
  return { ...r, items };
}

export async function create(input: CreateUsageInput, user: AuthUser, ip?: string) {
  const { output } = await callProcedure(
    'sp_report_usage',
    {
      reporter_id: { type: sql.UniqueIdentifier, value: user.id },
      reporter_name: { type: sql.NVarChar(150), value: input.reporter_name },
      reporter_phone: { type: sql.NVarChar(20), value: input.reporter_phone },
      division: { type: sql.NVarChar(100), value: input.division },
      activity_name: { type: sql.NVarChar(150), value: input.activity_name },
      room_id: { type: sql.Int, value: input.room_id ?? null },
      asset_ids: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(input.asset_ids) },
      start_at: { type: sql.DateTime2, value: input.start_at },
      planned_end_at: { type: sql.DateTime2, value: input.planned_end_at },
    },
    { report_id: sql.UniqueIdentifier, result: sql.NVarChar(30) },
    user,
    ip,
  );
  if (output.result !== 'SUCCESS') {
    if (output.result === 'TIME_CONFLICT') {
      // AF-1: tampilkan jadwal yang bertabrakan
      const conflicts = await query(
        `SELECT source, ref_code, start_at, end_at, conflict_on FROM dbo.fn_check_availability(@room, @assets, @start, @end, NULL) ORDER BY start_at`,
        { room: input.room_id ?? null, assets: JSON.stringify(input.asset_ids), start: input.start_at, end: input.planned_end_at },
      );
      throw new AppError('ERR-LOAN-01', undefined, { conflicts: conflicts.map((c) => JSON.stringify(c)) });
    }
    failResult(output.result, {
      INVALID_INPUT: ['ERR-VAL-01', 'Ruangan/aset tidak valid', { room_id: ['Ruangan tidak ditemukan atau nonaktif'] }],
      INVALID_TIME: ['ERR-VAL-04'],
      ASSET_UNAVAILABLE: ['ERR-LOAN-02'],
    });
  }
  return get(String(output.report_id), user);
}

/** Langkah 6 + AF-2: pelapor atau Sarpras menekan "Selesai" dan mengisi kondisi aset */
export async function finish(id: string, input: FinishUsageInput, user: AuthUser, ip?: string) {
  const report = await get(id, user);
  const isOwner = String(report.reporter_user_id).toLowerCase() === user.id.toLowerCase();
  if (!isOwner && !user.roles.some((r) => ['Admin', 'Sarpras'].includes(r))) throw new AppError('ERR-AUTH-03');
  if (report.status !== 'BERLANGSUNG') throw new AppError('ERR-USE-01');

  const cond = new Map(input.items.map((i) => [i.asset_id.toLowerCase(), i.condition_after]));
  const items = report.items as { asset_id: string; asset_code: string }[];
  const damaged: string[] = [];

  await withTransaction(user, ip, async (tx) => {
    const [{ n }] = await query<{ n: number }>(
      `UPDATE usage_reports SET status = N'SELESAI', finished_at = SYSUTCDATETIME() WHERE report_id = @id AND status = N'BERLANGSUNG';
       SELECT @@ROWCOUNT AS n;`,
      { id },
      tx,
    );
    if (!n) throw new AppError('ERR-USE-01');

    await query(`EXEC sp_set_session_context N'history_event', N'PENGEMBALIAN'`, {}, tx);
    for (const it of items) {
      const c = cond.get(it.asset_id.toLowerCase()) ?? 'BAIK';
      if (c !== 'BAIK') damaged.push(it.asset_code);
      await query(`UPDATE usage_report_items SET condition_after = @c WHERE report_id = @id AND asset_id = @a`, { c, id, a: it.asset_id }, tx);
      await query(
        `INSERT INTO asset_histories (asset_id, event_type, old_value, new_value, note, actor_user_id, actor_name)
         SELECT a.asset_id, N'PENGEMBALIAN',
                (SELECT a.status AS status, a.asset_condition AS kondisi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
                (SELECT CASE WHEN @c = N'BAIK' THEN N'TERSEDIA' ELSE N'PEMELIHARAAN' END AS status, @c AS kondisi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
                N'Selesai pemakaian internal', @u, ISNULL((SELECT full_name FROM users WHERE user_id = @u), N'Sistem')
         FROM assets a WHERE a.asset_id = @a AND a.status = N'DIGUNAKAN'`,
        { a: it.asset_id, c, u: user.id },
        tx,
      );
      // Hanya aset yang masih DIGUNAKAN yang dikembalikan (bisa saja sudah dilaporkan hilang di tengah jalan)
      await query(
        `UPDATE assets SET status = CASE WHEN @c = N'BAIK' THEN N'TERSEDIA' ELSE N'PEMELIHARAAN' END,
                asset_condition = @c, updated_at = SYSUTCDATETIME()
         WHERE asset_id = @a AND status = N'DIGUNAKAN'`,
        { a: it.asset_id, c },
        tx,
      );
    }
    await query(`EXEC sp_set_session_context N'history_event', NULL`, {}, tx);
  });

  if (damaged.length) {
    await notifyRoles(['Sarpras'], {
      type: 'USAGE_DAMAGED',
      title: 'Aset rusak setelah pemakaian internal',
      message: `${report.activity_name}: ${damaged.join(', ')} dikembalikan dalam kondisi rusak dan berstatus PEMELIHARAAN.`,
      relatedId: id,
    });
  }
  // Seperti FSD-2.12 AF-1: tawarkan pembuatan laporan kerusakan bila ada aset rusak
  return { ...(await get(id, user)), suggest_incident: damaged.length > 0, damaged_assets: damaged };
}
