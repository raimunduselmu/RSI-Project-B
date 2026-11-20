// FSD-2.3 Reset Password · FSD-2.4 Kelola Pengguna
import { z } from 'zod';
import { ROLES } from '../../config/constants.js';

const emptyToNull = (v: unknown) => (v === '' ? null : v);
const phone = z.preprocess(emptyToNull, z.string().trim().regex(/^(\+62|62|0)8\d{7,12}$/, 'Masukkan nomor telepon yang valid (contoh: 08123456789)').nullable().optional());
const email = z.preprocess(emptyToNull, z.string().trim().toLowerCase().email('Format email tidak valid').max(150).nullable().optional());
const roleList = z.array(z.enum(ROLES)).min(1, 'Pilih minimal satu role').max(ROLES.length);

export const idParam = z.object({ id: z.string().uuid('ID pengguna tidak valid') });

export const listUserQuery = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(ROLES).optional(),
  is_active: z.enum(['true', 'false']).optional(),
});

export const createUserSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  username: z.string().trim().toLowerCase().min(4).max(50).regex(/^[a-z0-9._@-]+$/, 'Hanya huruf kecil, angka, titik, garis bawah, @ dan strip'),
  email,
  phone,
  division: z.preprocess(emptyToNull, z.string().trim().max(100).nullable().optional()),
  roles: roleList,
});

export const updateUserSchema = z
  .object({
    full_name: z.string().trim().min(2).max(100).optional(),
    email,
    phone,
    division: z.preprocess(emptyToNull, z.string().trim().max(100).nullable().optional()),
    is_active: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Tidak ada data yang diubah' });

export const updateRolesSchema = z.object({ roles: roleList });

export type ListUserQuery = z.infer<typeof listUserQuery>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
