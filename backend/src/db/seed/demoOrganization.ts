// Data demo gelombang 2: periode, divisi, jabatan, pengurus, tagihan & pengajuan iuran kas.
// Aman dijalankan ulang. Matikan dengan SEED_DEMO=false.
import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';
import { pool } from '../client.js';

const PERIOD = { name: '2026/2027', start: '2026-07-01', end: '2027-06-30' };

// divisi → role divisi; jabatan → [nama, ketua?, role khusus jabatan]
const STRUCTURE: { division: string; role: string | null; positions: [string, boolean, string | null][] }[] = [
  { division: 'Pengurus Harian', role: 'PHT', positions: [['Ketua', true, null], ['Bendahara', false, 'Bendahara']] },
  { division: 'Sarana Prasarana', role: 'Sarpras', positions: [['Kepala Divisi Sarpras', true, null], ['Anggota Sarpras', false, null]] },
  { division: 'Liturgi', role: 'Liturgi', positions: [['Koordinator Liturgi', true, null], ['Anggota Liturgi', false, null]] },
];

// umat → akun (boleh null = pengurus tanpa akun), jabatan
const OFFICERS: { name: string; nim: string; username: string | null; division: string; position: string }[] = [
  { name: 'Gregorius Bima', nim: 'L0224011', username: 'gregorius.pht', division: 'Pengurus Harian', position: 'Ketua' },
  { name: 'Maria Christina', nim: 'L0224018', username: 'maria.bendahara', division: 'Pengurus Harian', position: 'Bendahara' },
  { name: 'Fransiskus Adi', nim: 'L0224023', username: 'fransiskus.sarpras', division: 'Sarana Prasarana', position: 'Kepala Divisi Sarpras' },
  { name: 'Yohanes Krisna', nim: 'L0224030', username: 'yohanes.liturgi', division: 'Liturgi', position: 'Koordinator Liturgi' },
  { name: 'Agnes Putri', nim: 'L0225007', username: null, division: 'Liturgi', position: 'Anggota Liturgi' },
];
const OFFICER_START = '2026-08-01';

// PNG 1×1 untuk bukti pembayaran demo
const DEMO_PROOF = 'kas/demo-bukti.png';
const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// pengajuan iuran demo: [username, jumlah bulan pertama, metode, setujui oleh]
const PAYMENTS: [string, number, 'QRIS' | 'CASH', string | null][] = [
  ['fransiskus.sarpras', 2, 'QRIS', 'maria.bendahara'], // Agu–Sep lunas
  ['gregorius.pht', 1, 'CASH', null],                   // menunggu verifikasi Bendahara
  ['maria.bendahara', 1, 'QRIS', null],                 // milik Bendahara → menunggu verifikasi PHT
];

export async function seedDemoOrganization() {
  if (!env.SEED_DEMO) return;

  // 1. Periode AKTIF (dibuat hanya bila belum ada periode AKTIF)
  await pool.request().input('n', PERIOD.name).input('s', PERIOD.start).input('e', PERIOD.end).query(`
    IF NOT EXISTS (SELECT 1 FROM periods WHERE status = N'AKTIF') AND NOT EXISTS (SELECT 1 FROM periods WHERE period_name = @n)
      INSERT INTO periods (period_name, start_date, end_date, status) VALUES (@n, @s, @e, N'AKTIF');`);
  const period = (await pool.request().input('n', PERIOD.name).query(`SELECT period_id, status FROM periods WHERE period_name = @n`)).recordset[0];
  if (!period || period.status !== 'AKTIF') return console.log('• demo kepengurusan dilewati (periode demo sudah diarsipkan atau ada periode AKTIF lain)');

  // 2. Divisi & jabatan
  for (const d of STRUCTURE) {
    await pool.request().input('p', period.period_id).input('n', d.division).input('r', d.role).query(`
      IF NOT EXISTS (SELECT 1 FROM divisions WHERE period_id = @p AND division_name = @n)
        INSERT INTO divisions (period_id, division_name, role_id) SELECT @p, @n, (SELECT role_id FROM roles WHERE role_name = @r);`);
    for (const [pos, leader, role] of d.positions) {
      await pool.request().input('p', period.period_id).input('d', d.division).input('n', pos).input('l', leader).input('r', role).query(`
        DECLARE @div INT = (SELECT division_id FROM divisions WHERE period_id = @p AND division_name = @d);
        IF NOT EXISTS (SELECT 1 FROM positions WHERE division_id = @div AND position_name = @n)
          INSERT INTO positions (division_id, position_name, is_leader, role_id) SELECT @div, @n, @l, (SELECT role_id FROM roles WHERE role_name = @r);`);
    }
  }

  // 3. Umat + pengurus. Role akun demo (dibuat seedDemo tanpa officer_id) ditautkan ke jabatan
  //    agar ikut dicabut saat periode diarsipkan (BR-116).
  for (const o of OFFICERS) {
    await pool.request()
      .input('name', o.name).input('nim', o.nim).input('u', o.username).input('p', period.period_id)
      .input('d', o.division).input('pos', o.position).input('s', OFFICER_START)
      .query(`
      DECLARE @uid UNIQUEIDENTIFIER = (SELECT user_id FROM users WHERE username = @u);
      IF NOT EXISTS (SELECT 1 FROM members WHERE nim_nip = @nim)
        INSERT INTO members (full_name, member_category, nim_nip, status, consent_given, user_id)
        VALUES (@name, N'MAHASISWA', @nim, N'AKTIF', 1, @uid);
      DECLARE @mid UNIQUEIDENTIFIER = (SELECT member_id FROM members WHERE nim_nip = @nim);
      DECLARE @posid INT = (SELECT ps.position_id FROM positions ps JOIN divisions dv ON dv.division_id = ps.division_id
                            WHERE dv.period_id = @p AND dv.division_name = @d AND ps.position_name = @pos);
      IF NOT EXISTS (SELECT 1 FROM officers WHERE member_id = @mid AND position_id = @posid)
      BEGIN
        DECLARE @oid UNIQUEIDENTIFIER = NEWID();
        INSERT INTO officers (officer_id, member_id, position_id, user_id, start_date) VALUES (@oid, @mid, @posid, @uid, @s);
        IF @uid IS NOT NULL
        BEGIN
          DECLARE @rid INT = (SELECT COALESCE(ps.role_id, dv.role_id) FROM positions ps JOIN divisions dv ON dv.division_id = ps.division_id WHERE ps.position_id = @posid);
          UPDATE TOP (1) user_roles SET officer_id = @oid WHERE user_id = @uid AND role_id = @rid AND officer_id IS NULL AND revoked_at IS NULL;
          IF @@ROWCOUNT = 0 INSERT INTO user_roles (user_id, role_id, officer_id) VALUES (@uid, @rid, @oid);
        END
      END`);
  }

  // 4. Tagihan bulanan (BR-120)
  await pool.request().query(`EXEC dbo.sp_sync_kas_dues;`);

  // 5. Pengajuan iuran demo lewat stored procedure yang sama dengan API
  const dir = path.resolve(env.UPLOAD_DIR, 'kas');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.resolve(env.UPLOAD_DIR, DEMO_PROOF), Buffer.from(PNG_1PX, 'base64'));

  for (const [username, months, method, approver] of PAYMENTS) {
    await pool.request().input('u', username).input('n', months).input('m', method).input('proof', DEMO_PROOF).input('a', approver).query(`
      DECLARE @uid UNIQUEIDENTIFIER = (SELECT user_id FROM users WHERE username = @u);
      IF @uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM kas_payments WHERE user_id = @uid)
      BEGIN
        DECLARE @ids NVARCHAR(MAX) = (
          SELECT '[' + STRING_AGG('"' + CAST(due_id AS NVARCHAR(36)) + '"', ',') + ']'
          FROM (SELECT TOP (@n) due_id FROM kas_dues WHERE user_id = @uid AND status = N'BELUM_LUNAS' ORDER BY due_month) x);
        DECLARE @pid UNIQUEIDENTIFIER, @code NVARCHAR(30), @total DECIMAL(15,2), @cnt INT, @res NVARCHAR(30);
        EXEC dbo.sp_submit_kas_payment @user_id = @uid, @due_ids = @ids, @method = @m, @proof_path = @proof, @note = N'Data demo',
             @payment_id = @pid OUTPUT, @payment_code = @code OUTPUT, @total_amount = @total OUTPUT, @months = @cnt OUTPUT, @result = @res OUTPUT;
        IF @res = N'SUCCESS' AND @a IS NOT NULL
        BEGIN
          DECLARE @vid UNIQUEIDENTIFIER = (SELECT user_id FROM users WHERE username = @a), @ct UNIQUEIDENTIFIER, @res2 NVARCHAR(30);
          EXEC dbo.sp_verify_kas_payment @payment_id = @pid, @verifier_id = @vid, @decision = N'SETUJU',
               @cash_transaction_id = @ct OUTPUT, @result = @res2 OUTPUT;
        END
      END`);
  }
  console.log('✓ demo kepengurusan & iuran kas (periode 2026/2027, akun: maria.bendahara, yohanes.liturgi)');
}
