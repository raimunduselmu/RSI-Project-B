import { TRACKING_PREFIX } from '../config/constants.js';

/** Format PREFIX-DDMMYY-NNN. `seq` = urutan pengajuan hari itu (hitung di DB dalam transaksi). */
export function formatTrackingCode(type: keyof typeof TRACKING_PREFIX, seq: number, date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${TRACKING_PREFIX[type]}-${dd}${mm}${yy}-${String(seq).padStart(3, '0')}`;
}

export const TRACKING_REGEX = /^(PJM|INT|PST|REG|IUR)-\d{6}-\d{3}$/;
