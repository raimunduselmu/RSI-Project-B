// Skema validasi Zod untuk modul organization (body/query/params).
// Contoh:
//   export const createSchema = z.object({ name: z.string().min(1).max(150) });
import { z } from 'zod';

export const idParam = z.object({ id: z.string().uuid() });
