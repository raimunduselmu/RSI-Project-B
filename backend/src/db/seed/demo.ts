// Data demo yang sama dengan mockup FSD & test script. Matikan dengan SEED_DEMO=false.
// Aman dijalankan ulang (cek berdasarkan username / kode).
import { env } from '../../config/env.js';
import { hashPassword } from '../../lib/password.js';
import { pool } from '../client.js';

const USERS = [
  { username: 'fransiskus.sarpras', name: 'Fransiskus Adi', role: 'Sarpras', division: 'Sarana Prasarana' },
  { username: 'gregorius.pht', name: 'Gregorius Bima', role: 'PHT', division: 'Pengurus Harian' },
  { username: 'maria.bendahara', name: 'Maria Christina', role: 'Bendahara', division: 'Pengurus Harian' },
  { username: 'yohanes.liturgi', name: 'Yohanes Krisna', role: 'Liturgi', division: 'Liturgi' },
];

const CATEGORIES = [
  ['ELEC', 'Elektronik', 90], ['MUSI', 'Alat Musik', 180], ['PERA', 'Perabot', 365], ['LITU', 'Liturgi', 365],
] as const;

const ROOMS = [
  ['Aula Gereja Kampus', 120, 'Aula utama untuk misa dan kegiatan besar'],
  ['Ruang Doa', 20, 'Ruang doa dan adorasi'],
  ['Ruang Rapat KMK', 15, 'Ruang rapat pengurus'],
] as const;

// kode, nama, kategori, lokasi, kondisi, status, sumber, donatur, tanggal, nilai
const ASSETS = [
  ['ELEC-120326', 'Proyektor Epson EB-X', 'ELEC', 'Gudang Sekretariat', 'BAIK', 'DIPINJAM', 'DONASI', 'Anonim', '2026-05-02', 6500000],
  ['MUSI-120326', 'Keyboard Yamaha PSR', 'MUSI', 'Aula', 'BAIK', 'TERSEDIA', 'DONASI', 'Keluarga Wijaya', '2026-03-12', 4250000],
  ['PERA-190626', 'Kursi Lipat (30 unit)', 'PERA', 'Aula', 'BAIK', 'TERSEDIA', 'DONASI', 'Alumni Angkatan 2015', '2026-06-19', 3600000],
  ['ELEC-080826', 'Mic Wireless Shure', 'ELEC', 'Ruang Sound', 'RUSAK_RINGAN', 'PEMELIHARAAN', 'DONASI', 'Anonim', '2026-08-08', 2100000],
  ['LITU-020126', 'Piala Misa Kuningan', 'LITU', 'Sakristi', 'BAIK', 'TERSEDIA', 'KAS', null, '2026-01-02', 1250000],
  ['ELEC-150925', 'Speaker Aktif JBL', 'ELEC', 'Tidak diketahui', 'BAIK', 'HILANG', 'KAS', null, '2025-09-15', 3900000],
] as const;

// Waktu dalam UTC (WIB − 7 jam)
const LOANS = [
  { code: 'PJM-201126-004', type: 'RUANGAN', room: 'Aula Gereja Kampus', assets: [], name: 'Budi Santoso', phone: '081234567890', email: 'budi.santoso@gmail.com',
    org: 'UKM Paduan Suara Mahasiswa', purpose: 'Latihan gabungan persiapan konser Natal.', start: '2026-11-20T11:00:00Z', end: '2026-11-20T14:00:00Z', fac: 1, status: 'MENUNGGU' },
  { code: 'PJM-181126-003', type: 'ASET', room: null, assets: ['PERA-190626'], name: 'Dimas Pratama', phone: '085600112233', email: 'dimas.bemfmipa@gmail.com',
    org: 'BEM FMIPA', purpose: 'Seminar nasional BEM FMIPA.', start: '2026-11-22T00:00:00Z', end: '2026-11-22T08:00:00Z', fac: 0, status: 'DISETUJUI' },
  { code: 'PJM-151126-002', type: 'ASET', room: null, assets: ['ELEC-120326'], name: 'Rina Hapsari', phone: '082111223344', email: 'rina.hapsari@student.uns.ac.id',
    org: null, purpose: 'Presentasi tugas akhir kelompok doa.', start: '2026-11-16T06:00:00Z', end: '2026-11-16T09:00:00Z', fac: 0, status: 'DIAMBIL' },
  { code: 'PJM-101126-001', type: 'RUANGAN', room: 'Aula Gereja Kampus', assets: [], name: 'Yosef Kurnia', phone: '087788990011', email: 'teater.uns@gmail.com',
    org: 'UKM Teater', purpose: 'Gladi resik pementasan teater.', start: '2026-11-12T11:00:00Z', end: '2026-11-12T15:00:00Z', fac: 1, status: 'DITOLAK',
    reason: 'Aula dipakai Misa Kampus pada jam yang sama.' },
];

export async function seedDemo() {
  if (!env.SEED_DEMO) return console.log('• data demo dilewati (SEED_DEMO=false)');
  const hash = await hashPassword(env.SEED_DEMO_PASSWORD);

  for (const u of USERS) {
    await pool.request().input('u', u.username).input('n', u.name).input('d', u.division).input('h', hash).input('r', u.role).query(`
      IF NOT EXISTS (SELECT 1 FROM users WHERE username = @u)
      BEGIN
        DECLARE @id UNIQUEIDENTIFIER = NEWID();
        INSERT INTO users (user_id, full_name, username, division, password_hash, must_change_password) VALUES (@id, @n, @u, @d, @h, 0);
        INSERT INTO user_roles (user_id, role_id) SELECT @id, role_id FROM roles WHERE role_name = @r;
      END`);
  }

  for (const [code, name, days] of CATEGORIES) {
    await pool.request().input('c', code).input('n', name).input('d', days).query(`
      IF NOT EXISTS (SELECT 1 FROM asset_categories WHERE category_code = @c)
        INSERT INTO asset_categories (category_code, category_name, maintenance_default_days) VALUES (@c, @n, @d)`);
  }

  for (const [name, cap, desc] of ROOMS) {
    await pool.request().input('n', name).input('c', cap).input('d', desc).query(`
      IF NOT EXISTS (SELECT 1 FROM rooms WHERE room_name = @n) INSERT INTO rooms (room_name, capacity, description) VALUES (@n, @c, @d)`);
  }

  for (const [code, name, cat, loc, cond, status, source, donor, date, value] of ASSETS) {
    await pool.request()
      .input('code', code).input('name', name).input('cat', cat).input('loc', loc).input('cond', cond).input('status', status)
      .input('source', source).input('donor', donor).input('date', date).input('value', value).input('admin', 'fransiskus.sarpras')
      .query(`
      IF NOT EXISTS (SELECT 1 FROM assets WHERE asset_code = @code)
      BEGIN
        DECLARE @id UNIQUEIDENTIFIER = NEWID();
        DECLARE @uid UNIQUEIDENTIFIER = (SELECT user_id FROM users WHERE username = @admin);
        INSERT INTO assets (asset_id, asset_code, asset_name, category_id, location_text, asset_condition, status, is_lendable,
                            source_type, donor_name, acquired_date, acquisition_value, created_by)
        SELECT @id, @code, @name, category_id, @loc, @cond, @status, 1, @source, @donor, @date, @value, @uid
        FROM asset_categories WHERE category_code = @cat;
        INSERT INTO asset_histories (asset_id, event_type, new_value, note, actor_user_id, actor_name)
        VALUES (@id, N'REGISTRASI', (SELECT @code AS kode, @loc AS lokasi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), N'Data demo', @uid, N'Fransiskus Adi');
      END`);
  }

  for (const l of LOANS) {
    await pool.request()
      .input('code', l.code).input('type', l.type).input('room', l.room).input('name', l.name).input('phone', l.phone).input('email', l.email)
      .input('org', l.org).input('purpose', l.purpose).input('start', new Date(l.start)).input('end', new Date(l.end)).input('fac', l.fac)
      .input('status', l.status).input('reason', 'reason' in l ? l.reason : null).input('assets', JSON.stringify(l.assets))
      .input('reviewer', 'fransiskus.sarpras')
      .query(`
      IF NOT EXISTS (SELECT 1 FROM loan_requests WHERE loan_code = @code)
      BEGIN
        DECLARE @id UNIQUEIDENTIFIER = NEWID();
        DECLARE @rev UNIQUEIDENTIFIER = (SELECT user_id FROM users WHERE username = @reviewer);
        DECLARE @wf INT = (SELECT workflow_id FROM workflows WHERE module = N'PEMINJAMAN');
        DECLARE @step INT = (SELECT TOP 1 step_id FROM workflow_steps WHERE workflow_id = @wf ORDER BY step_order);
        INSERT INTO loan_requests (loan_id, loan_code, request_type, room_id, borrower_name, borrower_phone, borrower_email, borrower_org,
                                   purpose, start_at, end_at, use_facilities, status, workflow_id, current_step,
                                   reviewed_by, reviewed_at, reject_reason, handed_over_at)
        VALUES (@id, @code, @type, (SELECT room_id FROM rooms WHERE room_name = @room), @name, @phone, @email, @org,
                @purpose, @start, @end, @fac, @status, @wf, 1,
                CASE WHEN @status = N'MENUNGGU' THEN NULL ELSE @rev END,
                CASE WHEN @status = N'MENUNGGU' THEN NULL ELSE DATEADD(DAY, -1, @start) END,
                @reason,
                CASE WHEN @status = N'DIAMBIL' THEN DATEADD(MINUTE, -20, @start) END);
        INSERT INTO loan_items (loan_id, asset_id, condition_out)
        SELECT @id, a.asset_id, CASE WHEN @status = N'DIAMBIL' THEN N'BAIK' END
        FROM OPENJSON(@assets) j JOIN assets a ON a.asset_code = j.value;
        IF @status IN (N'DISETUJUI', N'DITOLAK', N'DIAMBIL') AND @step IS NOT NULL
          INSERT INTO approval_logs (step_id, ref_module, ref_id, approver_id, decision, note, decided_at)
          VALUES (@step, N'PEMINJAMAN', @code, @rev, CASE WHEN @status = N'DITOLAK' THEN N'TOLAK' ELSE N'SETUJU' END, @reason, DATEADD(DAY, -1, @start));
      END`);
  }
  console.log(`✓ data demo (akun: ${USERS.map((u) => u.username).join(', ')} · password: SEED_DEMO_PASSWORD)`);
}
