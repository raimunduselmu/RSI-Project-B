// FSD-2.45 — parameter dibaca saat runtime (BR-126); setiap perubahan tercatat di audit_logs lewat trigger (BR-127)
import type { RoleName } from '../../config/constants.js';
import { AppError } from '../../lib/AppError.js';
import { normalizePhone, PHONE_REGEX } from '../../lib/phone.js';
import { query, withTransaction } from '../../lib/sql.js';
import { removeFile } from '../../lib/storage.js';
import { fillTemplate, waLink } from '../../lib/waLink.js';
import type { AuthUser } from '../../types/express.js';
import { BENDAHARA_KEYS, TEMPLATE_PLACEHOLDERS, ZERO_ALLOWED } from './settings.schema.js';

interface SettingRow {
  setting_key: string;
  setting_value: string;
  value_type: 'TEXT' | 'NUMBER' | 'IMAGE' | 'PHONE' | 'TEMPLATE';
  is_public: boolean;
  description: string | null;
  updated_at: Date;
  updated_by_name: string | null;
}

export const QRIS_URL = '/api/v1/public/settings/qris-image';
const isAdmin = (u: AuthUser) => u.roles.includes('Admin' as RoleName);
const canEdit = (u: AuthUser, key: string) => isAdmin(u) || (BENDAHARA_KEYS as readonly string[]).includes(key);

/** Nilai untuk ditampilkan: IMAGE → URL (path file tidak dibuka ke klien) */
function present(r: SettingRow) {
  const value = r.value_type === 'IMAGE' ? (r.setting_value ? `${QRIS_URL}?v=${new Date(r.updated_at).getTime()}` : null) : r.setting_value;
  return { key: r.setting_key, value, value_type: r.value_type, is_public: !!r.is_public, description: r.description, updated_at: r.updated_at, updated_by_name: r.updated_by_name };
}

async function rows(where = '', params: Record<string, unknown> = {}) {
  return query<SettingRow>(
    `SELECT s.setting_key, s.setting_value, s.value_type, s.is_public, s.description, s.updated_at, u.full_name AS updated_by_name
     FROM system_settings s LEFT JOIN users u ON u.user_id = s.updated_by ${where} ORDER BY s.setting_key`,
    params,
  );
}

/** GET /settings — Admin semua parameter; Bendahara hanya QRIS & tarif (P) */
export async function list(user: AuthUser) {
  const all = await rows();
  return all.filter((r) => canEdit(user, r.setting_key)).map((r) => ({ ...present(r), editable: true }));
}

/** Validasi & normalisasi nilai sesuai value_type (FSD-2.45 Step 3) */
function normalize(r: SettingRow, raw: string | undefined) {
  const v = (raw ?? '').trim();
  const field = (msg: string) => ({ value: [msg] });
  switch (r.value_type) {
    case 'NUMBER': {
      const n = Number(v.replace(/[.\s]/g, '').replace(',', '.'));
      if (!v || !Number.isFinite(n)) throw new AppError('ERR-VAL-01', undefined, field('Isi dengan angka'));
      if (n < 0 || (n === 0 && !ZERO_ALLOWED.includes(r.setting_key))) throw new AppError('ERR-VAL-08', undefined, field('Nominal harus lebih dari 0'));
      return String(Math.round(n));
    }
    case 'PHONE': {
      const s = v.replace(/[\s-]/g, '');
      if (!PHONE_REGEX.test(s)) throw new AppError('ERR-VAL-03', undefined, field('Contoh: 08123456789'));
      return normalizePhone(s);
    }
    case 'TEMPLATE': {
      if (!v) throw new AppError('ERR-VAL-01', undefined, field('Templat wajib diisi'));
      const unknown = [...v.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => !(TEMPLATE_PLACEHOLDERS as readonly string[]).includes(k));
      if (unknown.length) {
        throw new AppError('ERR-VAL-01', `Placeholder tidak dikenali: ${unknown.map((k) => `{${k}}`).join(', ')}`, field(`Gunakan: ${TEMPLATE_PLACEHOLDERS.map((k) => `{${k}}`).join(' ')}`));
      }
      return v;
    }
    case 'TEXT':
      if (!v) throw new AppError('ERR-VAL-01', undefined, field('Wajib diisi'));
      return v;
    default:
      throw new AppError('ERR-VAL-01', 'Gambar diunggah sebagai file (field "file")');
  }
}

/** Pratinjau setelah simpan: tautan wa.me untuk nomor/templat */
async function preview(r: SettingRow, value: string) {
  if (r.value_type === 'PHONE') return { wa_link: waLink(value, 'Halo, ini uji tautan dari Sistem KMK UNS.') };
  if (r.value_type === 'TEMPLATE') {
    const phone = (await query<{ setting_value: string }>(`SELECT setting_value FROM system_settings WHERE setting_key = N'WA_BENDAHARA'`))[0]?.setting_value;
    const text = fillTemplate(value, { nama: 'Contoh Nama', bulan: 'November 2026', kode: 'IUR-201126-001', total: 'Rp25.000', tanggal: '20 November 2026' });
    return { sample_text: text, wa_link: phone ? waLink(phone, text) : null };
  }
  return null;
}

/** PATCH /settings/:key */
export async function update(key: string, rawValue: string | undefined, imagePath: string | undefined, user: AuthUser, ip?: string) {
  const found = (await rows('WHERE s.setting_key = @key', { key }))[0];
  try {
    if (!found) throw new AppError('ERR-DATA-01', 'Parameter tidak ditemukan');
    if (!canEdit(user, key)) throw new AppError('ERR-AUTH-03');

    let value: string;
    if (found.value_type === 'IMAGE') {
      if (!imagePath) throw new AppError('ERR-VAL-01', 'Unggah gambar JPG/PNG', { file: ['Unggah gambar JPG/PNG maksimal 5 MB'] });
      value = imagePath;
    } else {
      if (imagePath) await removeFile(imagePath);
      value = normalize(found, rawValue);
    }

    await withTransaction(user, ip, (tx) =>
      query(`UPDATE system_settings SET setting_value = @v, updated_by = @u, updated_at = SYSUTCDATETIME() WHERE setting_key = @key`, { v: value, u: user.id, key }, tx),
    );
    if (found.value_type === 'IMAGE' && found.setting_value) await removeFile(found.setting_value); // gambar lama dibuang

    const after = (await rows('WHERE s.setting_key = @key', { key }))[0];
    return { ...present(after), preview: await preview(after, value) };
  } catch (e) {
    if (imagePath) await removeFile(imagePath); // simpan gagal → file baru dibuang
    throw e;
  }
}

/* ---------------- Publik (GET /public/settings) ---------------- */
export async function publicSettings() {
  const pub = await rows('WHERE s.is_public = 1');
  const map: Record<string, string | null> = {};
  for (const r of pub) map[r.setting_key] = present(r).value;
  const link = (k: string, text: string) => (map[k] ? waLink(map[k] as string, text) : null);
  return {
    settings: map,
    wa_links: {
      admin: link('WA_ADMIN', 'Halo Admin KMK UNS, saya lupa password akun pengurus.'),
      bendahara: link('WA_BENDAHARA', 'Halo Bendahara KMK UNS.'),
      sarpras: link('WA_SARPRAS', 'Halo Sarpras KMK UNS.'),
    },
  };
}

export async function qrisImagePath() {
  const r = (await rows(`WHERE s.setting_key = N'QRIS_IMAGE'`))[0];
  if (!r?.setting_value) throw new AppError('ERR-DATA-01', 'Gambar QRIS belum diatur');
  return r.setting_value as string;
}
