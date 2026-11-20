// FSD-2.5 (kategori aset), FSD-2.9 (ruangan)
import { z } from 'zod';

export const intIdParam = z.object({ id: z.coerce.number().int().positive() });

export const createCategorySchema = z.object({
  // Prefix kode unik aset, contoh ELEC → ELEC-120326 (BR-10). Tidak bisa diubah setelah dibuat.
  category_code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/, '2–10 huruf kapital/angka'),
  category_name: z.string().trim().min(1).max(150),
  maintenance_default_days: z.coerce.number().int().positive().max(3650).nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.omit({ category_code: true }).partial();

export const createRoomSchema = z.object({
  room_name: z.string().trim().min(1).max(150),
  capacity: z.coerce.number().int().positive().max(10000).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  is_active: z.boolean().optional(),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
