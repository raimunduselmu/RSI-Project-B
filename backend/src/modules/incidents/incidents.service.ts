// FSD-2.15 Kelola Kehilangan & Kerusakan — trg_incident_after_insert mengubah status aset (BR-34)
import { randomUUID } from 'node:crypto';
import { AppError } from '../../lib/AppError.js';
import { findAsset, ymd } from '../../lib/assetRef.js';
import { notifyRoles, notifyUsers } from '../../lib/notify.js';
import { query, withTransaction } from '../../lib/sql.js';
import type { AuthUser } from '../../types/express.js';
import { isFutureDate, type CreateIncidentInput, type ListIncidentQuery, type UpdateIncidentInput } from './incidents.schema.js';

const canSeeAll = (u: AuthUser) => u.roles.some((r) => ['Admin', 'Sarpras', 'PHT'].includes(r));

const SELECT = `
  SELECT i.incident_id, i.asset_id, a.asset_code, a.asset_name, a.status AS asset_status, i.incident_type, i.occurred_date,
         i.description, i.reported_by, u.full_name AS reported_by_name, i.responsible_name, i.status, i.follow_up,
         i.resolved_at, i.created_at
  FROM incidents i JOIN assets a ON a.asset_id = i.asset_id LEFT JOIN users u ON u.user_id = i.reported_by`;

type IncidentRow = { [k: string]: unknown; incident_id: string; asset_id: string; asset_code: string; status: string; reported_by: string | null; occurred_date: unknown };
const mapRow = (r: IncidentRow) => ({ ...r, occurred_date: ymd(r.occurred_date) });

export async function list(q: ListIncidentQuery, user: AuthUser, page: number, perPage: number) {
  const where = ['1=1'];
  const params: Record<string, unknown> = { off: (page - 1) * perPage, lim: perPage };
  if (!canSeeAll(user)) {
    where.push('i.reported_by = @me');
    params.me = user.id;
  }
  if (q.status) { where.push('i.status = @s'); params.s = q.status; }
  if (q.open === 'true') where.push(`i.status IN (N'DILAPORKAN', N'DIPROSES')`);
  if (q.incident_type) { where.push('i.incident_type = @t'); params.t = q.incident_type; }
  if (q.asset_id) { where.push('i.asset_id = @a'); params.a = (await findAsset(q.asset_id)).asset_id; }
  const w = where.join(' AND ');
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM incidents i WHERE ${w}`, params);
  const rows = await query<IncidentRow>(`${SELECT} WHERE ${w} ORDER BY CASE i.status WHEN N'SELESAI' THEN 1 ELSE 0 END, i.created_at DESC OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY`, params);
  return { rows: rows.map(mapRow), total };
}

export async function get(id: string, user: AuthUser) {
  const rows = await query<IncidentRow>(`${SELECT} WHERE i.incident_id = @id`, { id });
  const r = rows[0];
  if (!r || (!canSeeAll(user) && String(r.reported_by).toLowerCase() !== user.id.toLowerCase())) {
    throw new AppError('ERR-DATA-01', 'Laporan tidak ditemukan');
  }
  return mapRow(r);
}

/** BR-36: penanggung jawab bawaan = peminjam / pengguna internal terakhir aset ini */
export async function suggestResponsible(assetKey: string) {
  const a = await findAsset(assetKey);
  const rows = await query<{ name: string; source: string; at: Date }>(
    `SELECT TOP 1 name, source, at FROM (
       SELECT lr.borrower_name AS name, N'PEMINJAMAN' AS source, COALESCE(lr.returned_at, lr.handed_over_at, lr.start_at) AS at
       FROM loan_items li JOIN loan_requests lr ON lr.loan_id = li.loan_id
       WHERE li.asset_id = @a AND lr.status IN (N'DIAMBIL', N'SELESAI')
       UNION ALL
       SELECT ur.reporter_name, N'PEMAKAIAN_INTERNAL', COALESCE(ur.finished_at, ur.start_at)
       FROM usage_report_items ui JOIN usage_reports ur ON ur.report_id = ui.report_id
       WHERE ui.asset_id = @a
     ) x ORDER BY at DESC`,
    { a: a.asset_id },
  );
  return { asset_id: a.asset_id, asset_code: a.asset_code, responsible_name: rows[0]?.name ?? null, source: rows[0]?.source ?? null, last_used_at: rows[0]?.at ?? null };
}

export async function create(input: CreateIncidentInput, user: AuthUser, ip?: string) {
  if (isFutureDate(input.occurred_date)) throw new AppError('ERR-VAL-04', 'Tanggal kejadian tidak boleh di masa depan', { occurred_date: ['Tanggal kejadian tidak boleh di masa depan'] });
  const asset = await findAsset(input.asset_id);
  if (asset.status === 'NONAKTIF') throw new AppError('ERR-VAL-01', 'Aset nonaktif tidak dapat dilaporkan', { asset_id: ['Aset nonaktif'] });
  const [dup] = await query<{ c: number }>(
    `SELECT COUNT(*) AS c FROM incidents WHERE asset_id = @a AND incident_type = @t AND status <> N'SELESAI'`,
    { a: asset.asset_id, t: input.incident_type },
  );
  if (dup.c > 0) throw new AppError('ERR-DATA-02', 'Sudah ada laporan yang belum selesai untuk aset ini', { asset_id: ['Laporan serupa masih terbuka'] });

  const responsible = input.responsible_name ?? (await suggestResponsible(asset.asset_id)).responsible_name;
  const id = randomUUID();
  await withTransaction(user, ip, (tx) =>
    query(
      `INSERT INTO incidents (incident_id, asset_id, incident_type, occurred_date, description, reported_by, responsible_name, status)
       VALUES (@id, @a, @t, @d, @desc, @u, @resp, N'DILAPORKAN')`,
      { id, a: asset.asset_id, t: input.incident_type, d: input.occurred_date, desc: input.description, u: user.id, resp: responsible ?? null },
      tx,
    ),
  );
  // Langkah 5: notifikasi ke Sarpras (aplikasi + email bila ada)
  await notifyRoles(
    ['Sarpras'],
    {
      type: 'INCIDENT_REPORTED',
      title: `Laporan ${input.incident_type === 'HILANG' ? 'kehilangan' : 'kerusakan'}: ${asset.asset_code}`,
      message: `${asset.asset_name} (${asset.asset_code}) dilaporkan ${input.incident_type.toLowerCase()} oleh ${user.username}. Status aset kini ${input.incident_type === 'HILANG' ? 'HILANG' : 'PEMELIHARAAN'}.`,
      relatedId: id,
    },
    user.id,
  );
  return get(id, user);
}

const ORDER: Record<string, number> = { DILAPORKAN: 0, DIPROSES: 1, SELESAI: 2 };

/** Langkah 6: tindak lanjut Sarpras. BR-35: SELESAI terkunci. AF-2: aset hilang ditemukan → TERSEDIA */
export async function update(id: string, input: UpdateIncidentInput, user: AuthUser, ip?: string) {
  const cur = await get(id, user);
  if (cur.status === 'SELESAI') throw new AppError('ERR-INC-01');
  if (input.status && ORDER[input.status] < ORDER[cur.status]) throw new AppError('ERR-VAL-01', 'Status laporan tidak bisa mundur', { status: ['Status tidak bisa mundur'] });

  await withTransaction(user, ip, async (tx) => {
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    if (input.status) { sets.push('status = @s'); params.s = input.status; }
    if (input.status === 'SELESAI') sets.push('resolved_at = SYSUTCDATETIME()');
    if (input.follow_up !== undefined) { sets.push('follow_up = @f'); params.f = input.follow_up; }
    if (input.responsible_name !== undefined) { sets.push('responsible_name = @r'); params.r = input.responsible_name; }
    const [{ n }] = await query<{ n: number }>(
      `UPDATE incidents SET ${sets.join(', ')} WHERE incident_id = @id AND status <> N'SELESAI'; SELECT @@ROWCOUNT AS n;`,
      params,
      tx,
    );
    if (!n) throw new AppError('ERR-INC-01');

    if (input.status === 'SELESAI' && (input.asset_status_after || input.asset_condition_after)) {
      // Perubahan aset dicatat trg_asset_history (UBAH_STATUS / UBAH_KONDISI)
      await query(
        `UPDATE assets SET status = COALESCE(CAST(@st AS NVARCHAR(20)), status), asset_condition = COALESCE(CAST(@co AS NVARCHAR(20)), asset_condition), updated_at = SYSUTCDATETIME()
         WHERE asset_id = @a`,
        { st: input.asset_status_after ?? null, co: input.asset_condition_after ?? null, a: cur.asset_id },
        tx,
      );
    }
  });

  if (cur.reported_by && String(cur.reported_by).toLowerCase() !== user.id.toLowerCase()) {
    await notifyUsers([String(cur.reported_by)], {
      type: 'INCIDENT_UPDATED',
      title: `Laporan ${cur.asset_code} ${input.status === 'SELESAI' ? 'selesai' : 'ditindaklanjuti'}`,
      message: input.follow_up ? `Tindak lanjut: ${input.follow_up}` : `Status laporan: ${input.status ?? cur.status}`,
      relatedId: id,
    });
  }
  return get(id, user);
}
