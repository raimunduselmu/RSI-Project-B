// Menjalankan semua file .sql di folder /database (TSD Bagian 5).
// Urutan: functions → views → procedures → triggers. File dipecah per baris "GO".
import fs from 'node:fs';
import path from 'node:path';
import { pool, poolReady } from '../client.js';

const DB_DIR = process.env.DATABASE_DIR ?? path.resolve(process.cwd(), '../database');
const ORDER = ['functions', 'views', 'procedures', 'triggers'];

await poolReady;
let ok = 0, skipped = 0, failed = 0;
for (const folder of ORDER) {
  const dir = path.join(DB_DIR, folder);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const code = text.replace(/--.*$/gm, '').trim();
    if (!code) { skipped++; continue; }                 // file berisi TODO saja
    try {
      for (const batch of text.split(/^\s*GO\s*$/im).filter((b) => b.trim())) {
        await pool.request().batch(batch);
      }
      console.log(`✓ ${folder}/${file}`); ok++;
    } catch (e) {
      console.error(`✗ ${folder}/${file}: ${(e as Error).message}`); failed++;
    }
  }
}
console.log(`Selesai: ${ok} berhasil, ${skipped} dilewati (TODO), ${failed} gagal`);
await pool.close();
process.exit(failed ? 1 : 0);
