// ==================================================
// FSD-2.23: Kelola Data Umat & Status Keaktifan
// TSD Bagian 3.2: Validasi endpoint members
// BR-56: Kategori umat
// BR-58: Data umat tidak dihapus permanen
// BR-114: Persetujuan pengelolaan data (UU PDP)
// ==================================================

import { z } from 'zod';

export const idParam = z.object({
  id: z.string().uuid(),
});

// FSD-2.23 Main Flow Step 1: pencarian, filter, dan paginasi.
// TSD Table 27 hanya menyediakan entry_year sebagai atribut periode umat.
export const listMembersQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  member_category: z.enum(['MAHASISWA', 'DOSEN', 'STAF', 'ALUMNI']).optional(),
  status: z.enum(['AKTIF', 'NONAKTIF', 'ALUMNI']).optional(),
  entry_year: z.coerce.number().int().min(1900).max(2100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(15),
});

// Field opsional pada form boleh dikirim null atau string kosong untuk menghapus nilai.
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().trim().max(max).nullable().optional(),
  );

const optionalEmail = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().max(150).email().nullable().optional(),
);

const optionalEntryYear = z.preprocess(
  (value) => (value === '' ? null : value),
  z.coerce.number().int().min(1900).max(2100).nullable().optional(),
);

// FSD-2.23 Main Flow Step 2-4: tambah umat dan persetujuan eksplisit.
export const createMemberSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  member_category: z.enum(['MAHASISWA', 'DOSEN', 'STAF', 'ALUMNI']),
  nim_nip: optionalText(30),
  phone: optionalText(20),
  email: optionalEmail,
  faculty: optionalText(100),
  entry_year: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().min(1900).max(2100).optional(),
  ),
  status: z.enum(['AKTIF', 'NONAKTIF', 'ALUMNI']).default('AKTIF'),
  consent_given: z.literal(true, {
    errorMap: () => ({ message: 'Persetujuan pengelolaan data wajib diberikan' }),
  }),
  show_in_directory: z.boolean().default(false),
}).superRefine((value, ctx) => {
  if (!value.consent_given && value.show_in_directory) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['show_in_directory'], message: 'Direktori hanya dapat ditampilkan dengan persetujuan pemilik data' });
  }
});

// FSD-2.23: Ubah profil umat. Field yang tidak dikirim tidak diubah;
// null/string kosong dapat digunakan untuk mengosongkan field opsional.
export const updateMemberSchema = z.object({
  full_name: z.string().trim().min(1).max(100).optional(),
  member_category: z.enum(['MAHASISWA', 'DOSEN', 'STAF', 'ALUMNI']).optional(),
  nim_nip: optionalText(30),
  phone: optionalText(20),
  email: optionalEmail,
  faculty: optionalText(100),
  entry_year: optionalEntryYear,
  consent_given: z.boolean().optional(),
  show_in_directory: z.boolean().optional(),
}).strict().superRefine((value, ctx) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Minimal satu field harus diperbarui' });
  }
  if (value.consent_given === false && value.show_in_directory === true) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['show_in_directory'], message: 'Direktori tidak dapat ditampilkan setelah persetujuan ditarik' });
  }
});

// FSD-2.23 AF-1: perubahan status wajib memiliki alasan.
export const updateMemberStatusSchema = z.object({
  status: z.enum(['AKTIF', 'NONAKTIF', 'ALUMNI']),
  reason: z.string().trim().min(1).max(255),
}).strict();

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type UpdateMemberStatusInput = z.infer<typeof updateMemberStatusSchema>;
