// FSD-2.23: Kelola Data Umat & Status Keaktifan
// TSD Bagian 3.2: Validasi query daftar umat

import { z } from 'zod';

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