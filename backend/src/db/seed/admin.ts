import { env } from '../../config/env.js';
import { hashPassword } from '../../lib/password.js';
import { pool } from '../client.js';

/** Admin pertama (akun lain dibuat Admin lewat aplikasi). Wajib ganti password saat login pertama. */
export async function seedAdmin() {
  const exists = await pool.request().input('u', env.SEED_ADMIN_USERNAME)
    .query('SELECT user_id FROM users WHERE username = @u');
  if (exists.recordset.length) return console.log('• admin sudah ada');

  const hash = await hashPassword(env.SEED_ADMIN_PASSWORD);
  await pool.request()
    .input('u', env.SEED_ADMIN_USERNAME)
    .input('h', hash)
    .query(`
      DECLARE @id UNIQUEIDENTIFIER = NEWID();
      INSERT INTO users (user_id, full_name, username, password_hash, must_change_password)
      VALUES (@id, N'Administrator', @u, @h, 1);
      INSERT INTO user_roles (user_id, role_id)
      SELECT @id, role_id FROM roles WHERE role_name = N'Admin';`);
  console.log(`✓ admin (${env.SEED_ADMIN_USERNAME})`);
}
