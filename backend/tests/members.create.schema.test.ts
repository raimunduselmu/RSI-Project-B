
import { describe, expect, it } from 'vitest';
import { createMemberSchema } from '../src/modules/members/members.schema.js';

const validMember = {
  full_name: 'Andi Pratama',
  member_category: 'MAHASISWA',
  nim_nip: 'L0225001',
  phone: '081234567890',
  email: 'andi@example.com',
  faculty: 'Fakultas Teknologi Informasi dan Sains Data',
  entry_year: 2025,
  consent_given: true,
};

describe('createMemberSchema', () => {
  it('menerima data umat yang valid', () => {
    const result = createMemberSchema.safeParse(validMember);

    expect(result.success).toBe(true);
  });

  it('menolak nama kosong', () => {
    const result = createMemberSchema.safeParse({
      ...validMember,
      full_name: ' ',
    });

    expect(result.success).toBe(false);
  });

  it('menolak kategori umat yang tidak valid', () => {
    const result = createMemberSchema.safeParse({
      ...validMember,
      member_category: 'TAMU',
    });

    expect(result.success).toBe(false);
  });

  it('menolak data tanpa persetujuan', () => {
    const result = createMemberSchema.safeParse({
      ...validMember,
      consent_given: false,
    });

    expect(result.success).toBe(false);
  });

  it('menolak email dengan format tidak valid', () => {
    const result = createMemberSchema.safeParse({
      ...validMember,
      email: 'email-tidak-valid',
    });

    expect(result.success).toBe(false);
  });

  it('menggunakan status AKTIF sebagai default', () => {
    const result = createMemberSchema.safeParse(validMember);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.status).toBe('AKTIF');
    }
  });

  it('menggunakan show_in_directory false sebagai default', () => {
    const result = createMemberSchema.safeParse(validMember);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.show_in_directory).toBe(false);
    }
  });
});
