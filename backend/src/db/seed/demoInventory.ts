// Data demo gelombang 4: jadwal pemeliharaan, laporan insiden yang sesuai status aset demo.
// Aman dijalankan ulang. Matikan dengan SEED_DEMO=false.
import { env } from '../../config/env.js';
import { pool } from '../client.js';

const today = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400_000).toISOString().slice(0, 10);

// kode aset, tugas, interval, jatuh tempo (relatif hari ini), H-pengingat
const SCHEDULES: [string, string, number, number, number][] = [
  ['ELEC-120326', 'Bersihkan filter & cek lampu proyektor', 90, 3, 7],
  ['MUSI-120326', 'Setel & bersihkan keyboard', 180, 20, 7],
  ['ELEC-080826', 'Servis mic wireless', 30, -2, 3], // terlambat → contoh status TERLAMBAT
];

// kode aset, jenis, deskripsi, penanggung jawab, status (sesuai status aset di demo.ts)
const INCIDENTS: [string, 'HILANG' | 'RUSAK', string, string, 'DILAPORKAN' | 'DIPROSES'][] = [
  ['ELEC-150925', 'HILANG', 'Speaker tidak ditemukan setelah acara Malam Keakraban.', 'Panitia Makrab 2025', 'DIPROSES'],
  ['ELEC-080826', 'RUSAK', 'Suara mic putus-putus, kemungkinan antena receiver.', 'Seksi Sound Misa Mingguan', 'DILAPORKAN'],
];

export async function seedDemoInventory() {
  if (!env.SEED_DEMO) return;
  const t = today();
  for (const [code, task, interval, due, remind] of SCHEDULES) {
    await pool.request()
      .input('code', code).input('task', task).input('i', interval).input('due', addDays(t, due)).input('r', remind)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM maintenance_schedules s JOIN assets a ON a.asset_id = s.asset_id WHERE a.asset_code = @code AND s.task_name = @task)
          INSERT INTO maintenance_schedules (asset_id, task_name, interval_days, next_due_date, reminder_days_before, is_active)
          SELECT asset_id, @task, @i, @due, @r, 1 FROM assets WHERE asset_code = @code`);
  }
  for (const [code, type, desc, resp, status] of INCIDENTS) {
    await pool.request()
      .input('code', code).input('type', type).input('desc', desc).input('resp', resp).input('st', status).input('d', addDays(t, -14))
      .query(`
        IF NOT EXISTS (SELECT 1 FROM incidents i JOIN assets a ON a.asset_id = i.asset_id WHERE a.asset_code = @code AND i.incident_type = @type)
          INSERT INTO incidents (asset_id, incident_type, occurred_date, description, reported_by, responsible_name, status, follow_up)
          SELECT a.asset_id, @type, @d, @desc, (SELECT user_id FROM users WHERE username = N'fransiskus.sarpras'), @resp, @st,
                 CASE WHEN @st = N'DIPROSES' THEN N'Sudah ditanyakan ke panitia; menunggu konfirmasi.' END
          FROM assets a WHERE a.asset_code = @code`);
  }
  console.log('✓ data demo inventaris (jadwal pemeliharaan, laporan insiden)');
}
