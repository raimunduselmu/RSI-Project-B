// TSD Bagian 4 — members (Keumatan, FSD-2.23)
// Tabel ini dibuat di gelombang 2 karena dibutuhkan Kepengurusan (officers.member_id).
// Endpoint & layar Keumatan dikerjakan Andra; member_records & sacraments menyusul (FSD-2.24).
// CHECK constraint ada di database/constraints/organization.sql
import { sql } from 'drizzle-orm';
import { bit, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { uniqueidentifier } from './_types.js';
import { users } from './auth.js';

export const members = mssqlTable('members', {
  memberId: uniqueidentifier('member_id').primaryKey().default(sql`NEWID()`),
  fullName: nvarchar('full_name', { length: 100 }).notNull(),
  memberCategory: nvarchar('member_category', { length: 20 }).notNull(), // MAHASISWA | DOSEN | STAF | ALUMNI
  nimNip: nvarchar('nim_nip', { length: 30 }),                           // unik bila diisi (filtered index)
  phone: nvarchar('phone', { length: 20 }),
  email: nvarchar('email', { length: 150 }),
  faculty: nvarchar('faculty', { length: 100 }),
  entryYear: int('entry_year'),
  status: nvarchar('status', { length: 20 }).notNull().default('AKTIF'), // AKTIF | NONAKTIF | ALUMNI
  consentGiven: bit('consent_given').notNull().default(false),
  showInDirectory: bit('show_in_directory').notNull().default(false),
  userId: uniqueidentifier('user_id').references(() => users.userId),
  isDeleted: bit('is_deleted').notNull().default(false),
});

// TODO (Andra, FSD-2.24): member_records, sacraments
