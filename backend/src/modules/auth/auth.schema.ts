import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(4).max(50),
  password: z.string().min(8),
});

// BR-05: min 8 karakter, ada huruf kapital, huruf kecil & angka; tidak boleh sama dengan password lama
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1),
    new_password: z.string().min(8, 'Minimal 8 karakter').regex(/[A-Z]/, 'Harus ada huruf kapital').regex(/[a-z]/, 'Harus ada huruf kecil').regex(/\d/, 'Harus ada angka'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, { path: ['confirm_password'], message: 'Konfirmasi tidak sama' })
  .refine((d) => d.new_password !== d.current_password, { path: ['new_password'], message: 'Tidak boleh sama dengan password lama' });

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
