// TSD Bagian 4 — periods, divisions, positions, officers (FSD-2.25)
// CHECK, UNIQUE gabungan & index ada di database/constraints/organization.sql
// Perluasan dari TSD: divisions.role_id & positions.role_id = role yang diberikan otomatis
// saat pengurus ditetapkan (BR-115). Role efektif = positions.role_id, bila kosong divisions.role_id.
import { sql } from 'drizzle-orm';
import { bit, datetime2, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { dateOnly, uniqueidentifier } from './_types.js';
import { roles, users } from './auth.js';
import { members } from './members.js';

export const periods = mssqlTable('periods', {
  periodId: int('period_id').primaryKey().identity(),
  periodName: nvarchar('period_name', { length: 20 }).notNull().unique(), // format YYYY/YYYY
  startDate: dateOnly('start_date').notNull(),
  endDate: dateOnly('end_date').notNull(),
  status: nvarchar('status', { length: 20 }).notNull().default('AKTIF'),  // AKTIF | ARSIP (hanya satu AKTIF)
  closedAt: datetime2('closed_at'),
});

export const divisions = mssqlTable('divisions', {
  divisionId: int('division_id').primaryKey().identity(),
  periodId: int('period_id').notNull().references(() => periods.periodId),
  divisionName: nvarchar('division_name', { length: 150 }).notNull(),
  description: nvarchar('description', { length: 'max' }),
  roleId: int('role_id').references(() => roles.roleId),
});

export const positions = mssqlTable('positions', {
  positionId: int('position_id').primaryKey().identity(),
  divisionId: int('division_id').notNull().references(() => divisions.divisionId),
  positionName: nvarchar('position_name', { length: 150 }).notNull(),
  isLeader: bit('is_leader').notNull().default(false),
  roleId: int('role_id').references(() => roles.roleId),
});

export const officers = mssqlTable('officers', {
  officerId: uniqueidentifier('officer_id').primaryKey().default(sql`NEWID()`),
  memberId: uniqueidentifier('member_id').notNull().references(() => members.memberId),
  positionId: int('position_id').notNull().references(() => positions.positionId),
  userId: uniqueidentifier('user_id').references(() => users.userId),
  startDate: dateOnly('start_date').notNull(),
  endDate: dateOnly('end_date'),
});

// TODO (FSD-2.26): handovers · (FSD-2.20): committees, committee_members
