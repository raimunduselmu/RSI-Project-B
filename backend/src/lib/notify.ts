import { env } from '../config/env.js';
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
