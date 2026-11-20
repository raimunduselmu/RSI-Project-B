// FSD-2.21 Notifikasi aplikasi
import { z } from 'zod';

export const listNotificationQuery = z.object({ unread: z.enum(['true', 'false']).optional() });
export const idParam = z.object({ id: z.string().uuid('ID notifikasi tidak valid') });
export type ListNotificationQuery = z.infer<typeof listNotificationQuery>;
