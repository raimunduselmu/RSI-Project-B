// FSD-2.24 — Unit test validasi riwayat umat.
// Tidak membutuhkan koneksi database.

import { describe, expect, it } from 'vitest';

import {
  createMemberRecordSchema,
  listMemberRecordsQuerySchema,
} from '../src/modules/members/member-records.schema.js';

// ==================================================
// PELAYANAN DAN KATEKESE
// ==================================================

describe('FSD-2.24 — Riwayat pelayanan dan katekese', () => {
  const valid = {
    record_type: 'PELAYANAN',
    title: 'Anggota koor',
    record_date: '2025-05-10',
    period_id: 1,
  };

  it('menerima riwayat pelayanan yang valid', () => {
    expect(
      createMemberRecordSchema.safeParse(valid).success,
    ).toBe(true);
  });

  it('menerima riwayat katekese', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...valid,
        record_type: 'KATEKESE',
      }).success,
    ).toBe(true);
  });

  it('menolak jenis riwayat yang tidak dikenal', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...valid,
        record_type: 'LAINNYA',
      }).success,
    ).toBe(false);
  });

  it('menolak judul kosong', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...valid,
        title: ' ',
      }).success,
    ).toBe(false);
  });

  it('menolak format dan tanggal kalender yang tidak valid', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...valid,
        record_date: '10-05-2025',
      }).success,
    ).toBe(false);

    expect(
      createMemberRecordSchema.safeParse({
        ...valid,
        record_date: '2025-02-31',
      }).success,
    ).toBe(false);
  });

  it('menolak period_id yang tidak positif', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...valid,
        period_id: 0,
      }).success,
    ).toBe(false);
  });

  it('mewajibkan catatan ketika membuat koreksi', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...valid,
        corrects_record_id:
          'c56a4180-65aa-42ec-a945-5fd21dec0538',
      }).success,
    ).toBe(false);
  });

  it('menerima koreksi dengan catatan dan referensi UUID', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...valid,
        note: 'Koreksi tanggal pencatatan',
        corrects_record_id:
          'c56a4180-65aa-42ec-a945-5fd21dec0538',
      }).success,
    ).toBe(true);
  });
});

// ==================================================
// SAKRAMEN
// ==================================================

describe('FSD-2.24 — Riwayat sakramen', () => {
  const validSacrament = {
    record_type: 'SAKRAMEN',
    title: 'Baptis',
    record_date: '2020-08-15',
    place: 'Gereja St. Maria',
  };

  it('menerima data sakramen sesuai TSD Table 29', () => {
    expect(
      createMemberRecordSchema.safeParse(
        validSacrament,
      ).success,
    ).toBe(true);
  });

  it('menolak judul sakramen melebihi 30 karakter', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...validSacrament,
        title: 'x'.repeat(31),
      }).success,
    ).toBe(false);
  });

  it('menolak period_id pada sakramen karena kolom tersebut tidak ada di TSD Table 29', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...validSacrament,
        period_id: 1,
      }).success,
    ).toBe(false);
  });

  it('menolak field tambahan yang tidak dikenal', () => {
    expect(
      createMemberRecordSchema.safeParse({
        ...validSacrament,
        unexpected: true,
      }).success,
    ).toBe(false);
  });
});

// ==================================================
// FILTER RIWAYAT
// ==================================================

describe('FSD-2.24 — Filter riwayat', () => {
  it('menerima filter jenis dan periode', () => {
    const parsed =
      listMemberRecordsQuerySchema.safeParse({
        record_type: 'KATEKESE',
        period_id: '2',
      });

    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.data.period_id).toBe(2);
    }
  });

  it('menolak jenis dan periode yang tidak valid', () => {
    expect(
      listMemberRecordsQuerySchema.safeParse({
        record_type: 'LAINNYA',
      }).success,
    ).toBe(false);

    expect(
      listMemberRecordsQuerySchema.safeParse({
        period_id: '0',
      }).success,
    ).toBe(false);
  });
});