// Atur ulang password akun admin & demo sesuai .env (SEED_ADMIN_PASSWORD, SEED_DEMO_PASSWORD)
// dan buka kunci login. Hanya untuk lingkungan pengembangan/pengujian.
// Jalankan dari folder backend:  npx tsx src/db/scripts/reset-demo-passwords.ts
import { env } from '../../config/env.js';
import { hashPassword } from '../../lib/password.js';
import { pool, poolReady } from '../client.js';

const DEMO = ['fransiskus.sarpras', 'gregorius.pht', 'maria.bendahara', 'yohanes.liturgi'];

await poolReady;
const adminHash = await hashPassword(env.SEED_ADMIN_PASSWORD);
const demoHash = await hashPassword(env.SEED_DEMO_PASSWORD);

// --demo-only: admin tidak disentuh (dipakai reset malam di database cloud publik)
if (!process.argv.includes('--demo-only')) {
const a = await pool.request().input('u', env.SEED_ADMIN_USERNAME).input('h', adminHash).query(
  `UPDATE users SET password_hash = @h, failed_attempts = 0, locked_until = NULL WHERE username = @u`);
console.log(`admin (${env.SEED_ADMIN_USERNAME}): ${a.rowsAffected[0]} akun diperbarui`);
}

for (const u of DEMO) {
  const r = await pool.request().input('u', u).input('h', demoHash).query(
    `UPDATE users SET password_hash = @h, failed_attempts = 0, locked_until = NULL, is_active = 1 WHERE username = @u`);
  console.log(`${u}: ${r.rowsAffected[0]} akun diperbarui`);
}
await pool.close();
process.exit(0);
