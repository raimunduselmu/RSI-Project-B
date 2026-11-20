// Unit test aturan validasi gelombang 2 (tanpa database). Jalankan: npm test
import { describe, expect, it } from 'vitest';
import { listPaymentQuery, paymentKeyParam, rejectSchema, submitPaymentSchema } from '../src/modules/kas/kas.schema.js';
import { archivePeriodSchema, createOfficerSchema, createPeriodSchema, createPositionSchema, updateOfficerSchema } from '../src/modules/organization/organization.schema.js';
import { fillTemplate } from '../src/lib/waLink.js';
import { todayWib } from '../src/lib/time.js';

const A = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';
const B = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('Iuran kas — ajukan pembayaran (FSD-2.43)', () => {
  it('menerima due_ids sebagai JSON string, daftar dipisah koma, atau array (multipart)', () => {
    for (const due_ids of [JSON.stringify([A, B]), `${A},${B}`, [A, B]]) {
      const r = submitPaymentSchema.safeParse({ due_ids, method: 'QRIS' });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.due_ids).toEqual([A, B]);
    }
  });
  it('menolak tanpa bulan atau metode tidak dikenal (ERR-VAL-01)', () => {
    expect(submitPaymentSchema.safeParse({ due_ids: '[]', method: 'QRIS' }).success).toBe(false);
    expect(submitPaymentSchema.safeParse({ due_ids: [A], method: 'TRANSFER' }).success).toBe(false);
    expect(submitPaymentSchema.safeParse({ due_ids: ['bukan-uuid'], method: 'CASH' }).success).toBe(false);
  });
  it('catatan kosong dianggap null', () => {
    const r = submitPaymentSchema.parse({ due_ids: [A], method: 'CASH', note: '' });
    expect(r.note).toBeNull();
  });
});

describe('Iuran kas — verifikasi (FSD-2.44)', () => {
  it('alasan penolakan wajib (BR-124)', () => {
    expect(rejectSchema.safeParse({ reject_reason: '' }).success).toBe(false);
    expect(rejectSchema.safeParse({ reject_reason: 'Nominal transfer tidak sesuai' }).success).toBe(true);
  });
  it('kunci pengajuan boleh UUID atau kode IUR', () => {
    expect(paymentKeyParam.safeParse({ id: 'IUR-201126-001' }).success).toBe(true);
    expect(paymentKeyParam.safeParse({ id: A }).success).toBe(true);
    expect(paymentKeyParam.safeParse({ id: 'PJM-201126-001' }).success).toBe(false);
  });
  it('filter bulan berformat YYYY-MM', () => {
    expect(listPaymentQuery.safeParse({ month: '2026-08' }).success).toBe(true);
    expect(listPaymentQuery.safeParse({ month: '08-2026' }).success).toBe(false);
  });
});

describe('Kepengurusan (FSD-2.25)', () => {
  it('nama periode YYYY/YYYY dan tanggal selesai setelah mulai', () => {
    expect(createPeriodSchema.safeParse({ period_name: '2026/2027', start_date: '2026-07-01', end_date: '2027-06-30' }).success).toBe(true);
    expect(createPeriodSchema.safeParse({ period_name: '2026-2027', start_date: '2026-07-01', end_date: '2027-06-30' }).success).toBe(false);
    expect(createPeriodSchema.safeParse({ period_name: '2026/2027', start_date: '2027-06-30', end_date: '2026-07-01' }).success).toBe(false);
  });
  it('arsip wajib konfirmasi nama periode', () => {
    expect(archivePeriodSchema.safeParse({}).success).toBe(false);
    expect(archivePeriodSchema.safeParse({ confirm_name: '2026/2027' }).success).toBe(true);
  });
  it('role jabatan hanya Sarpras/PHT/Liturgi/Bendahara; kosong = ikut divisi', () => {
    expect(createPositionSchema.safeParse({ position_name: 'Bendahara', role_name: 'Bendahara' }).success).toBe(true);
    expect(createPositionSchema.parse({ position_name: 'Anggota', role_name: '' }).role_name).toBeNull();
    expect(createPositionSchema.safeParse({ position_name: 'Pembina', role_name: 'Admin' }).success).toBe(false);
  });
  it('penetapan pengurus butuh umat & jabatan; ubah butuh minimal satu field', () => {
    expect(createOfficerSchema.safeParse({ member_id: A, position_id: 3 }).success).toBe(true);
    expect(createOfficerSchema.safeParse({ position_id: 3 }).success).toBe(false);
    expect(updateOfficerSchema.safeParse({}).success).toBe(false);
    expect(updateOfficerSchema.safeParse({ end_date: '2026-12-31' }).success).toBe(true);
  });
});

describe('Templat wa.me & tanggal WIB', () => {
  it('mengisi placeholder yang dikenal dan membiarkan yang lain', () => {
    expect(fillTemplate('Halo, saya {nama} bayar {bulan} {x}', { nama: 'Maria', bulan: 'Agustus 2026' })).toBe('Halo, saya Maria bayar Agustus 2026 {x}');
  });
  it('todayWib berformat YYYY-MM-DD', () => {
    expect(todayWib()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
