// Unit test aturan validasi gelombang 3 (tanpa database). Jalankan: npm test
import { describe, expect, it } from 'vitest';
import { tempPassword } from '../src/lib/password.js';
import { createBudgetSchema, createCashSchema, rejectCashSchema, listCashQuery } from '../src/modules/finance/finance.schema.js';
import { createUserSchema, updateRolesSchema, updateUserSchema } from '../src/modules/users/users.schema.js';

describe('Kelola Pengguna (FSD-2.4)', () => {
  it('password sementara memenuhi BR-05 (min 8, huruf + angka) dan acak', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const p = tempPassword();
      expect(p).toHaveLength(10);
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/\d/);
      seen.add(p);
    }
    expect(seen.size).toBeGreaterThan(45);
  });
  it('buat akun: username huruf kecil, minimal satu role, email/telepon kosong = null', () => {
    const r = createUserSchema.parse({ full_name: 'Maria C', username: ' Maria.B ', roles: ['Bendahara'], email: '', phone: '' });
    expect(r.username).toBe('maria.b');
    expect(r.email).toBeNull();
    expect(r.phone).toBeNull();
    expect(createUserSchema.safeParse({ full_name: 'Maria C', username: 'maria.b', roles: [] }).success).toBe(false);
    expect(createUserSchema.safeParse({ full_name: 'Maria C', username: 'maria.b', roles: ['Tamu'] }).success).toBe(false);
    expect(createUserSchema.safeParse({ full_name: 'Maria C', username: 'ab', roles: ['Admin'] }).success).toBe(false);
  });
  it('validasi email dan nomor telepon', () => {
    const base = { full_name: 'Maria C', username: 'maria.b', roles: ['Admin'] };
    expect(createUserSchema.safeParse({ ...base, email: 'bukan-email' }).success).toBe(false);
    expect(createUserSchema.safeParse({ ...base, email: 'm@gmail.com', phone: '08123456789' }).success).toBe(true);
    expect(createUserSchema.safeParse({ ...base, phone: '123' }).success).toBe(false);
  });
  it('ubah data wajib memuat minimal satu field; ganti role wajib tidak kosong', () => {
    expect(updateUserSchema.safeParse({}).success).toBe(false);
    expect(updateUserSchema.safeParse({ is_active: false }).success).toBe(true);
    expect(updateRolesSchema.safeParse({ roles: [] }).success).toBe(false);
  });
});

describe('Kas masuk/keluar & anggaran (FSD-2.32, 2.33)', () => {
  it('nominal dari multipart (string) di-coerce dan harus > 0 (ERR-VAL-08)', () => {
    const ok = createCashSchema.parse({ transaction_type: 'KELUAR', amount: '150000', category: 'Konsumsi', budget_id: '3', request_approval: 'true' });
    expect(ok.amount).toBe(150000);
    expect(ok.budget_id).toBe(3);
    expect(ok.request_approval).toBe(true);
    expect(createCashSchema.safeParse({ transaction_type: 'MASUK', amount: '0', category: 'Donasi' }).success).toBe(false);
    expect(createCashSchema.safeParse({ transaction_type: 'MASUK', amount: '-5', category: 'Donasi' }).success).toBe(false);
    expect(createCashSchema.safeParse({ transaction_type: 'MASUK', amount: 'abc', category: 'Donasi' }).success).toBe(false);
  });
  it('jenis transaksi dan format tanggal', () => {
    expect(createCashSchema.safeParse({ transaction_type: 'TRANSFER', amount: 1000, category: 'Lain' }).success).toBe(false);
    expect(createCashSchema.safeParse({ transaction_type: 'MASUK', amount: 1000, category: 'Lain', transaction_date: '20-11-2026' }).success).toBe(false);
    expect(createCashSchema.safeParse({ transaction_type: 'MASUK', amount: 1000, category: 'Lain', transaction_date: '2026-11-20' }).success).toBe(true);
  });
  it('penolakan over-budget wajib beralasan; pos anggaran butuh nama & nominal', () => {
    expect(rejectCashSchema.safeParse({ reason: '' }).success).toBe(false);
    expect(rejectCashSchema.safeParse({ reason: 'Tidak ada dasar' }).success).toBe(true);
    expect(createBudgetSchema.safeParse({ pos_name: 'Konsumsi', planned_amount: '500000' }).success).toBe(true);
    expect(createBudgetSchema.safeParse({ pos_name: 'K', planned_amount: 500000 }).success).toBe(false);
  });
  it('filter daftar kas', () => {
    expect(listCashQuery.safeParse({ month: '2026-11', type: 'KELUAR' }).success).toBe(true);
    expect(listCashQuery.safeParse({ month: '11-2026' }).success).toBe(false);
  });
});
