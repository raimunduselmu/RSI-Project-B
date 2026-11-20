/** Rentang satu bulan dalam WIB (UTC+7), dikembalikan sebagai waktu UTC untuk query DB */
export function monthRangeUtc(month?: string) {
  const now = new Date(Date.now() + 7 * 3600_000);
  const [y, m] = month ? month.split('-').map(Number) : [now.getUTCFullYear(), now.getUTCMonth() + 1];
  const start = new Date(Date.UTC(y, m - 1, 1) - 7 * 3600_000);
  const end = new Date(Date.UTC(y, m, 1) - 7 * 3600_000);
  return { start, end, month: `${y}-${String(m).padStart(2, '0')}` };
}
