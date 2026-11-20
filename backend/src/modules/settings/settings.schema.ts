// FSD-2.45 — Kelola Parameter Konfigurasi Sistem
import { z } from 'zod';

export const keyParam = z.object({ key: z.string().regex(/^[A-Z_]{2,50}$/, 'Kunci parameter tidak valid') });

/** Nilai teks; untuk IMAGE dikirim sebagai file multipart (field "file") sehingga value boleh kosong */
export const updateSettingSchema = z.object({ value: z.string().max(1000).optional() });

/** Parameter yang boleh diubah Bendahara (TSD 3.2 PATCH /settings/{key}); sisanya hanya Admin */
export const BENDAHARA_KEYS = ['QRIS_IMAGE', 'KAS_MONTHLY_RATE', 'FACILITY_RATE'] as const;

/** Placeholder templat wa.me yang dikenali (FSD-2.45 Step 3) */
export const TEMPLATE_PLACEHOLDERS = ['nama', 'bulan', 'kode', 'total', 'tanggal'] as const;

/** Nominal yang boleh 0 (0 = gratis). Nominal lain wajib > 0 (ERR-VAL-08) */
export const ZERO_ALLOWED = ['FACILITY_RATE'];
