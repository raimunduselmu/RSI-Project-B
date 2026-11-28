// TSD Bagian 4 — Table 28: member_records (FSD-2.24)
// Append-only; koreksi disimpan sebagai catatan baru yang merujuk record sebelumnya.

import { sql } from 'drizzle-orm';
import { datetime2, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { dateOnly, uniqueidentifier } from './_types.js';
import { members } from './members.js';
import { periods } from './organization.js';

export const memberRecords = mssqlTable('member_records', {
  recordId: uniqueidentifier('record_id')
    .primaryKey()
    .default(sql`NEWID()`),

  memberId: uniqueidentifier('member_id')
    .notNull()
    .references(() => members.memberId),

  recordType: nvarchar('record_type', { length: 20 }).notNull(),
  // PELAYANAN | KATEKESE

  title: nvarchar('title', { length: 150 }).notNull(),

  recordDate: dateOnly('record_date').notNull(),

  periodId: int('period_id')
    .notNull()
    .references(() => periods.periodId),

  note: nvarchar('note', { length: 255 }),

  // FK ditambahkan melalui database/constraints/member_records.sql
  correctsRecordId: uniqueidentifier('corrects_record_id'),

  createdAt: datetime2('created_at')
    .notNull()
    .default(sql`SYSUTCDATETIME()`),
});