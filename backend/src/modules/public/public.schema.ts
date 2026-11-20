// FSD-2.46 — Cek Status publik dengan kode lacak + nomor telepon
import { z } from 'zod';
import { TRACKING_REGEX } from '../../lib/trackingCode.js';

export const statusQuery = z.object({
  code: z.string().trim().toUpperCase().regex(TRACKING_REGEX, 'Format kode: PJM/INT/PST/REG-DDMMYY-NNN'),
  phone: z.string().trim().min(8).max(20),
});

export type StatusQuery = z.infer<typeof statusQuery>;
