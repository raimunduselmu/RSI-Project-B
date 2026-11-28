// FSD-2.23: Unit test validasi update profil, status, dan consent.
// Test skema tidak membutuhkan koneksi database.

import { describe, expect, it } from 'vitest';
import {
  updateMemberSchema,
  updateMemberStatusSchema,
  listMembersQuerySchema,
  createMemberSchema,
} from '../src/modules/members/members.schema.js';

describe('FSD-2.23 — Consent saat menambah umat', () => {
  const validMember = {
    full_name: 'Maria',
    member_category: 'MAHASISWA',
    consent_given: true,
  };

  it('menerima data umat dengan persetujuan eksplisit', () => {
    expect(createMemberSchema.safeParse(validMember).success).toBe(true);
  });

  it('menolak data umat tanpa persetujuan', () => {
    expect(createMemberSchema.safeParse({ ...validMember, consent_given: false }).success).toBe(false);
  });

  it('menolak data umat jika field persetujuan tidak dikirim', () => {
    const { consent_given: _consent, ...withoutConsent } = validMember;
    expect(createMemberSchema.safeParse(withoutConsent).success).toBe(false);
  });

  it('default tidak menampilkan umat pada direktori', () => {
    const result = createMemberSchema.parse(validMember);
    expect(result.show_in_directory).toBe(false);
  });
});

describe('FSD-2.23 — Update profil umat', () => {
  it('menerima perubahan satu field profil', () => {
    expect(updateMemberSchema.safeParse({ full_name: 'Maria' }).success).toBe(true);
  });

  it('menerima null untuk mengosongkan field opsional', () => {
    const result = updateMemberSchema.safeParse({ phone: null, email: null });
    expect(result.success).toBe(true);
  });

  it('menolak body kosong', () => {
    expect(updateMemberSchema.safeParse({}).success).toBe(false);
  });

  it('menolak field yang tidak dikenal', () => {
    expect(updateMemberSchema.safeParse({ is_deleted: true }).success).toBe(false);
  });

  it('menolak menampilkan direktori saat consent ditarik', () => {
    expect(updateMemberSchema.safeParse({ consent_given: false, show_in_directory: true }).success).toBe(false);
  });

  it('menerima penarikan consent tanpa flag direktori', () => {
    expect(updateMemberSchema.safeParse({ consent_given: false }).success).toBe(true);
  });

  it('menerima filter periode berdasarkan entry_year', () => {
    const result = listMembersQuerySchema.safeParse({ entry_year: '2024' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.entry_year).toBe(2024);
  });
});

describe('FSD-2.23 — Perubahan status umat', () => {
  it('menerima status dan alasan yang valid', () => {
    expect(updateMemberStatusSchema.safeParse({ status: 'NONAKTIF', reason: 'Masa keanggotaan selesai' }).success).toBe(true);
  });

  it('menolak perubahan status tanpa alasan', () => {
    expect(updateMemberStatusSchema.safeParse({ status: 'NONAKTIF' }).success).toBe(false);
  });

  it('menolak status di luar enum', () => {
    expect(updateMemberStatusSchema.safeParse({ status: 'DIBLOKIR', reason: 'Alasan' }).success).toBe(false);
  });

  it('menolak alasan melebihi 255 karakter', () => {
    expect(updateMemberStatusSchema.safeParse({ status: 'ALUMNI', reason: 'x'.repeat(256) }).success).toBe(false);
  });
});
