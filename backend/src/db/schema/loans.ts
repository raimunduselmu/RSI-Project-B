// TSD Bagian 4 — loan_requests, loan_items
// CHECK constraint & UNIQUE (loan_id, asset_id) ada di database/constraints/loans.sql
// Ditunda (lihat docs/BACKLOG.md): loan_payments, usage_reports, usage_report_items
import { sql } from 'drizzle-orm';
import { bit, datetime2, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { uniqueidentifier } from './_types.js';
import { users } from './auth.js';
import { assets, rooms } from './assets.js';
import { workflows } from './workflow.js';

export const loanRequests = mssqlTable('loan_requests', {
  loanId: uniqueidentifier('loan_id').primaryKey().default(sql`NEWID()`),
  loanCode: nvarchar('loan_code', { length: 30 }).notNull().unique(),
  requestType: nvarchar('request_type', { length: 20 }).notNull(),
  roomId: int('room_id').references(() => rooms.roomId, { onDelete: 'set null' }),
  borrowerName: nvarchar('borrower_name', { length: 150 }).notNull(),
  borrowerPhone: nvarchar('borrower_phone', { length: 20 }).notNull(),
  borrowerEmail: nvarchar('borrower_email', { length: 150 }).notNull(),
  borrowerOrg: nvarchar('borrower_org', { length: 100 }),
  purpose: nvarchar('purpose', { length: 255 }).notNull(),
  startAt: datetime2('start_at').notNull(),
  endAt: datetime2('end_at').notNull(),
  useFacilities: bit('use_facilities').notNull().default(false),
  status: nvarchar('status', { length: 20 }).notNull().default('MENUNGGU'),
  reviewedBy: uniqueidentifier('reviewed_by').references(() => users.userId, { onDelete: 'set null' }),
  reviewedAt: datetime2('reviewed_at'),
  rejectReason: nvarchar('reject_reason', { length: 'max' }),
  handedOverAt: datetime2('handed_over_at'),
  returnedAt: datetime2('returned_at'),
  returnNote: nvarchar('return_note', { length: 'max' }),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
  workflowId: int('workflow_id').references(() => workflows.workflowId, { onDelete: 'set null' }),
  currentStep: int('current_step').default(1),
  eventId: uniqueidentifier('event_id'), // FK → events dibuat saat modul Kegiatan
});

export const loanItems = mssqlTable('loan_items', {
  loanItemId: uniqueidentifier('loan_item_id').primaryKey().default(sql`NEWID()`),
  loanId: uniqueidentifier('loan_id').notNull().references(() => loanRequests.loanId),
  assetId: uniqueidentifier('asset_id').notNull().references(() => assets.assetId),
  conditionOut: nvarchar('condition_out', { length: 20 }),
  conditionIn: nvarchar('condition_in', { length: 20 }),
});
