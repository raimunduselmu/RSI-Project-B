// TSD Bagian 4 — asset_categories, rooms, assets, asset_histories
// CHECK constraint (kondisi, status, sumber, event_type) ada di database/constraints/assets.sql
import { sql } from 'drizzle-orm';
import { bit, datetime2, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { dateOnly, money, uniqueidentifier } from './_types.js';
import { users } from './auth.js';

export const assetCategories = mssqlTable('asset_categories', {
  categoryId: int('category_id').primaryKey().identity(),
  categoryCode: nvarchar('category_code', { length: 30 }).notNull().unique(),
  categoryName: nvarchar('category_name', { length: 150 }).notNull(),
  maintenanceDefaultDays: int('maintenance_default_days'),
});

export const rooms = mssqlTable('rooms', {
  roomId: int('room_id').primaryKey().identity(),
  roomName: nvarchar('room_name', { length: 150 }).notNull().unique(),
  capacity: int('capacity'),
  description: nvarchar('description', { length: 'max' }),
  isActive: bit('is_active').notNull().default(true),
});

export const assets = mssqlTable('assets', {
  assetId: uniqueidentifier('asset_id').primaryKey().default(sql`NEWID()`),
  assetCode: nvarchar('asset_code', { length: 30 }).notNull().unique(),
  assetName: nvarchar('asset_name', { length: 150 }).notNull(),
  categoryId: int('category_id').notNull().references(() => assetCategories.categoryId),
  locationText: nvarchar('location_text', { length: 100 }).notNull(),
  assetCondition: nvarchar('asset_condition', { length: 20 }).notNull().default('BAIK'),
  status: nvarchar('status', { length: 20 }).notNull().default('TERSEDIA'),
  isLendable: bit('is_lendable').notNull().default(true),
  sourceType: nvarchar('source_type', { length: 20 }).notNull(),
  donorName: nvarchar('donor_name', { length: 150 }),
  acquiredDate: dateOnly('acquired_date').notNull(),
  description: nvarchar('description', { length: 'max' }),
  photoPath: nvarchar('photo_path', { length: 255 }),
  createdBy: uniqueidentifier('created_by').references(() => users.userId, { onDelete: 'set null' }),
  isDeleted: bit('is_deleted').notNull().default(false),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
  updatedAt: datetime2('updated_at').notNull().default(sql`SYSUTCDATETIME()`),
  acquisitionValue: money('acquisition_value'),
  donationId: uniqueidentifier('donation_id'), // FK → donations dibuat saat modul Donasi
});

export const assetHistories = mssqlTable('asset_histories', {
  historyId: uniqueidentifier('history_id').primaryKey().default(sql`NEWID()`),
  assetId: uniqueidentifier('asset_id').notNull().references(() => assets.assetId),
  eventType: nvarchar('event_type', { length: 20 }).notNull(),
  oldValue: nvarchar('old_value', { length: 'max' }),
  newValue: nvarchar('new_value', { length: 'max' }),
  note: nvarchar('note', { length: 'max' }),
  actorUserId: uniqueidentifier('actor_user_id').references(() => users.userId),
  actorName: nvarchar('actor_name', { length: 150 }).notNull(),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});
