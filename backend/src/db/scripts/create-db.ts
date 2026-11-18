// Membuat database bila belum ada (koneksi ke master).
import sql from 'mssql';
import { dbConfig } from '../client.js';
import { env } from '../../config/env.js';

const master = await new sql.ConnectionPool({ ...dbConfig, database: 'master' }).connect();
await master.request().query(`IF DB_ID(N'${env.DB_NAME}') IS NULL CREATE DATABASE [${env.DB_NAME}]`);
console.log(`Database ${env.DB_NAME} siap`);
await master.close();
process.exit(0);
