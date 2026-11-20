import { env } from '../config/env.js';
import type { RoleName } from '../config/constants.js';
import { officerNotice } from './emailTemplates.js';
import { sendMail } from './mailer.js';
import { query } from './sql.js';

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
}

/** true bila SMTP belum diatur → email hanya ditampilkan di terminal (mode dev) */
export const emailDevMode = () => !env.SMTP_USER || !env.SMTP_PASS;

/**
 * Kirim email SETELAH transaksi utama di-commit (AC-08) dan catat di notification_logs.
 * Tidak pernah melempar galat: kegagalan dicatat FAILED lalu dicoba ulang penjadwal (maks 3x, BR-113).
 */
export async function sendEmailLogged({ to, subject, html }: EmailInput) {
  try {
    const rows = await query<{ log_id: string }>(
      `INSERT INTO notification_logs (recipient, channel, subject, body, status)
       OUTPUT inserted.log_id
       VALUES (@to, N'EMAIL', @subject, @html, N'PENDING')`,
      { to, subject, html },
    );
    const logId = rows[0]?.log_id;

    if (emailDevMode()) {
      console.log(`\n[email:dev] ke: ${to}\n[email:dev] subjek: ${subject}\n[email:dev] ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}\n`);
      await query(
        `UPDATE notification_logs SET status = N'SENT', sent_at = SYSUTCDATETIME(), last_error = N'DEV: SMTP belum diatur, email tidak dikirim' WHERE log_id = @logId`,
        { logId },
      );
      return;
    }

    try {
      await sendMail({ to, subject, html });
      await query(`UPDATE notification_logs SET status = N'SENT', attempts = attempts + 1, sent_at = SYSUTCDATETIME() WHERE log_id = @logId`, { logId });
    } catch (e) {
      await query(`UPDATE notification_logs SET status = N'FAILED', attempts = attempts + 1, last_error = @err WHERE log_id = @logId`, {
        logId,
        err: String((e as Error).message).slice(0, 255),
      });
    }
  } catch (e) {
    console.error('[email] gagal mencatat notification_logs', e);
  }
}

export interface AppNotice {
  type: string; // mis. LOAN_SUBMITTED, KAS_SUBMITTED, KAS_APPROVED
  title: string;
  message: string;
  relatedId?: string | null;
}

/**
 * Notifikasi aplikasi + salinan email (FSD-2.21 v1.2): setiap penerima mendapat notifikasi di aplikasi;
 * bila akunnya punya email, salinan dikirim lewat sendEmailLogged (ada log + retry, BR-49/BR-113).
 * Tidak pernah melempar galat. Panggil SETELAH transaksi utama commit.
 */
export async function notifyUsers(userIds: string[], n: AppNotice) {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return;
  try {
    const params: Record<string, unknown> = {};
    ids.forEach((id, i) => (params[`u${i}`] = id));
    const users = await query<{ user_id: string; email: string | null }>(
      `SELECT user_id, email FROM users WHERE is_active = 1 AND user_id IN (${ids.map((_, i) => `@u${i}`).join(',')})`,
      params,
    );
    for (const u of users) {
      await query(
        `INSERT INTO notifications (recipient_user_id, recipient_email, type, title, message, channel, related_id, sent_at)
         VALUES (@uid, @em, @type, @title, @msg, N'APLIKASI', @rel, SYSUTCDATETIME())`,
        { uid: u.user_id, em: u.email, type: n.type, title: n.title, msg: n.message, rel: n.relatedId ?? null },
      );
      if (u.email?.trim()) await sendEmailLogged({ to: u.email.trim(), ...officerNotice(n.title, n.message, env.APP_URL || undefined) });
    }
  } catch (e) {
    console.error('[notify] gagal membuat notifikasi', e);
  }
}

/** Kirim ke semua pengguna aktif yang memegang salah satu role (Admin tidak otomatis ikut) */
export async function notifyRoles(roles: RoleName[], n: AppNotice, exceptUserId?: string) {
  try {
    const params: Record<string, unknown> = {};
    roles.forEach((r, i) => (params[`r${i}`] = r));
    const rows = await query<{ user_id: string }>(
      `SELECT DISTINCT ur.user_id FROM user_roles ur
       JOIN roles r ON r.role_id = ur.role_id JOIN users u ON u.user_id = ur.user_id
       WHERE ur.revoked_at IS NULL AND u.is_active = 1 AND r.role_name IN (${roles.map((_, i) => `@r${i}`).join(',')})`,
      params,
    );
    await notifyUsers(rows.map((r) => r.user_id).filter((id) => id !== exceptUserId), n);
  } catch (e) {
    console.error('[notify] gagal mencari penerima', e);
  }
}
