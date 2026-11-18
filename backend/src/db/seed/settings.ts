import { pool } from '../client.js';

const DEFAULTS: [key: string, value: string, type: string, isPublic: boolean, desc: string][] = [
  ['KAS_MONTHLY_RATE', '25000', 'NUMBER', false, 'Tarif iuran kas per bulan'],
  ['FACILITY_RATE', '0', 'NUMBER', true, 'Tarif penggunaan fasilitas'],
  ['QRIS_IMAGE', '', 'IMAGE', true, 'Gambar QRIS untuk pembayaran iuran'],
  ['WA_ADMIN', '6281200000000', 'PHONE', true, 'Nomor WhatsApp Admin'],
  ['WA_BENDAHARA', '6281200000000', 'PHONE', true, 'Nomor WhatsApp Bendahara'],
  ['WA_SARPRAS', '6281200000000', 'PHONE', true, 'Nomor WhatsApp Sarpras'],
  ['WA_TEMPLATE_KAS_CASH', 'Halo Bendahara, saya {nama} ingin membayar iuran kas tunai untuk {bulan}.', 'TEMPLATE', true, 'Templat wa.me iuran cash'],
];

export async function seedSettings() {
  for (const [k, v, t, p, d] of DEFAULTS) {
    await pool.request().input('k', k).input('v', v).input('t', t).input('p', p).input('d', d).query(`
      IF NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = @k)
        INSERT INTO system_settings (setting_key, setting_value, value_type, is_public, description)
        VALUES (@k, @v, @t, @p, @d)`);
  }
  console.log('✓ system_settings');
}
