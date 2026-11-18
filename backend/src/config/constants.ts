// Nilai tetap dari FSD/TSD. Nilai yang bisa diubah Admin ada di tabel system_settings.

export const ROLES = ['Admin', 'Sarpras', 'PHT', 'Liturgi', 'Bendahara', 'Pastor'] as const;
export type RoleName = (typeof ROLES)[number];

/** Semua role yang dianggap "pengurus" (TSD 3.2 keterangan Auth) */
export const PENGURUS: RoleName[] = ['Admin', 'Sarpras', 'PHT', 'Liturgi', 'Bendahara', 'Pastor'];

export const COOKIE_NAME = 'kmk_token';

/** Prefiks kode lacak: PREFIX-DDMMYY-NNN */
export const TRACKING_PREFIX = {
  LOAN: 'PJM',
  MASS_INTENTION: 'INT',
  PASTORAL: 'PST',
  REGISTRATION: 'REG',
  KAS: 'IUR',
} as const;

export const LOGIN = { MAX_FAILED: 3, LOCK_MINUTES: 15 } as const;           // BR-01

export const UPLOAD = {
  MAX_BYTES: 5 * 1024 * 1024,
  MIME: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const RATE_LIMIT = {
  PUBLIC_FORM: { windowMs: 60 * 60 * 1000, limit: 5 },                         // 5/jam/IP
  STATUS_CHECK: { windowMs: 60 * 60 * 1000, limit: 10 },                       // 10/jam/IP
} as const;

export const EMAIL_RETRY = { MAX_ATTEMPTS: 3 } as const;                       // BR-113

export const PAGINATION = { DEFAULT: 15, MAX: 100 } as const;                  // TSD 7.2

export const SETTING_KEYS = {
  QRIS_IMAGE: 'QRIS_IMAGE',
  KAS_MONTHLY_RATE: 'KAS_MONTHLY_RATE',
  FACILITY_RATE: 'FACILITY_RATE',
  WA_ADMIN: 'WA_ADMIN',
  WA_BENDAHARA: 'WA_BENDAHARA',
  WA_SARPRAS: 'WA_SARPRAS',
} as const;
