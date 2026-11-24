import { AppError } from '../../lib/AppError.js';
import { query } from '../../lib/sql.js';
import { monthRangeUtc } from '../../lib/time.js';
import type { AvailabilityQuery, CalendarQuery } from './schedule.schema.js';

/** Cek bentrok via fn_check_availability (BR-19, BR-22). Publik tidak melihat kode pengajuan orang lain. */
export async function availability(q: AvailabilityQuery, full: boolean) {
  if (q.room_id) {
    const [room] = await query<{ room_id: number }>(`SELECT room_id FROM rooms WHERE room_id = @r`, { r: q.room_id });
    if (!room) throw new AppError('ERR-DATA-01', 'Ruangan tidak ditemukan');
  }
  const rows = await query<{ source: string; ref_code: string; start_at: Date; end_at: Date; conflict_on: string }>(
    `SELECT source, ref_code, start_at, end_at, conflict_on
     FROM dbo.fn_check_availability(@room, @assets, @start, @end, NULL) ORDER BY start_at`,
    { room: q.room_id ?? null, assets: JSON.stringify(q.asset_ids), start: q.start_at, end: q.end_at },
  );
  return {
    available: rows.length === 0,
    conflicts: rows.map((r) => ({ source: r.source, conflict_on: r.conflict_on, start_at: r.start_at, end_at: r.end_at, ...(full ? { ref_code: r.ref_code } : {}) })),
  };
}

/** Kalender pemakaian ruangan/aset. Publik hanya melihat label "Terpakai" (BR-20). */
export async function calendar(q: CalendarQuery, full: boolean) {
  const r = monthRangeUtc(q.month);
  const rows = await query<{ source_type: string; ref_code: string; title: string; room_id: number | null; room_name: string | null; start_at: Date; end_at: Date; status: string }>(
    `SELECT source_type, ref_code, title, room_id, room_name, start_at, end_at, status
     FROM dbo.v_calendar_events
     WHERE start_at < @end AND end_at > @start AND (@room IS NULL OR room_id = @room)
     ORDER BY start_at`,
    { start: r.start, end: r.end, room: q.room_id ?? null },
  );
  return {
    month: r.month,
    events: rows.map((e) => ({
      source_type: e.source_type,
      title: full ? e.title : 'Terpakai',
      room_id: e.room_id,
      room_name: e.room_name,
      start_at: e.start_at,
      end_at: e.end_at,
      ...(full ? { ref_code: e.ref_code, status: e.status } : {}),
    })),
  };
}
