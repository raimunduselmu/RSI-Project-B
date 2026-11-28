// Cadangan untuk `drizzle-kit migrate`: jalankan file drizzle/*/migration.sql langsung lewat pool aplikasi.
// Dipakai untuk database cloud baru (kosong). Kalau tabel sudah ada, script berhenti tanpa mengubah apa pun.
import fs from 'node:fs';
import path from 'node:path';
import { pool, poolReady } from '../client.js';

await poolReady;
const db = (await pool.request().query('SELECT DB_NAME() AS n')).recordset[0].n;
const count = (await pool.request().query('SELECT COUNT(*) AS n FROM sys.tables')).recordset[0].n;
console.log(`Database: ${db} — jumlah tabel sekarang: ${count}`);

if (count > 0 && !process.argv.includes('--force')) {
  console.log('Tabel sudah ada, migrasi dilewati. (Pakai --force kalau yakin ingin menjalankan ulang.)');
  await pool.close();
  process.exit(0);
}

const dir = path.resolve(process.cwd(), 'drizzle');
const folders = fs.readdirSync(dir).filter((f) => fs.existsSync(path.join(dir, f, 'migration.sql'))).sort();
for (const f of folders) {
  const parts = fs.readFileSync(path.join(dir, f, 'migration.sql'), 'utf8')
    .split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);
  for (const stmt of parts) await pool.request().batch(stmt);
  console.log(`✓ ${f} (${parts.length} statement)`);
}
const after = (await pool.request().query('SELECT COUNT(*) AS n FROM sys.tables')).recordset[0].n;
console.log(`Selesai. Jumlah tabel: ${after}`);
await pool.close();
process.exit(0);
