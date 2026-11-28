// TSD Bagian 4 — Table 29: sacraments (FSD-2.24)
// Append-only; tabel ini terpisah dari member_records sesuai TSD.

import { sql } from 'drizzle-orm';
import { datetime2, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { dateOnly, uniqueidentifier } from './_types.js';
import { members } from './members.js';

export const sacraments = mssqlTable('sacraments', {
  sacramentId: uniqueidentifier('sacrament_id')
    .primaryKey()
    .default(sql`NEWID()`),

  memberId: uniqueidentifier('member_id')
    .notNull()
    .references(() => members.memberId),

  sacramentType: nvarchar('sacrament_type', { length: 30 }).notNull(),

  sacramentDate: dateOnly('sacrament_date').notNull(),

  place: nvarchar('place', { length: 150 }),

  note: nvarchar('note', { length: 255 }),

  createdAt: datetime2('created_at')
    .notNull()
    .default(sql`SYSUTCDATETIME()`),
});