import { ROLES } from '../../config/constants.js';
import { pool } from '../client.js';

export async function seedRoles() {
  for (const name of ROLES) {
    await pool.request().input('n', name).query(`
      IF NOT EXISTS (SELECT 1 FROM roles WHERE role_name = @n)
        INSERT INTO roles (role_name) VALUES (@n)`);
  }
  console.log('✓ roles');
}
