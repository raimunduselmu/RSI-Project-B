// FSD-2.43 Ajukan Pembayaran Iuran Kas · FSD-2.44 Verifikasi Pembayaran Iuran Kas
// Proses inti di stored procedure (TSD 5.1): sp_sync_kas_dues, sp_submit_kas_payment, sp_verify_kas_payment
import type { RoleName } from '../../config/constants.js';
import { AppError } from '../../lib/AppError.js';
import { notifyRoles, notifyUsers } from '../../lib/notify.js';
import { getSetting } from '../../lib/settings.js';
import { failResult } from '../../lib/spResult.js';
import { callProcedure, query, sql } from '../../lib/sql.js';
import { removeFile } from '../../lib/storage.js';
import { todayWib } from '../../lib/time.js';
import { fillTemplate, waLink } from '../../lib/waLink.js';
import type { AuthUser } from '../../types/express.js';
import type { ListPaymentQuery, SubmitPaymentInput } from './kas.schema.js';
import { rupiah } from '../../lib/format.js';

const KEY_WHERE = `(kp.payment_id = TRY_CAST(@key AS UNIQUEIDENTIFIER) OR kp.payment_code = @key)`;
const VIEW_ROLES: RoleName[] = ['Admin', 'Bendahara', 'PHT'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const ym = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 7) : String(v).slice(0, 7));
const monthLabel = (v: unknown) => {
  const [y, m] = ym(v).split('-').map(Number);
  return `${BULAN[m - 1]} ${y}`;
};
const hasAny = (user: AuthUser, roles: RoleName[]) => user.roles.some((r) => roles.includes(r));



/* ---------------- Tagihan bulanan (BR-120) ---------------- */
/** Bentuk/rapikan tagihan bulanan. Tidak melempar galat bila tarif belum diatur atau belum ada periode AKTIF. */
export async function syncKasDues(userId: string | null, user?: AuthUser, ip?: string) {
  const { output } = await callProcedure(
    'sp_sync_kas_dues',
    { user_id: { type: sql.UniqueIdentifier, value: userId } },
    { inserted: sql.Int, result: sql.NVarChar(30) },
    user,
    ip,
  );
  return { result: String(output.result), inserted: Number(output.inserted ?? 0) };
}

async function isActiveOfficer(userId: string) {
  const rows = await query(
    `SELECT TOP 1 1 AS x FROM officers o
     JOIN positions ps ON ps.position_id = o.position_id JOIN divisions dv ON dv.division_id = ps.division_id
     JOIN periods p ON p.period_id = dv.period_id
     WHERE o.user_id = @u AND p.status = N'AKTIF' AND (o.end_date IS NULL OR o.end_date >= @today)`,
    { u: userId, today: todayWib() },
  );
  return rows.length > 0;
}

/** Parameter pembayaran dari system_settings (BR-126, tanpa hardcode) */
async function paymentConfig() {
  const [rate, qris, waBendahara, template] = await Promise.all([
    getSetting('KAS_MONTHLY_RATE'),
    getSetting('QRIS_IMAGE'),
    getSetting('WA_BENDAHARA'),
    getSetting('WA_TEMPLATE_KAS_CASH'),
  ]);
  const rateNum = Number(rate);
  return {
    rate: Number.isFinite(rateNum) && rateNum > 0 ? rateNum : null,
    qris: qris?.trim() ? qris : null,
    waBendahara: waBendahara?.trim() ? waBendahara : null,
    template: template?.trim() || 'Halo Bendahara, saya {nama} ingin membayar iuran kas tunai untuk {bulan}.',
  };
}

/** GET /kas/dues/me — status bulan iuran milik sendiri + data untuk form bayar (SCR-40) */
export async function myDues(user: AuthUser, ip?: string) {
  await syncKasDues(user.id, user, ip);
  const cfg = await paymentConfig();
  const periodRows = await query<{ period_id: number; period_name: string }>(`SELECT period_id, period_name FROM periods WHERE status = N'AKTIF'`);
  const rows = await query<Record<string, unknown> & { due_month: unknown; amount: number; status: string }>(
    `SELECT due_id, due_month, amount, status, payment_id, payment_code, method, payment_status, reject_reason, verified_at
     FROM v_kas_status WHERE user_id = @u ORDER BY due_month`,
    { u: user.id },
  );
  const thisMonth = todayWib().slice(0, 7);
  const dues = rows.map((r) => ({
    ...r,
    due_month: ym(r.due_month),
    label: monthLabel(r.due_month),
    is_arrears: r.status === 'BELUM_LUNAS' && ym(r.due_month) < thisMonth, // tunggakan
    amount: Number(r.amount),
  }));
  const sum = (s: string) => dues.filter((d) => d.status === s);
  const arrears = dues.filter((d) => d.is_arrears);

  return {
    period: periodRows[0] ?? null,
    is_active_officer: await isActiveOfficer(user.id),
    rate_per_month: cfg.rate,
    methods: {
      QRIS: { available: !!cfg.qris, qris_image_url: cfg.qris ? '/api/v1/public/settings/qris-image' : null },
      CASH: {
        available: !!cfg.waBendahara,
        wa_bendahara: cfg.waBendahara,
        wa_template: cfg.template,
        // contoh tautan; frontend sebaiknya membentuk ulang dengan bulan yang dipilih
        wa_link: cfg.waBendahara ? waLink(cfg.waBendahara, fillTemplate(cfg.template, { nama: user.fullName, bulan: '(bulan yang dipilih)' })) : null,
      },
    },
    summary: {
      belum_lunas: sum('BELUM_LUNAS').length,
      menunggu_verifikasi: sum('MENUNGGU_VERIFIKASI').length,
      lunas: sum('LUNAS').length,
      tunggakan_bulan: arrears.length,
      tunggakan_total: arrears.reduce((a, d) => a + d.amount, 0),
    },
    dues,
  };
}

/* ---------------- Ajukan pembayaran (FSD-2.43) ---------------- */
export async function submitPayment(input: SubmitPaymentInput, proofPath: string, user: AuthUser, ip?: string) {
  try {
    const cfg = await paymentConfig();
    if (!cfg.rate) throw new AppError('ERR-CFG-01', 'Tarif iuran kas belum diatur. Hubungi Admin/Bendahara');
    if (input.method === 'QRIS' && !cfg.qris) throw new AppError('ERR-CFG-01', 'Gambar QRIS belum diatur. Hubungi Admin/Bendahara');
    if (input.method === 'CASH' && !cfg.waBendahara) throw new AppError('ERR-CFG-01', 'Nomor WhatsApp Bendahara belum diatur. Hubungi Admin');

    const { output } = await callProcedure(
      'sp_submit_kas_payment',
      {
        user_id: { type: sql.UniqueIdentifier, value: user.id },
        due_ids: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(input.due_ids) },
        method: { type: sql.NVarChar(10), value: input.method },
        proof_path: { type: sql.NVarChar(255), value: proofPath },
        note: { type: sql.NVarChar(255), value: input.note ?? null },
      },
      { payment_id: sql.UniqueIdentifier, payment_code: sql.NVarChar(30), total_amount: sql.Decimal(15, 2), months: sql.Int, result: sql.NVarChar(30) },
      user,
      ip,
    );
    if (output.result !== 'SUCCESS') {
      failResult(output.result, {
        NOT_ACTIVE_OFFICER: ['ERR-KAS-02'],
        RATE_NOT_SET: ['ERR-CFG-01', 'Tarif iuran kas belum diatur. Hubungi Admin/Bendahara'],
        INVALID_INPUT: ['ERR-VAL-01'],
        DUE_NOT_OPEN: ['ERR-KAS-01'],
      });
    }
    await notifyRoles(
      ['Bendahara', 'PHT'],
      { type: 'KAS_SUBMITTED', title: `Pembayaran iuran ${String(output.payment_code)} menunggu verifikasi`, message: `${user.username} mengajukan iuran kas ${Number(output.months)} bulan (${rupiah(String(output.total_amount))}).`, relatedId: String(output.payment_id) },
      user.id,
    );
    return {
      payment_id: String(output.payment_id),
      payment_code: String(output.payment_code),
      total_amount: Number(output.total_amount),
      months: Number(output.months),
      status: 'MENUNGGU_VERIFIKASI',
    };
  } catch (e) {
    await removeFile(proofPath); // pengajuan gagal → bukti yang sudah tersimpan dibuang
    throw e;
  }
}

/* ---------------- Daftar & detail ---------------- */
const PAYMENT_SELECT = `
  SELECT kp.payment_id, kp.payment_code, kp.user_id, u.full_name, u.username, kp.period_id, p.period_name,
         kp.method, kp.total_amount, kp.note, kp.status, kp.reject_reason, kp.created_at,
         kp.verified_by, vu.full_name AS verified_by_name, kp.verified_at, kp.cash_transaction_id,
         (SELECT COUNT(*) FROM kas_payment_items i WHERE i.payment_id = kp.payment_id) AS month_count,
         (SELECT STRING_AGG(CONVERT(CHAR(7), d.due_month, 126), ',') WITHIN GROUP (ORDER BY d.due_month)
          FROM kas_payment_items i JOIN kas_dues d ON d.due_id = i.due_id WHERE i.payment_id = kp.payment_id) AS months,
         CAST(CASE WHEN EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.role_id = ur.role_id
                                WHERE ur.user_id = kp.user_id AND ur.revoked_at IS NULL AND r.role_name = N'Bendahara')
                   THEN 1 ELSE 0 END AS BIT) AS owner_is_bendahara
  FROM kas_payments kp
  JOIN users u ON u.user_id = kp.user_id
  JOIN periods p ON p.period_id = kp.period_id
  LEFT JOIN users vu ON vu.user_id = kp.verified_by`;

type PaymentRow = Record<string, unknown> & {
  payment_id: string;
  payment_code: string;
  user_id: string;
  status: string;
  months: string | null;
  owner_is_bendahara: boolean;
  total_amount: number;
};

/** BR-125: Bendahara memverifikasi; pengajuan milik Bendahara → PHT; tidak boleh milik sendiri */
function canVerify(p: PaymentRow, user: AuthUser) {
  if (p.status !== 'MENUNGGU_VERIFIKASI') return false;
  if (p.user_id.toLowerCase() === user.id.toLowerCase()) return false;
  return user.roles.includes(p.owner_is_bendahara ? 'PHT' : 'Bendahara');
}

function mapPayment(p: PaymentRow, user: AuthUser) {
  const months = p.months ? p.months.split(',') : [];
  return {
    ...p,
    total_amount: Number(p.total_amount),
    months,
    month_labels: months.map(monthLabel),
    verifier_role: p.owner_is_bendahara ? 'PHT' : 'Bendahara',
    can_verify: canVerify(p, user),
    proof_url: `/api/v1/kas/payments/${p.payment_id}/proof`,
  };
}

export async function myPayments(user: AuthUser) {
  const rows = await query<PaymentRow>(`${PAYMENT_SELECT} WHERE kp.user_id = @u ORDER BY kp.created_at DESC`, { u: user.id });
  return rows.map((r) => mapPayment(r, user));
}

export async function listPayments(q: ListPaymentQuery, user: AuthUser, page: number, perPage: number) {
  const where: string[] = [];
  const params: Record<string, unknown> = { offset: (page - 1) * perPage, limit: perPage };
  if (q.status) { where.push('kp.status = @status'); params.status = q.status; }
  if (q.method) { where.push('kp.method = @method'); params.method = q.method; }
  if (q.q) { where.push('(kp.payment_code LIKE @q OR u.full_name LIKE @q OR u.username LIKE @q)'); params.q = `%${q.q}%`; }
  if (q.month) {
    where.push(`EXISTS (SELECT 1 FROM kas_payment_items i JOIN kas_dues d ON d.due_id = i.due_id WHERE i.payment_id = kp.payment_id AND d.due_month = @month)`);
    params.month = `${q.month}-01`;
  }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query<PaymentRow>(
    `${PAYMENT_SELECT} ${w}
     ORDER BY CASE WHEN kp.status = N'MENUNGGU_VERIFIKASI' THEN 0 ELSE 1 END, kp.created_at DESC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    params,
  );
  const total = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM kas_payments kp JOIN users u ON u.user_id = kp.user_id ${w}`, params);
  return { rows: rows.map((r) => mapPayment(r, user)), total: total[0]?.total ?? 0 };
}

async function loadPayment(key: string, user: AuthUser) {
  const rows = await query<PaymentRow & { proof_path?: string }>(`${PAYMENT_SELECT.replace('kp.note,', 'kp.note, kp.proof_path,')} WHERE ${KEY_WHERE}`, { key });
  const p = rows[0];
  if (!p) throw new AppError('ERR-DATA-01', 'Pengajuan iuran tidak ditemukan');
  // Pemilik boleh melihat miliknya; selain itu hanya Bendahara/PHT/Admin
  if (p.user_id.toLowerCase() !== user.id.toLowerCase() && !hasAny(user, VIEW_ROLES)) throw new AppError('ERR-AUTH-03');
  return p;
}

export async function getPayment(key: string, user: AuthUser) {
  const p = await loadPayment(key, user);
  const items = await query<{ due_month: unknown; amount: number; due_status: string }>(
    `SELECT d.due_id, d.due_month, i.amount, d.status AS due_status
     FROM kas_payment_items i JOIN kas_dues d ON d.due_id = i.due_id WHERE i.payment_id = @id ORDER BY d.due_month`,
    { id: p.payment_id },
  );
  const approvals = await query(
    `SELECT al.decision, al.note, al.decided_at, u.full_name AS approver_name
     FROM approval_logs al JOIN users u ON u.user_id = al.approver_id
     WHERE al.ref_module = N'IURAN_KAS' AND al.ref_id = @code ORDER BY al.decided_at`,
    { code: p.payment_code },
  );
  const { proof_path: _hidden, ...rest } = p;
  return {
    ...mapPayment(rest as PaymentRow, user),
    items: items.map((i) => ({ ...i, due_month: ym(i.due_month), label: monthLabel(i.due_month), amount: Number(i.amount) })),
    approvals,
  };
}

/** Path file bukti untuk GET /kas/payments/:id/proof */
export async function proofPath(key: string, user: AuthUser) {
  const p = await loadPayment(key, user);
  if (!p.proof_path) throw new AppError('ERR-DATA-01', 'Bukti pembayaran tidak ditemukan');
  return p.proof_path;
}

/* ---------------- Verifikasi (FSD-2.44) ---------------- */
export async function verify(key: string, approve: boolean, reason: string | null, user: AuthUser, ip?: string) {
  const p = await loadPayment(key, user);
  const { output } = await callProcedure(
    'sp_verify_kas_payment',
    {
      payment_id: { type: sql.UniqueIdentifier, value: p.payment_id },
      verifier_id: { type: sql.UniqueIdentifier, value: user.id },
      decision: { type: sql.NVarChar(10), value: approve ? 'SETUJU' : 'TOLAK' },
      reject_reason: { type: sql.NVarChar(255), value: reason },
    },
    { cash_transaction_id: sql.UniqueIdentifier, result: sql.NVarChar(30) },
    user,
    ip,
  );
  if (output.result !== 'SUCCESS_APPROVED' && output.result !== 'SUCCESS_REJECTED') {
    failResult(output.result, {
      NOT_FOUND: ['ERR-DATA-01', 'Pengajuan iuran tidak ditemukan'],
      ALREADY_PROCESSED: ['ERR-KAS-03', 'Pengajuan ini sudah diverifikasi'],
      NOT_AUTHORIZED: ['ERR-KAS-03', p.owner_is_bendahara ? 'Pengajuan milik Bendahara hanya dapat diverifikasi oleh PHT' : 'Pengajuan ini tidak dapat Anda verifikasi'],
      REASON_REQUIRED: ['ERR-VAL-01', 'Alasan penolakan wajib diisi', { reject_reason: ['Alasan penolakan wajib diisi'] }],
      PERIOD_ARCHIVED: ['ERR-DATA-04'],
      INVALID_INPUT: ['ERR-VAL-01'],
    });
  }
  await notifyUsers([p.user_id], {
    type: approve ? 'KAS_APPROVED' : 'KAS_REJECTED',
    title: approve ? `Iuran ${p.payment_code} disetujui` : `Iuran ${p.payment_code} ditolak`,
    message: approve ? 'Pembayaran iuran kas Anda sudah diverifikasi dan bulan terkait berstatus lunas.' : `Pembayaran iuran kas Anda ditolak. Alasan: ${reason ?? '-'}. Silakan ajukan ulang.`,
    relatedId: p.payment_id,
  });
  return {
    payment_id: p.payment_id,
    payment_code: p.payment_code,
    status: approve ? 'DISETUJUI' : 'DITOLAK',
    cash_transaction_id: output.cash_transaction_id ? String(output.cash_transaction_id) : null,
  };
}

/* ---------------- Rekap per pengurus per bulan (BO-12, SCR-41) ---------------- */
export async function recap(q?: string) {
  await syncKasDues(null);
  const rows = await query<{ user_id: string; full_name: string; due_month: unknown; amount: number; status: string; period_name: string }>(
    `SELECT user_id, full_name, due_month, amount, status, period_name FROM v_kas_status
     ${q ? 'WHERE full_name LIKE @q' : ''} ORDER BY full_name, due_month`,
    q ? { q: `%${q}%` } : {},
  );
  const months = [...new Set(rows.map((r) => ym(r.due_month)))].sort();
  const thisMonth = todayWib().slice(0, 7);
  const byUser = new Map<string, { user_id: string; full_name: string; cells: Record<string, string>; lunas: number; menunggu: number; belum_lunas: number; tunggakan_total: number }>();
  let collected = 0, outstanding = 0;
  for (const r of rows) {
    const u = byUser.get(r.user_id) ?? { user_id: r.user_id, full_name: r.full_name, cells: {}, lunas: 0, menunggu: 0, belum_lunas: 0, tunggakan_total: 0 };
    const m = ym(r.due_month);
    u.cells[m] = r.status;
    if (r.status === 'LUNAS') { u.lunas++; collected += Number(r.amount); }
    if (r.status === 'MENUNGGU_VERIFIKASI') u.menunggu++;
    if (r.status === 'BELUM_LUNAS') {
      u.belum_lunas++;
      if (m < thisMonth) { u.tunggakan_total += Number(r.amount); outstanding += Number(r.amount); }
    }
    byUser.set(r.user_id, u);
  }
  return {
    period_name: rows[0]?.period_name ?? null,
    months: months.map((m) => ({ month: m, label: monthLabel(m) })),
    officers: [...byUser.values()],
    totals: { terkumpul: collected, tunggakan: outstanding, label_terkumpul: rupiah(collected), label_tunggakan: rupiah(outstanding) },
  };
}
