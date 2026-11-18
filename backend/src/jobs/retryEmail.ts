import { EMAIL_RETRY } from '../config/constants.js';
import { pool } from '../db/client.js';
import { sendMail } from '../lib/mailer.js';

/** Kirim ulang email FAILED/PENDING (maks 3 percobaan, BR-113). */
export async function retryFailedEmails() {
  const { recordset } = await pool.request().input('max', EMAIL_RETRY.MAX_ATTEMPTS).query(`
    SELECT TOP 20 log_id, recipient, subject, body FROM notification_logs
    WHERE channel = N'EMAIL' AND status IN (N'PENDING', N'FAILED') AND attempts < @max
    ORDER BY created_at`);
  for (const m of recordset) {
    try {
      await sendMail({ to: m.recipient, subject: m.subject ?? '(tanpa judul)', html: m.body ?? '' });
      await pool.request().input('id', m.log_id).query(
        `UPDATE notification_logs SET status = N'SENT', attempts = attempts + 1, sent_at = SYSUTCDATETIME() WHERE log_id = @id`);
    } catch (e) {
      await pool.request().input('id', m.log_id).input('err', String((e as Error).message).slice(0, 255)).query(
        `UPDATE notification_logs SET status = N'FAILED', attempts = attempts + 1, last_error = @err WHERE log_id = @id`);
    }
  }
  return recordset.length;
}
