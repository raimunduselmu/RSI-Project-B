import { query } from './sql.js';

/** Baca satu parameter dari system_settings (AC-14: tidak boleh hardcode). */
export async function getSetting(key: string): Promise<string | null> {
  const rows = await query<{ setting_value: string }>('SELECT setting_value FROM system_settings WHERE setting_key = @key', { key });
  return rows[0]?.setting_value ?? null;
}
