// Format tampilan nominal uang (iuran kas, kas umum, laporan).

/**
 * Overloading: satu nama fungsi, tiga bentuk pemanggilan.
 * - rupiah(150000)          → "Rp150.000"
 * - rupiah(150000, false)   → "150.000"   (tanpa simbol, mis. kolom ekspor)
 * - rupiah('2500000.00')    → "Rp2.500.000" (kolom DECIMAL SQL Server bisa terbaca sebagai string)
 */
export function rupiah(amount: number): string;
export function rupiah(amount: number, withSymbol: boolean): string;
export function rupiah(amount: string): string;
export function rupiah(amount: number | string, withSymbol = true): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  const text = Math.round(Number.isFinite(n) ? n : 0).toLocaleString('id-ID');
  return withSymbol ? `Rp${text}` : text;
}
