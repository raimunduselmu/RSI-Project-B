// FSD-2.14 Kelola Jadwal Pemeliharaan — BR-32 (fn_next_maintenance_date), BR-33 (log wajib lengkap)
import { randomUUID } from 'node:crypto';
import { AppError } from '../../lib/AppError.js';
import { findAsset, ymd } from '../../lib/assetRef.js';
import { notifyRoles } from '../../lib/notify.js';
import { query, withTransaction } from '../../lib/sql.js';
import { todayWib } from '../../lib/time.js';
import type { AuthUser } from '../../types/express.js';
import type { CreateLogInput, CreateScheduleInput, ListScheduleQuery, UpdateScheduleInput } from './maintenance.schema.js';

const SELECT = `
  SELECT s.schedule_id, s.asset_id, a.asset_code, a.asset_name, a.status AS asset_status, a.asset_condition,
         s.task_name, s.interval_days, s.next_due_date, s.last_done_date, s.reminder_days_before, s.is_active, s.created_at,
         DATEDIFF(DAY, CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE), s.next_due_date) AS days_until_due
  FROM maintenance_schedules s JOIN assets a ON a.asset_id = s.asset_id`;

type ScheduleRow = { [k: string]: unknown; schedule_id: string; task_name: string; asset_id: string; interval_days: number; is_active: boolean; next_due_date: unknown; last_done_date: unknown; days_until_due: number };
const mapSchedule = (r: ScheduleRow) => ({
  ...r,
  next_due_date: ymd(r.next_due_date),
  last_done_date: ymd(r.last_done_date),
  due_state: !r.is_active ? 'NONAKTIF' : r.days_until_due < 0 ? 'TERLAMBAT' : r.days_until_due <= 7 ? 'SEGERA' : 'TERJADWAL',
});

export async function list(q: ListScheduleQuery, page: number, perPage: number) {
  const where = ['a.is_deleted = 0'];
  const params: Record<string, unknown> = { off: (page - 1) * perPage, lim: perPage, today: todayWib() };
  if (q.asset_id) {
    where.push('s.asset_id = @asset');
    params.asset = (await findAsset(q.asset_id)).asset_id;
  }
  if (q.is_active) {
    where.push('s.is_active = @act');
    params.act = q.is_active === 'true' ? 1 : 0;
  }
  if (q.due_within_days !== undefined) {
    where.push('s.is_active = 1 AND s.next_due_date <= DATEADD(DAY, @within, @today)');
    params.within = q.due_within_days;
  }
  if (q.overdue === 'true') where.push('s.is_active = 1 AND s.next_due_date < @today');
  const w = where.join(' AND ');
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM maintenance_schedules s JOIN assets a ON a.asset_id = s.asset_id WHERE ${w}`, params);
  const rows = await query<ScheduleRow>(`${SELECT} WHERE ${w} ORDER BY s.is_active DESC, s.next_due_date OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY`, params);
  return { rows: rows.map(mapSchedule), total };
}

export async function get(id: string) {
  const rows = await query<ScheduleRow>(`${SELECT} WHERE s.schedule_id = @id`, { id });
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Jadwal pemeliharaan tidak ditemukan');
  return mapSchedule(rows[0]);
}

export async function create(input: CreateScheduleInput, user: AuthUser, ip?: string) {
  const asset = await findAsset(input.asset_id);
  let interval = input.interval_days;
  if (!interval) {
    // AF-1: default dari kategori aset
    const [cat] = await query<{ d: number | null }>(`SELECT maintenance_default_days AS d FROM asset_categories WHERE category_id = @c`, { c: asset.category_id });
    interval = cat?.d ?? undefined;
    if (!interval) throw new AppError('ERR-VAL-01', undefined, { interval_days: ['Isi interval: kategori aset ini tidak punya interval bawaan'] });
  }
  const id = randomUUID();
  await withTransaction(user, ip, (tx) =>
    query(
      `INSERT INTO maintenance_schedules (schedule_id, asset_id, task_name, interval_days, next_due_date, reminder_days_before, is_active)
       VALUES (@id, @a, @t, @i, @d, @r, 1)`,
      { id, a: asset.asset_id, t: input.task_name, i: interval, d: input.next_due_date, r: input.reminder_days_before ?? 7 },
      tx,
    ),
  );
  return get(id);
}

export async function update(id: string, input: UpdateScheduleInput, user: AuthUser, ip?: string) {
  await get(id);
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  const cols: Record<string, string> = { task_name: 'task_name', interval_days: 'interval_days', next_due_date: 'next_due_date', reminder_days_before: 'reminder_days_before' };
  for (const [k, col] of Object.entries(cols)) {
    const v = (input as Record<string, unknown>)[k];
    if (v !== undefined) {
      sets.push(`${col} = @${k}`);
      params[k] = v;
    }
  }
  if (input.is_active !== undefined) {
    sets.push('is_active = @act');
    params.act = input.is_active ? 1 : 0;
  }
  await withTransaction(user, ip, (tx) => query(`UPDATE maintenance_schedules SET ${sets.join(', ')} WHERE schedule_id = @id`, params, tx));
  return get(id);
}

export async function listLogs(id: string) {
  await get(id);
  const rows = await query<Record<string, unknown> & { performed_date: unknown }>(
    `SELECT log_id, schedule_id, asset_id, performed_date, performed_by, result_condition, notes, created_at
     FROM maintenance_logs WHERE schedule_id = @id ORDER BY performed_date DESC, created_at DESC`,
    { id },
  );
  return rows.map((r) => ({ ...r, performed_date: ymd(r.performed_date) }));
}

/** Langkah 4–6: catat pelaksanaan → log, last_done_date, next_due_date (BR-32), kondisi aset, riwayat PEMELIHARAAN */
export async function createLog(id: string, input: CreateLogInput, user: AuthUser, ip?: string) {
  const s = await get(id);
  if (!s.is_active) throw new AppError('ERR-VAL-01', 'Jadwal ini nonaktif. Aktifkan dulu sebelum mencatat pelaksanaan');
  const logId = randomUUID();
  await withTransaction(user, ip, async (tx) => {
    await query(
      `INSERT INTO maintenance_logs (log_id, schedule_id, asset_id, performed_date, performed_by, result_condition, notes)
       VALUES (@log, @s, @a, @d, @by, @c, @n)`,
      { log: logId, s: id, a: s.asset_id, d: input.performed_date, by: input.performed_by, c: input.result_condition, n: input.notes ?? null },
      tx,
    );
    await query(
      `UPDATE maintenance_schedules
       SET last_done_date = @d, next_due_date = dbo.fn_next_maintenance_date(@d, interval_days)
       WHERE schedule_id = @s`,
      { d: input.performed_date, s: id },
      tx,
    );
    // Kondisi aset mengikuti hasil; aset PEMELIHARAAN yang hasilnya BAIK kembali TERSEDIA
    await query(`EXEC sp_set_session_context N'history_event', N'PEMELIHARAAN'`, {}, tx);
    await query(
      `INSERT INTO asset_histories (asset_id, event_type, old_value, new_value, note, actor_user_id, actor_name)
       SELECT a.asset_id, N'PEMELIHARAAN',
              (SELECT a.status AS status, a.asset_condition AS kondisi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
              (SELECT CASE WHEN a.status = N'PEMELIHARAAN' AND @c = N'BAIK' THEN N'TERSEDIA' ELSE a.status END AS status, @c AS kondisi
               FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
              CONCAT(@task, N' oleh ', @by, CASE WHEN @n IS NULL THEN N'' ELSE N' · ' + @n END), @u,
              ISNULL((SELECT full_name FROM users WHERE user_id = @u), N'Sistem')
       FROM assets a WHERE a.asset_id = @a`,
      { a: s.asset_id, c: input.result_condition, task: String(s.task_name), by: input.performed_by, n: input.notes ?? null, u: user.id },
      tx,
    );
    await query(
      `UPDATE assets SET asset_condition = @c,
              status = CASE WHEN status = N'PEMELIHARAAN' AND @c = N'BAIK' THEN N'TERSEDIA' ELSE status END,
              updated_at = SYSUTCDATETIME()
       WHERE asset_id = @a`,
      { a: s.asset_id, c: input.result_condition },
      tx,
    );
    await query(`EXEC sp_set_session_context N'history_event', NULL`, {}, tx);
  });
  return { schedule: await get(id), log_id: logId };
}

/**
 * Pengingat harian (dipanggil penjadwal 07:00 WIB): jadwal yang jatuh tempo tepat H-reminder_days_before
 * atau tepat hari ini → notifikasi + email ke Sarpras. Mengembalikan jumlah jadwal yang diingatkan.
 */
export async function remindDueMaintenance() {
  const rows = await query<{ schedule_id: string; task_name: string; asset_code: string; asset_name: string; next_due_date: unknown; days: number }>(
    `SELECT s.schedule_id, s.task_name, a.asset_code, a.asset_name, s.next_due_date,
            DATEDIFF(DAY, @today, s.next_due_date) AS days
     FROM maintenance_schedules s JOIN assets a ON a.asset_id = s.asset_id AND a.is_deleted = 0
     WHERE s.is_active = 1 AND (s.next_due_date = @today OR DATEADD(DAY, -s.reminder_days_before, s.next_due_date) = @today)`,
    { today: todayWib() },
  );
  for (const r of rows) {
    await notifyRoles(['Sarpras'], {
      type: 'MAINTENANCE_DUE',
      title: r.days === 0 ? `Pemeliharaan jatuh tempo hari ini: ${r.asset_code}` : `Pemeliharaan ${r.asset_code} dalam ${r.days} hari`,
      message: `${r.task_name} untuk ${r.asset_name} (${r.asset_code}) jatuh tempo ${ymd(r.next_due_date)}.`,
      relatedId: r.schedule_id,
    });
  }
  return rows.length;
}
