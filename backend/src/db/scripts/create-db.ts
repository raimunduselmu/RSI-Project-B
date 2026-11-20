// Membuat database bila belum ada. Sengaja TIDAK mengimpor ../client.js:
// modul itu langsung membuka koneksi ke DB_NAME, yang belum ada saat skrip ini jalan.
import sql from 'mssql';
import { env } from '../../config/env.js';

const master = await new sql.ConnectionPool({
  server: env.DB_HOST,
  port: env.DB_PORT,
  database: 'master',
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  options: { encrypt: env.DB_ENCRYPT, trustServerCertificate: env.DB_TRUST_CERT },
}).connect();
await master.request().query(`IF DB_ID(N'${env.DB_NAME}') IS NULL CREATE DATABASE [${env.DB_NAME}]`);
console.log(`Database ${env.DB_NAME} siap`);
await master.close();
process.exit(0);