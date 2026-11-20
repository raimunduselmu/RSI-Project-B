import { config } from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

// .env berada di root repo (PROJECT/.env); fallback ke backend/.env
config({ path: path.resolve(process.cwd(), '../.env') });
config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().default('http://localhost:5173'),
  API_PORT: z.coerce.number().default(3000),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(1433),
  DB_NAME: z.string().default('kmk_uns'),
  DB_USER: z.string().default('sa'),
  DB_PASSWORD: z.string().default(''),
  DB_ENCRYPT: z.string().default('false').transform((v) => v === 'true'),
  DB_TRUST_CERT: z.string().default('true').transform((v) => v === 'true'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET minimal 16 karakter'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  COOKIE_SECURE: z.string().default('false').transform((v) => v === 'true'),
  BCRYPT_COST: z.coerce.number().default(12),

  SEED_ADMIN_USERNAME: z.string().default('admin'),
  SEED_ADMIN_PASSWORD: z.string().default('Admin-12345'),
  SEED_DEMO: z.string().default('true').transform((v) => v === 'true'),
  SEED_DEMO_PASSWORD: z.string().default('Demo-12345'),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('KMK UNS <noreply@example.com>'),

  STORAGE_DRIVER: z.enum(['local', 'blob']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  CRON_ENABLED: z.string().default('true').transform((v) => v === 'true'),
  INTERNAL_CRON_SECRET: z.string().default('dev-secret'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Konfigurasi .env tidak valid:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
