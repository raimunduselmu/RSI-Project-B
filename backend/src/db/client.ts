import sql from 'mssql';
import { drizzle } from 'drizzle-orm/node-mssql';
import { env } from '../config/env.js';
import * as schema from './schema/index.js';

export const dbConfig: sql.config = {
  server: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  options: { encrypt: env.DB_ENCRYPT, trustServerCertificate: env.DB_TRUST_CERT },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30_000 },
};

/** Pool mssql dipakai bersama oleh Drizzle dan lib/sql.ts (stored procedure). */
export const pool = new sql.ConnectionPool(dbConfig);
export const poolReady = pool.connect();

export const db = drizzle({ client: pool, schema });
export type DB = typeof db;
