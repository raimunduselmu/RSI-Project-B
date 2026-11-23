// TSD Bagian 4 — tabel 10–17: usage_reports, usage_report_items, maintenance_schedules, maintenance_logs,
// incidents, asset_documents, stocktake_periods, stocktake_items (gelombang 4, inventaris lanjutan)
// CHECK/UNIQUE tambahan ada di database/constraints/inventory.sql
import { sql } from 'drizzle-orm';
import { bit, datetime2, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { dateOnly, uniqueidentifier } from './_types.js';
import { assets, rooms } from './assets.js';
import { users } from './auth.js';

/** FSD-2.13 Lapor pemakaian internal */
export const usageReports = mssqlTable('usage_reports', {
  reportId: uniqueidentifier('report_id').primaryKey().default(sql`NEWID()`),
  reporterUserId: uniqueidentifier('reporter_user_id').references(() => users.userId, { onDelete: 'set null' }),
  reporterName: nvarchar('reporter_name', { length: 150 }).notNull(),
  reporterPhone: nvarchar('reporter_phone', { length: 20 }).notNull(),
  division: nvarchar('division', { length: 100 }).notNull(),
  activityName: nvarchar('activity_name', { length: 150 }).notNull(),
  roomId: int('room_id').references(() => rooms.roomId, { onDelete: 'set null' }),
  startAt: datetime2('start_at').notNull(),
  plannedEndAt: datetime2('planned_end_at').notNull(),
  finishedAt: datetime2('finished_at'),
  status: nvarchar('status', { length: 20 }).notNull().default('BERLANGSUNG'), // BERLANGSUNG | SELESAI
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

export const usageReportItems = mssqlTable('usage_report_items', {
  reportItemId: uniqueidentifier('report_item_id').primaryKey().default(sql`NEWID()`),
  reportId: uniqueidentifier('report_id').notNull().references(() => usageReports.reportId),
  assetId: uniqueidentifier('asset_id').notNull().references(() => assets.assetId),
  conditionAfter: nvarchar('condition_after', { length: 20 }), // BAIK | RUSAK_RINGAN | RUSAK_BERAT
});

/** FSD-2.14 Jadwal pemeliharaan */
export const maintenanceSchedules = mssqlTable('maintenance_schedules', {
  scheduleId: uniqueidentifier('schedule_id').primaryKey().default(sql`NEWID()`),
  assetId: uniqueidentifier('asset_id').notNull().references(() => assets.assetId),
  taskName: nvarchar('task_name', { length: 150 }).notNull(),
  intervalDays: int('interval_days').notNull(),
  nextDueDate: dateOnly('next_due_date').notNull(),
  lastDoneDate: dateOnly('last_done_date'),
  reminderDaysBefore: int('reminder_days_before').notNull().default(7),
  isActive: bit('is_active').notNull().default(true),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

export const maintenanceLogs = mssqlTable('maintenance_logs', {
  logId: uniqueidentifier('log_id').primaryKey().default(sql`NEWID()`),
  scheduleId: uniqueidentifier('schedule_id').notNull().references(() => maintenanceSchedules.scheduleId),
  assetId: uniqueidentifier('asset_id').notNull().references(() => assets.assetId),
  performedDate: dateOnly('performed_date').notNull(),
  performedBy: nvarchar('performed_by', { length: 100 }).notNull(),
  resultCondition: nvarchar('result_condition', { length: 20 }).notNull(), // BAIK | RUSAK_RINGAN | RUSAK_BERAT
  notes: nvarchar('notes', { length: 'max' }),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

/** FSD-2.15 Kehilangan & kerusakan */
export const incidents = mssqlTable('incidents', {
  incidentId: uniqueidentifier('incident_id').primaryKey().default(sql`NEWID()`),
  assetId: uniqueidentifier('asset_id').notNull().references(() => assets.assetId),
  incidentType: nvarchar('incident_type', { length: 20 }).notNull(), // HILANG | RUSAK
  occurredDate: dateOnly('occurred_date').notNull(),
  description: nvarchar('description', { length: 'max' }).notNull(),
  reportedBy: uniqueidentifier('reported_by').references(() => users.userId, { onDelete: 'set null' }),
  responsibleName: nvarchar('responsible_name', { length: 150 }),
  status: nvarchar('status', { length: 20 }).notNull().default('DILAPORKAN'), // DILAPORKAN | DIPROSES | SELESAI
  followUp: nvarchar('follow_up', { length: 'max' }),
  resolvedAt: datetime2('resolved_at'),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

/** FSD-2.16 Dokumen aset */
export const assetDocuments = mssqlTable('asset_documents', {
  documentId: uniqueidentifier('document_id').primaryKey().default(sql`NEWID()`),
  assetId: uniqueidentifier('asset_id').notNull().references(() => assets.assetId),
  docType: nvarchar('doc_type', { length: 20 }).notNull(), // NOTA | GARANSI | BERITA_ACARA | FOTO | LAINNYA
  docTitle: nvarchar('doc_title', { length: 150 }).notNull(),
  filePath: nvarchar('file_path', { length: 255 }).notNull(),
  fileSizeKb: int('file_size_kb').notNull(),
  mimeType: nvarchar('mime_type', { length: 100 }).notNull(),
  uploadedBy: uniqueidentifier('uploaded_by').references(() => users.userId, { onDelete: 'set null' }),
  uploadedAt: datetime2('uploaded_at').notNull().default(sql`SYSUTCDATETIME()`),
});

/** FSD-2.17 Pemeriksaan fisik */
export const stocktakePeriods = mssqlTable('stocktake_periods', {
  periodId: uniqueidentifier('period_id').primaryKey().default(sql`NEWID()`),
  periodName: nvarchar('period_name', { length: 150 }).notNull(),
  startDate: dateOnly('start_date').notNull(),
  endDate: dateOnly('end_date'),
  status: nvarchar('status', { length: 20 }).notNull().default('TERBUKA'), // TERBUKA | DITUTUP
  createdBy: uniqueidentifier('created_by').references(() => users.userId, { onDelete: 'set null' }),
  closedAt: datetime2('closed_at'),
});

export const stocktakeItems = mssqlTable('stocktake_items', {
  itemId: uniqueidentifier('item_id').primaryKey().default(sql`NEWID()`),
  periodId: uniqueidentifier('period_id').notNull().references(() => stocktakePeriods.periodId),
  assetId: uniqueidentifier('asset_id').notNull().references(() => assets.assetId),
  found: bit('found'), // NULL = belum diperiksa
  actualLocation: nvarchar('actual_location', { length: 100 }),
  actualCondition: nvarchar('actual_condition', { length: 20 }),
  checkedBy: uniqueidentifier('checked_by').references(() => users.userId, { onDelete: 'set null' }),
  checkedAt: datetime2('checked_at'),
  note: nvarchar('note', { length: 'max' }),
});
