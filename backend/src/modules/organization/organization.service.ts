// FSD-2.25 — Kelola Periode, Divisi & Jabatan Kepengurusan (+ penetapan pengurus & role otomatis BR-115)
// Data periode ARSIP read-only: dijaga trg_block_archived_period (DB) dan pengecekan di sini (officers).
import { randomUUID } from 'node:crypto';
import { AppError } from '../../lib/AppError.js';
import { isUniqueViolation, query, sql, withTransaction } from '../../lib/sql.js';
import { todayWib } from '../../lib/time.js';
import type { AuthUser } from '../../types/express.js';
import { syncKasDues } from '../kas/kas.service.js';
import type {
  CreateDivisionInput,
  CreateOfficerInput,
  CreatePeriodInput,
  CreatePositionInput,
  ListOfficerQuery,
  UpdateDivisionInput,
  UpdateOfficerInput,
  UpdatePeriodInput,
} from './organization.schema.js';

type Tx = sql.Transaction;

interface PeriodRow {
  period_id: number;
  period_name: string;
  start_date: string;
  end_date: string;
  status: 'AKTIF' | 'ARSIP';
}

/** DATE dari mssql bisa berupa Date; samakan ke 'YYYY-MM-DD' */
const ymd = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));

/* ---------------- helper ---------------- */
export async function activePeriod(tx?: Tx) {
  const rows = await query<PeriodRow>(`SELECT period_id, period_name, start_date, end_date, status FROM periods WHERE status = N'AKTIF'`, {}, tx);
  return rows[0] ? { ...rows[0], start_date: ymd(rows[0].start_date), end_date: ymd(rows[0].end_date) } : null;
}

async function getPeriodRow(id: number, tx?: Tx) {
  const rows = await query<PeriodRow>(`SELECT period_id, period_name, start_date, end_date, status FROM periods WHERE period_id = @id`, { id }, tx);
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Periode tidak ditemukan');
  return { ...rows[0], start_date: ymd(rows[0].start_date), end_date: ymd(rows[0].end_date) };
}

function assertNotArchived(p: { status: string }) {
  if (p.status === 'ARSIP') throw new AppError('ERR-DATA-04');
}

async function roleIdOf(name: string | null | undefined, tx?: Tx) {
  if (!name) return null;
  const rows = await query<{ role_id: number }>(`SELECT role_id FROM roles WHERE role_name = @name`, { name }, tx);
  return rows[0]?.role_id ?? null;
}

/** Akun tanpa role aktif dinonaktifkan (BR-116); token_version naik agar sesi lama berakhir */
async function deactivateIfNoRole(userId: string, tx: Tx) {
  await query(
    `UPDATE users SET is_active = 0, token_version = token_version + 1, updated_at = SYSUTCDATETIME()
     WHERE user_id = @u AND is_active = 1
       AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = @u AND revoked_at IS NULL)`,
    { u: userId },
    tx,
  );
}

/** Berikan role efektif jabatan (positions.role_id, bila kosong divisions.role_id) ke akun pengurus */
async function grantOfficerRole(officerId: string, userId: string, tx: Tx) {
  await query(
    `INSERT INTO user_roles (user_id, role_id, officer_id)
     SELECT @u, COALESCE(ps.role_id, dv.role_id), o.officer_id
     FROM officers o JOIN positions ps ON ps.position_id = o.position_id JOIN divisions dv ON dv.division_id = ps.division_id
     WHERE o.officer_id = @o AND COALESCE(ps.role_id, dv.role_id) IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.officer_id = o.officer_id AND ur.revoked_at IS NULL);
     UPDATE users SET is_active = 1, updated_at = SYSUTCDATETIME() WHERE user_id = @u AND is_active = 0;`,
    { o: officerId, u: userId },
    tx,
  );
}

/** Tautkan akun ke data umat (satu akun hanya untuk satu umat) */
async function linkMemberUser(memberId: string, memberUserId: string | null, userId: string, tx: Tx) {
  if (memberUserId && memberUserId.toLowerCase() !== userId.toLowerCase()) {
    throw new AppError('ERR-VAL-01', 'Data umat sudah tertaut ke akun lain', { user_id: ['Data umat sudah tertaut ke akun lain'] });
  }
  const users = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM users WHERE user_id = @u`, { u: userId }, tx);
  if (!users[0]?.n) throw new AppError('ERR-DATA-01', 'Akun tidak ditemukan');
  const other = await query(`SELECT 1 AS x FROM members WHERE user_id = @u AND member_id <> @m AND is_deleted = 0`, { u: userId, m: memberId }, tx);
  if (other.length) throw new AppError('ERR-VAL-01', 'Akun sudah tertaut ke data umat lain', { user_id: ['Akun sudah tertaut ke data umat lain'] });
  if (!memberUserId) await query(`UPDATE members SET user_id = @u WHERE member_id = @m`, { u: userId, m: memberId }, tx);
}

/* ---------------- Periode ---------------- */
export async function listPeriods() {
  const rows = await query<PeriodRow & Record<string, unknown>>(
    `SELECT p.period_id, p.period_name, p.start_date, p.end_date, p.status, p.closed_at,
            (SELECT COUNT(*) FROM divisions dv WHERE dv.period_id = p.period_id) AS division_count,
            (SELECT COUNT(*) FROM officers o JOIN positions ps ON ps.position_id = o.position_id
               JOIN divisions dv ON dv.division_id = ps.division_id
             WHERE dv.period_id = p.period_id AND (o.end_date IS NULL OR o.end_date >= @today)) AS active_officer_count
     FROM periods p ORDER BY p.start_date DESC`,
    { today: todayWib() },
  );
  return rows.map((r) => ({ ...r, start_date: ymd(r.start_date), end_date: ymd(r.end_date) }));
}

export async function createPeriod(input: CreatePeriodInput, user: AuthUser, ip?: string) {
  if (await activePeriod()) throw new AppError('ERR-DATA-02', 'Masih ada periode AKTIF. Arsipkan periode tersebut terlebih dahulu');
  try {
    const rows = await withTransaction(user, ip, (tx) =>
      query<{ period_id: number }>(
        `DECLARE @t TABLE (period_id INT);
         INSERT INTO periods (period_name, start_date, end_date, status) OUTPUT inserted.period_id INTO @t VALUES (@name, @start, @end, N'AKTIF');
         SELECT period_id FROM @t;`,
        { name: input.period_name, start: input.start_date, end: input.end_date },
        tx,
      ),
    );
    return getPeriodRow(rows[0].period_id);
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', 'Nama periode sudah terdaftar atau masih ada periode AKTIF');
    throw e;
  }
}

export async function updatePeriod(id: number, input: UpdatePeriodInput, user: AuthUser, ip?: string) {
  const p = await getPeriodRow(id);
  assertNotArchived(p);
  const start = input.start_date ?? p.start_date;
  const end = input.end_date ?? p.end_date;
  if (end <= start) throw new AppError('ERR-VAL-04', undefined, { end_date: ['Tanggal selesai harus setelah tanggal mulai'] });
  try {
    await withTransaction(user, ip, (tx) =>
      query(`UPDATE periods SET period_name = @name, start_date = @start, end_date = @end WHERE period_id = @id`, { id, name: input.period_name ?? p.period_name, start, end }, tx),
    );
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', 'Nama periode sudah terdaftar');
    throw e;
  }
  if (p.status === 'AKTIF') await syncKasDues(null, user, ip); // rentang bulan tagihan ikut berubah
  return getPeriodRow(id);
}

/** FSD-2.25 AF-1: arsipkan periode → read-only; trigger mencabut role & menonaktifkan akun tanpa role */
export async function archivePeriod(id: number, confirmName: string, user: AuthUser, ip?: string) {
  const p = await getPeriodRow(id);
  assertNotArchived(p);
  if (confirmName !== p.period_name) {
    throw new AppError('ERR-VAL-01', 'Nama periode yang diketik tidak sama', { confirm_name: [`Ketik "${p.period_name}" untuk mengonfirmasi`] });
  }
  const pending = await query<{ n: number }>(`SELECT COUNT(*) AS n FROM kas_payments WHERE period_id = @id AND status = N'MENUNGGU_VERIFIKASI'`, { id });
  if (pending[0]?.n) {
    throw new AppError('ERR-VAL-01', `Masih ada ${pending[0].n} pengajuan iuran kas yang menunggu verifikasi. Selesaikan dulu sebelum mengarsipkan`);
  }

  const affected = await query<{ user_id: string }>(
    `SELECT DISTINCT ur.user_id FROM user_roles ur JOIN officers o ON o.officer_id = ur.officer_id
     JOIN positions ps ON ps.position_id = o.position_id JOIN divisions dv ON dv.division_id = ps.division_id
     WHERE dv.period_id = @id AND ur.revoked_at IS NULL`,
    { id },
  );

  await withTransaction(user, ip, (tx) =>
    query(`UPDATE periods SET status = N'ARSIP', closed_at = SYSUTCDATETIME() WHERE period_id = @id AND status = N'AKTIF'`, { id }, tx),
  );

  const deactivated = affected.length
    ? await query<{ username: string }>(
        `SELECT username FROM users WHERE is_active = 0 AND user_id IN (SELECT value FROM OPENJSON(@ids))`,
        { ids: JSON.stringify(affected.map((a) => a.user_id)) },
      )
    : [];
  return { ...(await getPeriodRow(id)), revoked_users: affected.length, deactivated_users: deactivated.map((d) => d.username) };
}

/** FSD-2.25 AF-2: salin struktur divisi & jabatan dari periode lain (tanpa pengurus) */
export async function copyStructure(targetId: number, fromId: number, user: AuthUser, ip?: string) {
  const target = await getPeriodRow(targetId);
  assertNotArchived(target);
  await getPeriodRow(fromId);
  if (targetId === fromId) throw new AppError('ERR-VAL-01', 'Periode sumber dan tujuan sama');

  return withTransaction(user, ip, async (tx) => {
    const divs = await query<{ division_id: number; division_name: string; description: string | null; role_id: number | null }>(
      `SELECT division_id, division_name, description, role_id FROM divisions WHERE period_id = @from ORDER BY division_id`,
      { from: fromId },
      tx,
    );
    let divisions = 0, positions = 0;
    for (const d of divs) {
      const exists = await query<{ division_id: number }>(`SELECT division_id FROM divisions WHERE period_id = @t AND division_name = @n`, { t: targetId, n: d.division_name }, tx);
      let newId = exists[0]?.division_id;
      if (!newId) {
        const ins = await query<{ division_id: number }>(
          `DECLARE @out TABLE (division_id INT);
           INSERT INTO divisions (period_id, division_name, description, role_id) OUTPUT inserted.division_id INTO @out VALUES (@t, @n, @d, @r);
           SELECT division_id FROM @out;`,
          { t: targetId, n: d.division_name, d: d.description, r: d.role_id },
          tx,
        );
        newId = ins[0].division_id;
        divisions++;
      }
      const res = await query<{ n: number }>(
        `DECLARE @out TABLE (n INT);
         INSERT INTO positions (division_id, position_name, is_leader, role_id)
         OUTPUT inserted.position_id INTO @out
         SELECT @new, ps.position_name, ps.is_leader, ps.role_id FROM positions ps
         WHERE ps.division_id = @old AND NOT EXISTS (SELECT 1 FROM positions x WHERE x.division_id = @new AND x.position_name = ps.position_name);
         SELECT n FROM @out;`,
        { new: newId, old: d.division_id },
        tx,
      );
      positions += res.length;
    }
    return { period_id: targetId, divisions_created: divisions, positions_created: positions };
  });
}

/* ---------------- Divisi & Jabatan ---------------- */
export async function listDivisions(periodId?: number) {
  const pid = periodId ?? (await activePeriod())?.period_id;
  if (!pid) return { period: null, divisions: [] };
  const period = await getPeriodRow(pid);
  const today = todayWib();

  const divisions = await query<Record<string, unknown> & { division_id: number }>(
    `SELECT dv.division_id, dv.division_name, dv.description, r.role_name
     FROM divisions dv LEFT JOIN roles r ON r.role_id = dv.role_id
     WHERE dv.period_id = @pid ORDER BY dv.division_id`,
    { pid },
  );
  const positions = await query<Record<string, unknown> & { position_id: number; division_id: number }>(
    `SELECT ps.position_id, ps.division_id, ps.position_name, ps.is_leader, r.role_name AS own_role, rd.role_name AS division_role
     FROM positions ps JOIN divisions dv ON dv.division_id = ps.division_id
     LEFT JOIN roles r ON r.role_id = ps.role_id LEFT JOIN roles rd ON rd.role_id = dv.role_id
     WHERE dv.period_id = @pid ORDER BY ps.is_leader DESC, ps.position_id`,
    { pid },
  );
  const officers = await query<Record<string, unknown> & { position_id: number }>(
    `SELECT o.officer_id, o.position_id, m.full_name, u.username, o.start_date, o.end_date
     FROM officers o JOIN members m ON m.member_id = o.member_id LEFT JOIN users u ON u.user_id = o.user_id
     JOIN positions ps ON ps.position_id = o.position_id JOIN divisions dv ON dv.division_id = ps.division_id
     WHERE dv.period_id = @pid AND (o.end_date IS NULL OR o.end_date >= @today) ORDER BY m.full_name`,
    { pid, today },
  );

  return {
    period,
    divisions: divisions.map((d) => ({
      ...d,
      positions: positions
        .filter((p) => p.division_id === d.division_id)
        .map(({ own_role, division_role, ...p }) => ({
          ...p,
          role_name: own_role ?? division_role ?? null,
          role_inherited: !own_role && !!division_role,
          officers: officers.filter((o) => o.position_id === p.position_id).map(({ position_id: _p, ...o }) => ({ ...o, start_date: ymd(o.start_date), end_date: o.end_date ? ymd(o.end_date) : null })),
        })),
    })),
  };
}

async function getDivisionRow(id: number) {
  const rows = await query<{ division_id: number; period_id: number; status: string }>(
    `SELECT dv.division_id, dv.period_id, p.status FROM divisions dv JOIN periods p ON p.period_id = dv.period_id WHERE dv.division_id = @id`,
    { id },
  );
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Divisi tidak ditemukan');
  return rows[0];
}

export async function createDivision(input: CreateDivisionInput, user: AuthUser, ip?: string) {
  const pid = input.period_id ?? (await activePeriod())?.period_id;
  if (!pid) throw new AppError('ERR-DATA-01', 'Belum ada periode AKTIF');
  assertNotArchived(await getPeriodRow(pid));
  try {
    const rows = await withTransaction(user, ip, async (tx) =>
      query<{ division_id: number }>(
        `DECLARE @out TABLE (division_id INT);
         INSERT INTO divisions (period_id, division_name, description, role_id) OUTPUT inserted.division_id INTO @out VALUES (@pid, @name, @desc, @role);
         SELECT division_id FROM @out;`,
        { pid, name: input.division_name, desc: input.description ?? null, role: await roleIdOf(input.role_name, tx) },
        tx,
      ),
    );
    return { division_id: rows[0].division_id, period_id: pid, division_name: input.division_name, role_name: input.role_name ?? null };
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', 'Nama divisi sudah ada pada periode ini');
    throw e;
  }
}

export async function updateDivision(id: number, input: UpdateDivisionInput, user: AuthUser, ip?: string) {
  const d = await getDivisionRow(id);
  assertNotArchived(d);
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  if (input.division_name !== undefined) { sets.push('division_name = @name'); params.name = input.division_name; }
  if (input.description !== undefined) { sets.push('description = @desc'); params.desc = input.description; }
  try {
    await withTransaction(user, ip, async (tx) => {
      if (input.role_name !== undefined) { sets.push('role_id = @role'); params.role = await roleIdOf(input.role_name, tx); }
      await query(`UPDATE divisions SET ${sets.join(', ')} WHERE division_id = @id`, params, tx);
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', 'Nama divisi sudah ada pada periode ini');
    throw e;
  }
  return listDivisions(d.period_id);
}

export async function createPosition(divisionId: number, input: CreatePositionInput, user: AuthUser, ip?: string) {
  const d = await getDivisionRow(divisionId);
  assertNotArchived(d);
  try {
    const rows = await withTransaction(user, ip, async (tx) =>
      query<{ position_id: number }>(
        `DECLARE @out TABLE (position_id INT);
         INSERT INTO positions (division_id, position_name, is_leader, role_id) OUTPUT inserted.position_id INTO @out VALUES (@d, @name, @leader, @role);
         SELECT position_id FROM @out;`,
        { d: divisionId, name: input.position_name, leader: input.is_leader, role: await roleIdOf(input.role_name, tx) },
        tx,
      ),
    );
    return { position_id: rows[0].position_id, division_id: divisionId, position_name: input.position_name, is_leader: input.is_leader, role_name: input.role_name ?? null };
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', 'Nama jabatan sudah ada pada divisi ini');
    throw e;
  }
}

/* ---------------- Pengurus ---------------- */
const OFFICER_SELECT = `
  SELECT o.officer_id, o.member_id, m.full_name, m.phone, m.email, o.user_id, u.username, u.is_active AS user_is_active,
         o.position_id, ps.position_name, ps.is_leader, dv.division_id, dv.division_name, p.period_id, p.period_name, p.status AS period_status,
         COALESCE(rp.role_name, rd.role_name) AS role_name, o.start_date, o.end_date,
         CAST(CASE WHEN o.end_date IS NULL OR o.end_date >= @today THEN 1 ELSE 0 END AS BIT) AS is_active
  FROM officers o
  JOIN members m    ON m.member_id = o.member_id
  JOIN positions ps ON ps.position_id = o.position_id
  JOIN divisions dv ON dv.division_id = ps.division_id
  JOIN periods p    ON p.period_id = dv.period_id
  LEFT JOIN users u  ON u.user_id = o.user_id
  LEFT JOIN roles rp ON rp.role_id = ps.role_id
  LEFT JOIN roles rd ON rd.role_id = dv.role_id`;

type OfficerRow = Record<string, unknown> & { officer_id: string; member_id: string; user_id: string | null; period_status: string };
const mapOfficer = (r: OfficerRow) => ({ ...r, start_date: ymd(r.start_date), end_date: r.end_date ? ymd(r.end_date) : null });

export async function listOfficers(q: ListOfficerQuery) {
  const pid = q.period_id ?? (await activePeriod())?.period_id;
  if (!pid) return [];
  const where = ['p.period_id = @pid'];
  const params: Record<string, unknown> = { pid, today: todayWib() };
  if (q.division_id) { where.push('dv.division_id = @div'); params.div = q.division_id; }
  if (q.active === '1') where.push('(o.end_date IS NULL OR o.end_date >= @today)');
  if (q.active === '0') where.push('o.end_date < @today');
  if (q.q) { where.push('(m.full_name LIKE @q OR u.username LIKE @q OR ps.position_name LIKE @q)'); params.q = `%${q.q}%`; }
  const rows = await query<OfficerRow>(`${OFFICER_SELECT} WHERE ${where.join(' AND ')} ORDER BY dv.division_id, ps.is_leader DESC, m.full_name`, params);
  return rows.map(mapOfficer);
}

export async function getOfficer(id: string) {
  const rows = await query<OfficerRow>(`${OFFICER_SELECT} WHERE o.officer_id = @id`, { id, today: todayWib() });
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Data pengurus tidak ditemukan');
  return mapOfficer(rows[0]);
}

export async function createOfficer(input: CreateOfficerInput, user: AuthUser, ip?: string) {
  const officerId = await withTransaction(user, ip, async (tx) => {
    const pos = await query<{ period_id: number; status: string; start_date: unknown; end_date: unknown; division_id: number }>(
      `SELECT p.period_id, p.status, p.start_date, p.end_date, dv.division_id
       FROM positions ps JOIN divisions dv ON dv.division_id = ps.division_id JOIN periods p ON p.period_id = dv.period_id
       WHERE ps.position_id = @id`,
      { id: input.position_id },
      tx,
    );
    if (!pos[0]) throw new AppError('ERR-DATA-01', 'Jabatan tidak ditemukan');
    assertNotArchived(pos[0]);

    const mem = await query<{ member_id: string; user_id: string | null }>(
      `SELECT member_id, user_id FROM members WHERE member_id = @id AND is_deleted = 0`, { id: input.member_id }, tx,
    );
    if (!mem[0]) throw new AppError('ERR-DATA-01', 'Data umat tidak ditemukan');

    // BR-63: satu umat satu jabatan pada satu divisi dalam satu periode
    const dup = await query(
      `SELECT 1 AS x FROM officers o JOIN positions ps ON ps.position_id = o.position_id
       WHERE o.member_id = @m AND ps.division_id = @d AND (o.end_date IS NULL OR o.end_date >= @today)`,
      { m: input.member_id, d: pos[0].division_id, today: todayWib() },
      tx,
    );
    if (dup.length) throw new AppError('ERR-DATA-02', 'Umat ini sudah menjabat di divisi tersebut pada periode ini');

    const start = input.start_date ?? todayWib();
    const pStart = ymd(pos[0].start_date), pEnd = ymd(pos[0].end_date);
    if (start < pStart || start > pEnd) {
      throw new AppError('ERR-VAL-04', `Tanggal mulai harus di dalam periode (${pStart} s.d. ${pEnd})`, { start_date: ['Di luar rentang periode'] });
    }

    const userId = input.user_id ?? mem[0].user_id;
    if (userId) await linkMemberUser(input.member_id, mem[0].user_id, userId, tx);

    // OUTPUT tanpa INTO tidak boleh pada tabel bertrigger (audit) → id dibuat di sini
    const id = randomUUID();
    await query(
      `INSERT INTO officers (officer_id, member_id, position_id, user_id, start_date) VALUES (@id, @m, @p, @u, @s)`,
      { id, m: input.member_id, p: input.position_id, u: userId ?? null, s: start },
      tx,
    );
    if (userId) await grantOfficerRole(id, userId, tx); // BR-115
    return id;
  });

  const officer = await getOfficer(officerId);
  if (officer.user_id) await syncKasDues(String(officer.user_id), user, ip); // BR-120: tagihan sejak bulan penetapan
  return officer;
}

export async function updateOfficer(id: string, input: UpdateOfficerInput, user: AuthUser, ip?: string) {
  const before = await getOfficer(id);
  if (before.period_status === 'ARSIP') throw new AppError('ERR-DATA-04');
  const today = todayWib();

  await withTransaction(user, ip, async (tx) => {
    let userId = before.user_id ? String(before.user_id) : null;

    if (input.user_id !== undefined) {
      if (userId) throw new AppError('ERR-VAL-01', 'Pengurus ini sudah tertaut ke akun', { user_id: ['Sudah tertaut ke akun'] });
      const mem = await query<{ user_id: string | null }>(`SELECT user_id FROM members WHERE member_id = @m`, { m: before.member_id }, tx);
      await linkMemberUser(String(before.member_id), mem[0]?.user_id ?? null, input.user_id, tx);
      await query(`UPDATE officers SET user_id = @u WHERE officer_id = @id`, { u: input.user_id, id }, tx);
      userId = input.user_id;
    }

    if (input.end_date !== undefined) {
      if (input.end_date && input.end_date < String(before.start_date)) {
        throw new AppError('ERR-VAL-04', undefined, { end_date: ['Tanggal akhir tidak boleh sebelum tanggal mulai'] });
      }
      await query(`UPDATE officers SET end_date = @e WHERE officer_id = @id`, { e: input.end_date, id }, tx);
    }

    const endDate = input.end_date !== undefined ? input.end_date : (before.end_date as string | null);
    const ended = !!endDate && endDate < today;
    if (ended) {
      // Jabatan berakhir → cabut role jabatan ini; akun tanpa role aktif dinonaktifkan (BR-116)
      await query(`UPDATE user_roles SET revoked_at = SYSUTCDATETIME() WHERE officer_id = @id AND revoked_at IS NULL`, { id }, tx);
      if (userId) await deactivateIfNoRole(userId, tx);
    } else if (userId) {
      await grantOfficerRole(id, userId, tx);
    }
  });

  const after = await getOfficer(id);
  if (after.user_id) await syncKasDues(String(after.user_id), user, ip);
  return after;
}
