// FSD-2.10, 2.11, 2.12 — proses inti di stored procedure (TSD 5.1), baca data dengan query berparameter
import { env } from '../../config/env.js';
import { AppError, ValidationError } from '../../lib/AppError.js';
import { loanDecision, loanSubmitted } from '../../lib/emailTemplates.js';
import type { ErrorCode } from '../../lib/errors.js';
import { notifyRoles, sendEmailLogged } from '../../lib/notify.js';
import { getSetting } from '../../lib/settings.js';
import { callProcedure, query, sql } from '../../lib/sql.js';
import { waLink } from '../../lib/waLink.js';
import type { AuthUser } from '../../types/express.js';
import type { CreateLoanInput, ListLoanQuery, PickupInput, ReturnInput } from './loans.schema.js';

const statusUrl = () => `${env.APP_URL}/status`;
const KEY_WHERE = `(lr.loan_id = TRY_CAST(@key AS UNIQUEIDENTIFIER) OR lr.loan_code = @key)`;

/** Ubah hasil SP menjadi galat ERR-xxx */
function fail(result: unknown, map: Record<string, [ErrorCode, string?, Record<string, string[]>?]>): never {
  const m = map[String(result)];
  if (m) throw new AppError(m[0], m[1], m[2]);
  throw new AppError('ERR-SYS-01', `Hasil prosedur tidak dikenal: ${String(result)}`);
}

/** Tautan wa.me ke Sarpras (nomor dari system_settings, AC-14) */
export async function sarprasWaLink(code: string, name: string) {
  const phone = await getSetting('WA_SARPRAS');
  return phone ? waLink(phone, `Halo Sarpras KMK UNS, saya ${name} ingin menanyakan pengajuan ${code}.`) : null;
}

/** Ringkasan untuk email: nama ruangan atau daftar aset */
async function mailData(loanId: string) {
  const rows = await query<{ loan_code: string; borrower_name: string; borrower_email: string; start_at: Date; end_at: Date; place: string | null }>(
    `SELECT lr.loan_code, lr.borrower_name, lr.borrower_email, lr.start_at, lr.end_at,
            COALESCE(r.room_name, (SELECT STRING_AGG(a.asset_name, N', ') FROM loan_items li JOIN assets a ON a.asset_id = li.asset_id WHERE li.loan_id = lr.loan_id)) AS place
     FROM loan_requests lr LEFT JOIN rooms r ON r.room_id = lr.room_id WHERE lr.loan_id = @id`,
    { id: loanId },
  );
  const r = rows[0];
  return { ...r, place: r?.place ?? '-' };
}

/* ---------------- Pengajuan publik (FSD-2.10) ---------------- */
export async function submit(input: CreateLoanInput, ip?: string) {
  const { output } = await callProcedure(
    'sp_submit_loan',
    {
      request_type: { type: sql.NVarChar(20), value: input.request_type },
      room_id: { type: sql.Int, value: input.room_id ?? null },
      asset_ids: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(input.asset_ids) },
      start_at: { type: sql.DateTime2, value: input.start_at },
      end_at: { type: sql.DateTime2, value: input.end_at },
      borrower_name: { type: sql.NVarChar(150), value: input.borrower_name },
      borrower_phone: { type: sql.NVarChar(20), value: input.borrower_phone },
      borrower_email: { type: sql.NVarChar(150), value: input.borrower_email },
      borrower_org: { type: sql.NVarChar(100), value: input.borrower_org ?? null },
      purpose: { type: sql.NVarChar(255), value: input.purpose },
      use_facilities: { type: sql.Bit, value: input.use_facilities },
    },
    { loan_id: sql.UniqueIdentifier, loan_code: sql.NVarChar(30), result: sql.NVarChar(30) },
    undefined,
    ip,
  );
  if (output.result !== 'SUCCESS') {
    fail(output.result, {
      INVALID_TIME: ['ERR-VAL-04'],
      INVALID_INPUT: ['ERR-VAL-01', 'Ruangan/aset tidak valid', { room_id: ['Ruangan tidak ditemukan atau nonaktif'] }],
      TIME_CONFLICT: ['ERR-LOAN-01'],
      ASSET_UNAVAILABLE: ['ERR-LOAN-02'],
    });
  }
  const loanId = String(output.loan_id);
  const code = String(output.loan_code);

  // Email konfirmasi setelah commit; kegagalan email tidak menggagalkan pengajuan (AC-08)
  const m = await mailData(loanId);
  await sendEmailLogged({ to: input.borrower_email, ...loanSubmitted(m, statusUrl()) });
  await notifyRoles(['Sarpras'], { type: 'LOAN_SUBMITTED', title: `Pengajuan peminjaman baru ${code}`, message: `${input.borrower_name} mengajukan peminjaman ${m.place}. Mohon ditinjau.`, relatedId: loanId });

  return { loan_id: loanId, loan_code: code, status: 'MENUNGGU', pic_wa_link: await sarprasWaLink(code, input.borrower_name) };
}

/* ---------------- Daftar & detail (FSD-2.11) ---------------- */
export async function list(q: ListLoanQuery, page: number, perPage: number) {
  const where: string[] = [];
  const params: Record<string, unknown> = { offset: (page - 1) * perPage, limit: perPage };
  if (q.status) { where.push('lr.status = @status'); params.status = q.status; }
  if (q.q) { where.push('(lr.loan_code LIKE @q OR lr.borrower_name LIKE @q OR lr.borrower_org LIKE @q)'); params.q = `%${q.q}%`; }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query(
    `SELECT lr.loan_id, lr.loan_code, lr.request_type, lr.borrower_name, lr.borrower_org, lr.room_id, r.room_name,
            (SELECT STRING_AGG(a.asset_name, N', ') FROM loan_items li JOIN assets a ON a.asset_id = li.asset_id WHERE li.loan_id = lr.loan_id) AS asset_names,
            lr.use_facilities, lr.start_at, lr.end_at, lr.status, lr.created_at
     FROM loan_requests lr LEFT JOIN rooms r ON r.room_id = lr.room_id
     ${w}
     ORDER BY CASE WHEN lr.status = N'MENUNGGU' THEN 0 ELSE 1 END, lr.start_at DESC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    params,
  );
  const total = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM loan_requests lr ${w}`, params);
  return { rows, total: total[0]?.total ?? 0 };
}

export async function get(key: string) {
  const rows = await query<Record<string, unknown> & { loan_id: string; loan_code: string; borrower_name: string }>(
    `SELECT lr.*, r.room_name, u.full_name AS reviewed_by_name, w.workflow_name
     FROM loan_requests lr
     LEFT JOIN rooms r ON r.room_id = lr.room_id
     LEFT JOIN users u ON u.user_id = lr.reviewed_by
     LEFT JOIN workflows w ON w.workflow_id = lr.workflow_id
     WHERE ${KEY_WHERE}`,
    { key },
  );
  const loan = rows[0];
  if (!loan) throw new AppError('ERR-DATA-01', 'Pengajuan tidak ditemukan');
  const items = await query(
    `SELECT li.loan_item_id, li.asset_id, a.asset_code, a.asset_name, a.status AS asset_status, li.condition_out, li.condition_in
     FROM loan_items li JOIN assets a ON a.asset_id = li.asset_id WHERE li.loan_id = @id ORDER BY a.asset_code`,
    { id: loan.loan_id },
  );
  const approvals = await query(
    `SELECT al.decision, al.note, al.decided_at, u.full_name AS approver_name, ws.approver_role, ws.step_order
     FROM approval_logs al JOIN users u ON u.user_id = al.approver_id JOIN workflow_steps ws ON ws.step_id = al.step_id
     WHERE al.ref_module = N'PEMINJAMAN' AND al.ref_id = @code ORDER BY al.decided_at`,
    { code: loan.loan_code },
  );
  return { ...loan, items, approvals, pic_wa_link: await sarprasWaLink(loan.loan_code, loan.borrower_name) };
}

async function resolveId(key: string) {
  const rows = await query<{ loan_id: string }>(`SELECT lr.loan_id FROM loan_requests lr WHERE ${KEY_WHERE}`, { key });
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Pengajuan tidak ditemukan');
  return rows[0].loan_id;
}

/* ---------------- Persetujuan 1 tahap (FSD-2.11) ---------------- */
export async function decide(key: string, approve: boolean, note: string | null, user: AuthUser, ip?: string) {
  const loanId = await resolveId(key);
  const { output } = await callProcedure(
    'sp_approve_loan',
    {
      loan_id: { type: sql.UniqueIdentifier, value: loanId },
      approver_id: { type: sql.UniqueIdentifier, value: user.id },
      decision: { type: sql.NVarChar(10), value: approve ? 'SETUJU' : 'TOLAK' },
      note: { type: sql.NVarChar(sql.MAX), value: note },
    },
    { result: sql.NVarChar(30) },
    user,
    ip,
  );
  if (output.result !== 'SUCCESS_APPROVED' && output.result !== 'SUCCESS_REJECTED') {
    fail(output.result, {
      NOT_FOUND: ['ERR-DATA-01', 'Pengajuan tidak ditemukan'],
      ALREADY_PROCESSED: ['ERR-LOAN-03'],
      NOT_AUTHORIZED: ['ERR-WF-01'],
      REASON_REQUIRED: ['ERR-VAL-01', 'Alasan penolakan wajib diisi', { reject_reason: ['Wajib diisi saat menolak'] }],
      TIME_CONFLICT: ['ERR-LOAN-01'],
    });
  }
  const m = await mailData(loanId);
  await sendEmailLogged({ to: m.borrower_email, ...loanDecision(m, approve, approve ? null : note, statusUrl()) });
  return { loan_id: loanId, status: approve ? 'DISETUJUI' : 'DITOLAK' };
}

/* ---------------- Pengambilan & pengembalian (FSD-2.12) ---------------- */
export async function pickup(key: string, input: PickupInput, user: AuthUser, ip?: string) {
  const loanId = await resolveId(key);
  const { output } = await callProcedure(
    'sp_handover_loan',
    {
      loan_id: { type: sql.UniqueIdentifier, value: loanId },
      actor_id: { type: sql.UniqueIdentifier, value: user.id },
      items: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(input.items ?? []) },
      note: { type: sql.NVarChar(sql.MAX), value: input.note ?? null },
    },
    { result: sql.NVarChar(30) },
    user,
    ip,
  );
  if (output.result !== 'SUCCESS') {
    fail(output.result, {
      NOT_FOUND: ['ERR-DATA-01', 'Pengajuan tidak ditemukan'],
      NOT_APPROVED: ['ERR-LOAN-03', 'Pengajuan belum disetujui atau sudah diambil'],
    });
  }
  return { loan_id: loanId, status: 'DIAMBIL' };
}

export async function returnLoan(key: string, input: ReturnInput, user: AuthUser, ip?: string) {
  const loanId = await resolveId(key);
  // BR-25: setiap aset yang dipinjam wajib dicatat kondisinya saat kembali (hanya bila sudah DIAMBIL)
  const items = await query<{ asset_id: string; status: string }>(
    `SELECT li.asset_id, lr.status FROM loan_items li JOIN loan_requests lr ON lr.loan_id = li.loan_id WHERE li.loan_id = @id`,
    { id: loanId },
  );
  if (items.length && items[0].status === 'DIAMBIL') {
    const given = new Set((input.conditions ?? []).map((c) => c.asset_id.toUpperCase()));
    const missing = items.filter((i) => !given.has(i.asset_id.toUpperCase()));
    if (missing.length) throw new ValidationError({ conditions: ['Kondisi setiap aset wajib diisi saat pengembalian'] });
  }
  const { output } = await callProcedure(
    'sp_return_loan',
    {
      loan_id: { type: sql.UniqueIdentifier, value: loanId },
      actor_id: { type: sql.UniqueIdentifier, value: user.id },
      conditions: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(input.conditions ?? []) },
      return_note: { type: sql.NVarChar(sql.MAX), value: input.return_note ?? null },
    },
    { result: sql.NVarChar(30), damaged_assets: sql.NVarChar(sql.MAX) },
    user,
    ip,
  );
  if (output.result !== 'SUCCESS') {
    fail(output.result, {
      NOT_FOUND: ['ERR-DATA-01', 'Pengajuan tidak ditemukan'],
      NOT_HANDED_OVER: ['ERR-LOAN-04'],
    });
  }
  const damaged = output.damaged_assets ? (JSON.parse(String(output.damaged_assets)) as { value: string }[]).map((d) => d.value) : [];
  return { loan_id: loanId, status: 'SELESAI', damaged_assets: damaged };
}
