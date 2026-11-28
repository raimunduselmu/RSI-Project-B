import { config } from 'dotenv';
import path from 'node:path';

// Sama dengan src/config/env.ts: .env root repo dulu, lalu backend/.env
config({ path: path.resolve(process.cwd(), '../.env') });
config();
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mssql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    server: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 1433),
    database: process.env.DB_NAME ?? 'kmk_uns',
    user: process.env.DB_USER ?? 'sa',
    password: process.env.DB_PASSWORD ?? '',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    },
  },
});
