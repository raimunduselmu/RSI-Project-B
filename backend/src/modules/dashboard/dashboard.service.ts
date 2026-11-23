// FSD-2.40 Dashboard ringkasan per role. Tiap bagian hanya diisi bila pengguna berhak melihatnya.
import { query } from '../../lib/sql.js';
import { todayWib } from '../../lib/time.js';
import type { AuthUser } from '../../types/express.js';

const one = async <T>(text: string, params: Record<string, unknown> = {}) => (await query<T>(text, params))[0];
const has = (u: AuthUser, ...roles: string[]) => u.roles.includes('Admin') || u.roles.some((r) => roles.includes(r));

export async function summary(user: AuthUser) {
  const out: Record<string, unknown> = {};
  const today = todayWib();

  const notif = await one<{ unread: number }>(
    `SELECT COUNT(*) AS unread FROM notifications WHERE recipient_user_id = @u AND channel = N'APLIKASI' AND is_read = 0`,
    { u: user.id },
  );
  out.notifications = { unread: notif.unread };

  // Iuran kas milik sendiri (hanya bila punya tagihan)
  const kas = await one<{ belum: number; menunggu: number; lunas: number }>(
    `SELECT SUM(CASE WHEN d.status = N'BELUM_LUNAS' AND d.due_month <= @today THEN 1 ELSE 0 END) AS belum,
            SUM(CASE WHEN d.status = N'MENUNGGU_VERIFIKASI' THEN 1 ELSE 0 END) AS menunggu,
            SUM(CASE WHEN d.status = N'LUNAS' THEN 1 ELSE 0 END) AS lunas
     FROM kas_dues d JOIN periods p ON p.period_id = d.period_id AND p.status = N'AKTIF' WHERE d.user_id = @u`,
    { u: user.id, today },
  );
  if (kas && (kas.belum ?? 0) + (kas.menunggu ?? 0) + (kas.lunas ?? 0) > 0) {
    out.my_kas = { belum_lunas: kas.belum ?? 0, menunggu_verifikasi: kas.menunggu ?? 0, lunas: kas.lunas ?? 0 };
  }

  if (has(user, 'Sarpras', 'PHT')) {
    const l = await one<{ menunggu: number; diambil: number; hari_ini: number }>(
      `SELECT SUM(CASE WHEN status = N'MENUNGGU' THEN 1 ELSE 0 END) AS menunggu,
              SUM(CASE WHEN status = N'DIAMBIL' THEN 1 ELSE 0 END) AS diambil,
              SUM(CASE WHEN status IN (N'DISETUJUI', N'DIAMBIL') AND CAST(DATEADD(HOUR, 7, start_at) AS DATE) = @today THEN 1 ELSE 0 END) AS hari_ini
       FROM loan_requests`,
      { today },
    );
    const a = await one<{ total: number; tersedia: number; dipinjam: number; pemeliharaan: number }>(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = N'TERSEDIA' THEN 1 ELSE 0 END) AS tersedia,
              SUM(CASE WHEN status IN (N'DIPINJAM', N'DIGUNAKAN') THEN 1 ELSE 0 END) AS dipinjam,
              SUM(CASE WHEN status = N'PEMELIHARAAN' THEN 1 ELSE 0 END) AS pemeliharaan
       FROM assets WHERE status <> N'NONAKTIF'`,
    );
    const m = await one<{ segera: number; terlambat: number }>(
      `SELECT SUM(CASE WHEN s.next_due_date >= @today AND s.next_due_date <= DATEADD(DAY, 7, @today) THEN 1 ELSE 0 END) AS segera,
              SUM(CASE WHEN s.next_due_date < @today THEN 1 ELSE 0 END) AS terlambat
       FROM maintenance_schedules s JOIN assets x ON x.asset_id = s.asset_id AND x.is_deleted = 0 WHERE s.is_active = 1`,
      { today },
    );
    const inc = await one<{ terbuka: number }>(`SELECT COUNT(*) AS terbuka FROM incidents WHERE status <> N'SELESAI'`);
    const use = await one<{ berlangsung: number }>(`SELECT COUNT(*) AS berlangsung FROM usage_reports WHERE status = N'BERLANGSUNG'`);
    const st = await one<{ c: number }>(`SELECT COUNT(*) AS c FROM stocktake_periods WHERE status = N'TERBUKA'`);
    out.sarpras = {
      peminjaman: { menunggu_persetujuan: l.menunggu ?? 0, sedang_dipinjam: l.diambil ?? 0, jadwal_hari_ini: l.hari_ini ?? 0 },
      aset: { total: a.total, tersedia: a.tersedia ?? 0, dipinjam: a.dipinjam ?? 0, pemeliharaan: a.pemeliharaan ?? 0 },
      pemeliharaan: { jatuh_tempo_7_hari: m.segera ?? 0, terlambat: m.terlambat ?? 0 },
      insiden_terbuka: inc.terbuka,
      pemakaian_internal_berlangsung: use.berlangsung,
      pemeriksaan_fisik_terbuka: st.c > 0,
    };
  }

  if (has(user, 'Bendahara', 'PHT')) {
    const period = await one<{ period_id: number; period_name: string }>(`SELECT TOP 1 period_id, period_name FROM periods WHERE status = N'AKTIF' ORDER BY start_date DESC`);
    if (period) {
      const k = await one<{ masuk: number; keluar: number }>(
        `SELECT ISNULL(SUM(CASE WHEN transaction_type = N'MASUK' THEN amount END), 0) AS masuk,
                ISNULL(SUM(CASE WHEN transaction_type = N'KELUAR' THEN amount END), 0) AS keluar
         FROM cash_transactions WHERE period_id = @p AND status = N'DISETUJUI'`,
        { p: period.period_id },
      );
      const pay = await one<{ c: number }>(`SELECT COUNT(*) AS c FROM kas_payments WHERE period_id = @p AND status = N'MENUNGGU_VERIFIKASI'`, { p: period.period_id });
      const ob = await one<{ c: number }>(`SELECT COUNT(*) AS c FROM cash_transactions WHERE period_id = @p AND status = N'MENUNGGU_PERSETUJUAN'`, { p: period.period_id });
      out.keuangan = {
        period: period.period_name,
        total_masuk: Number(k.masuk),
        total_keluar: Number(k.keluar),
        saldo: Number(k.masuk) - Number(k.keluar),
        iuran_menunggu_verifikasi: pay.c,
        pengeluaran_menunggu_persetujuan: ob.c,
      };
    }
  }

  if (has(user, 'Admin')) {
    const u = await one<{ aktif: number; nonaktif: number; terkunci: number }>(
      `SELECT SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS aktif,
              SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS nonaktif,
              SUM(CASE WHEN locked_until > SYSUTCDATETIME() THEN 1 ELSE 0 END) AS terkunci
       FROM users`,
    );
    const failed = await one<{ c: number }>(`SELECT COUNT(*) AS c FROM notification_logs WHERE status = N'FAILED'`);
    out.admin = { pengguna_aktif: u.aktif ?? 0, pengguna_nonaktif: u.nonaktif ?? 0, akun_terkunci: u.terkunci ?? 0, email_gagal: failed.c };
  }
  return out;
}
