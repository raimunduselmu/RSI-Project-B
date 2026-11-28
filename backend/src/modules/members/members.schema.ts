// FSD-2.23: Kelola Data Umat & Status Keaktifan
// TSD Bagian 3.2: Validasi query daftar umat

import { z } from 'zod';
import { PHONE_REGEX } from '../../lib/phone.js';

export const idParam = z.object({
  id: z.string().uuid(),
});

// FSD-2.23: Daftar, pencarian, filter, dan paginasi umat
export const listMembersQuerySchema = z.object({
  // Pencarian berdasarkan nama atau NIM/NIP.
  q: z.string().trim().max(100).optional(),

  // Kategori umat sesuai BR-56.
  member_category: z
    .enum(['MAHASISWA', 'DOSEN', 'STAF', 'ALUMNI'])
    .optional(),

  // Status keaktifan sesuai BR-58.
  status: z
    .enum(['AKTIF', 'NONAKTIF', 'ALUMNI'])
    .optional(),

  // TSD 7.2: batas paginasi maksimum 100 data per halaman.
  page: z.coerce.number().int().min(1).default(1),

  per_page: z.coerce.number().int().min(1).max(100).default(15),
});

export type ListMembersQuery = z.infer<
  typeof listMembersQuerySchema
>;

// FSD-2.23 Main Flow: tambah data umat (POST /members)
// String kosong dari form dianggap tidak diisi (null).
const empty = (v: unknown) => (v === '' ? null : v);
const optText = (max: number) => z.preprocess(empty, z.string().trim().max(max).nullable().optional());

export const createMemberSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  member_category: z.enum(['MAHASISWA', 'DOSEN', 'STAF', 'ALUMNI']),
  nim_nip: optText(30),
  phone: z.preprocess(
    empty,
    z
      .string()
      .trim()
      .transform((s) => s.replace(/[\s-]/g, ''))
      .refine((s) => PHONE_REGEX.test(s), 'Nomor HP tidak valid (contoh 081234567890)')
      .nullable()
      .optional(),
  ),
  email: z.preprocess(empty, z.string().trim().email().max(150).nullable().optional()),
  faculty: optText(100),
  entry_year: z.preprocess(
    empty,
    z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).nullable().optional(),
  ),
  status: z.enum(['AKTIF', 'NONAKTIF', 'ALUMNI']).default('AKTIF'),
  consent_given: z.boolean().default(false),
  show_in_directory: z.boolean().default(false),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
