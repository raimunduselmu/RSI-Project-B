// TSD 4 — system_settings, notifications, notification_logs, audit_logs
import { sql } from 'drizzle-orm';
import { bit, datetime2, int, mssqlTable, nvarchar, varchar } from 'drizzle-orm/mssql-core';
import { uniqueidentifier } from './_types.js';
import { users } from './auth.js';

export const systemSettings = mssqlTable('system_settings', {
  settingKey: nvarchar('setting_key', { length: 50 }).primaryKey(),
  settingValue: nvarchar('setting_value', { length: 'max' }).notNull(),
  valueType: nvarchar('value_type', { length: 10 }).notNull(),     // TEXT|NUMBER|IMAGE|PHONE|TEMPLATE
  isPublic: bit('is_public').notNull().default(false),
  description: nvarchar('description', { length: 255 }),
  updatedBy: uniqueidentifier('updated_by').references(() => users.userId),
  updatedAt: datetime2('updated_at').notNull().default(sql`SYSUTCDATETIME()`),
});

export const notificationLogs = mssqlTable('notification_logs', {
  logId: uniqueidentifier('log_id').primaryKey().default(sql`NEWID()`),
  notificationId: uniqueidentifier('notification_id'),
  announcementId: uniqueidentifier('announcement_id'),
  recipient: nvarchar('recipient', { length: 150 }).notNull(),
  channel: nvarchar('channel', { length: 20 }).notNull(),           // APLIKASI|EMAIL
  subject: nvarchar('subject', { length: 150 }),
  body: nvarchar('body', { length: 'max' }),
  status: nvarchar('status', { length: 20 }).notNull().default('PENDING'), // PENDING|SENT|FAILED
  attempts: int('attempts').notNull().default(0),
  lastError: nvarchar('last_error', { length: 255 }),
  sentAt: datetime2('sent_at'),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

export const auditLogs = mssqlTable('audit_logs', {
  logId: uniqueidentifier('log_id').primaryKey().default(sql`NEWID()`),
  userId: uniqueidentifier('user_id'),
  userEmail: nvarchar('user_email', { length: 150 }),
  actionType: nvarchar('action_type', { length: 50 }).notNull(),
  resourceType: nvarchar('resource_type', { length: 50 }),
  resourceId: nvarchar('resource_id', { length: 100 }),
  oldValues: nvarchar('old_values', { length: 'max' }),
  newValues: nvarchar('new_values', { length: 'max' }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: nvarchar('user_agent', { length: 255 }),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

export const notifications = mssqlTable('notifications', {
  notificationId: uniqueidentifier('notification_id').primaryKey().default(sql`NEWID()`),
  recipientUserId: uniqueidentifier('recipient_user_id').references(() => users.userId, { onDelete: 'set null' }),
  recipientEmail: nvarchar('recipient_email', { length: 150 }),
  type: nvarchar('type', { length: 50 }).notNull(), // LOAN_SUBMITTED, LOAN_APPROVED, LOAN_REJECTED, ...
  title: nvarchar('title', { length: 150 }).notNull(),
  message: nvarchar('message', { length: 'max' }).notNull(),
  channel: nvarchar('channel', { length: 20 }).notNull(), // APLIKASI | EMAIL
  relatedId: nvarchar('related_id', { length: 100 }),
  isRead: bit('is_read').notNull().default(false),
  sentAt: datetime2('sent_at'),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

// TODO (TSD 4): announcements
