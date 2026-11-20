// FSD-2.21 — notifikasi aplikasi milik sendiri. Pembuatannya ada di lib/notify.ts (notifyUsers/notifyRoles).
import { AppError } from '../../lib/AppError.js';
import { query } from '../../lib/sql.js';

export async function listMine(userId: string, unreadOnly: boolean, page: number, perPage: number) {
  const where = `recipient_user_id = @u AND channel = N'APLIKASI'${unreadOnly ? ' AND is_read = 0' : ''}`;
  const [{ total }] = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM notifications WHERE ${where}`, { u: userId });
  const rows = await query(
    `SELECT notification_id, type, title, message, related_id, is_read, created_at FROM notifications WHERE ${where}
     ORDER BY created_at DESC OFFSET @off ROWS FETCH NEXT @lim ROWS ONLY`,
    { u: userId, off: (page - 1) * perPage, lim: perPage },
  );
  const [{ unread }] = await query<{ unread: number }>(
    `SELECT COUNT(*) AS unread FROM notifications WHERE recipient_user_id = @u AND channel = N'APLIKASI' AND is_read = 0`,
    { u: userId },
  );
  return { rows, total, unread };
}

export async function markRead(id: string, userId: string) {
  const rows = await query(`UPDATE notifications SET is_read = 1 OUTPUT inserted.notification_id WHERE notification_id = @id AND recipient_user_id = @u`, { id, u: userId });
  if (rows.length === 0) throw new AppError('ERR-DATA-01', 'Notifikasi tidak ditemukan');
}

export async function markAllRead(userId: string) {
  await query(`UPDATE notifications SET is_read = 1 WHERE recipient_user_id = @u AND channel = N'APLIKASI' AND is_read = 0`, { u: userId });
}
