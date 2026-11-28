// FSD-2.23: Validasi parameter detail umat
// TSD: GET /members/{id}
// Unit test ini tidak membutuhkan koneksi database.

import { describe, expect, it } from 'vitest';
import { idParam } from '../src/modules/members/members.schema.js';

describe('FSD-2.23 — Parameter detail umat', () => {
  it('menerima UUID yang valid', () => {
    const result = idParam.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result.success).toBe(true);
  });

  it('menolak ID yang bukan UUID', () => {
    const result = idParam.safeParse({
      id: '123',
    });

    expect(result.success).toBe(false);
  });

  it('menolak parameter ID yang kosong', () => {
    const result = idParam.safeParse({
      id: '',
    });

    expect(result.success).toBe(false);
  });

  it('menolak parameter ID yang tidak tersedia', () => {
    const result = idParam.safeParse({});

    expect(result.success).toBe(false);
  });
});