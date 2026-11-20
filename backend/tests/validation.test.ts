// Unit test aturan validasi (tanpa database). Jalankan: npm test
import { describe, expect, it } from 'vitest';
import { normalizePhone, samePhone } from '../src/lib/phone.js';
import { createLoanSchema, rejectSchema } from '../src/modules/loans/loans.schema.js';
import { createAssetSchema, updateAssetSchema } from '../src/modules/assets/assets.schema.js';
import { monthRangeUtc } from '../src/lib/time.js';

const future = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

const validLoan = {
  request_type: 'RUANGAN',
  room_id: 1,
  start_at: future(24),
  end_at: future(27),
  borrower_name: 'Budi Santoso',
  borrower_phone: '0812-3456-7890',
  borrower_email: 'Budi.Santoso@Gmail.com',
  purpose: 'Latihan paduan suara',
};

describe('nomor telepon', () => {
  it('08xx, +628xx, dan 628xx dianggap sama', () => {
    expect(normalizePhone('0812-3456-7890')).toBe('6281234567890');
    expect(samePhone('081234567890', '+6281234567890')).toBe(true);
  });
});

describe('form peminjaman (FSD-2.10)', () => {
  it('menerima data valid dan merapikan telepon & email', () => {
    const r = createLoanSchema.parse(validLoan);
    expect(r.borrower_phone).toBe('081234567890');
    expect(r.borrower_email).toBe('budi.santoso@gmail.com');
  });
  it('ruangan wajib dipilih untuk jenis RUANGAN', () => {
    expect(createLoanSchema.safeParse({ ...validLoan, room_id: null }).success).toBe(false);
  });
  it('aset wajib dipilih untuk jenis ASET', () => {
    expect(createLoanSchema.safeParse({ ...validLoan, request_type: 'ASET', asset_ids: [] }).success).toBe(false);
  });
  it('waktu selesai harus setelah waktu mulai', () => {
    expect(createLoanSchema.safeParse({ ...validLoan, end_at: future(23) }).success).toBe(false);
  });
  it('email wajib dan harus valid', () => {
    expect(createLoanSchema.safeParse({ ...validLoan, borrower_email: 'bukan-email' }).success).toBe(false);
  });
  it('fasilitas tambahan otomatis false untuk jenis ASET', () => {
    const r = createLoanSchema.parse({ ...validLoan, request_type: 'ASET', asset_ids: ['3f1d2c4b-1111-4a2b-9c3d-0123456789ab'], use_facilities: true });
    expect(r.use_facilities).toBe(false);
  });
  it('alasan penolakan wajib (BR-25)', () => {
    expect(rejectSchema.safeParse({ reject_reason: '' }).success).toBe(false);
  });
});

describe('form aset (FSD-2.5)', () => {
  const base = { asset_name: 'Proyektor', category_id: '1', location_text: 'Gudang', source_type: 'KAS', acquired_date: '2026-01-02' };
  it('menerima field multipart (string) dan mengisi bawaan', () => {
    const r = createAssetSchema.parse({ ...base, is_lendable: 'false' });
    expect(r.category_id).toBe(1);
    expect(r.is_lendable).toBe(false);
    expect(r.asset_condition).toBe('BAIK');
  });
  it('nama donatur wajib bila DONASI/HIBAH', () => {
    expect(createAssetSchema.safeParse({ ...base, source_type: 'DONASI' }).success).toBe(false);
    expect(createAssetSchema.safeParse({ ...base, source_type: 'DONASI', donor_name: 'Keluarga Wijaya' }).success).toBe(true);
  });
  it('status DIPINJAM tidak bisa diset manual', () => {
    expect(updateAssetSchema.safeParse({ status: 'DIPINJAM' }).success).toBe(false);
  });
});

describe('kalender', () => {
  it('rentang November 2026 WIB dalam UTC', () => {
    const r = monthRangeUtc('2026-11');
    expect(r.start.toISOString()).toBe('2026-10-31T17:00:00.000Z');
    expect(r.end.toISOString()).toBe('2026-11-30T17:00:00.000Z');
  });
});
