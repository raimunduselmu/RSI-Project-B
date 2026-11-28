// FSD-2.23: Unit test validasi daftar umat
// Pengujian ini tidak membutuhkan koneksi database.

import { describe, expect, it } from 'vitest';
import { listMembersQuerySchema } from '../src/modules/members/members.schema.js';

describe('FSD-2.23 — Query daftar umat', () => {
  it('menggunakan paginasi default', () => {
    const result = listMembersQuerySchema.parse({});

    expect(result.page).toBe(1);
    expect(result.per_page).toBe(15);
  });

  it('menerima pencarian dan paginasi yang valid', () => {
    const result = listMembersQuerySchema.parse({
      q: '  Maria  ',
      page: '2',
      per_page: '20',
    });

    expect(result.q).toBe('Maria');
    expect(result.page).toBe(2);
    expect(result.per_page).toBe(20);
  });

  it('menerima kategori umat yang valid', () => {
    const result = listMembersQuerySchema.parse({
      member_category: 'MAHASISWA',
    });

    expect(result.member_category).toBe('MAHASISWA');
  });

  it('menolak kategori umat yang tidak dikenal', () => {
    const result = listMembersQuerySchema.safeParse({
      member_category: 'PELAJAR',
    });

    expect(result.success).toBe(false);
  });

  it('menolak per_page lebih dari 100', () => {
    const result = listMembersQuerySchema.safeParse({
      per_page: '101',
    });

    expect(result.success).toBe(false);
  });

  it('menolak page kurang dari 1', () => {
    const result = listMembersQuerySchema.safeParse({
      page: '0',
    });

    expect(result.success).toBe(false);
  });

  it('menolak status yang tidak valid', () => {
    const result = listMembersQuerySchema.safeParse({
      status: 'DIHAPUS',
    });

    expect(result.success).toBe(false);
  });
});