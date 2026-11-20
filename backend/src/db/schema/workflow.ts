// TSD Bagian 4 — workflows, workflow_steps, approval_logs
// Definisi workflow diisi seeder (read-only di UI, FSD-2.39 / AC-16)
import { sql } from 'drizzle-orm';
import { bit, datetime2, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { uniqueidentifier } from './_types.js';
import { users } from './auth.js';

export const workflows = mssqlTable('workflows', {
  workflowId: int('workflow_id').primaryKey().identity(),
  workflowName: nvarchar('workflow_name', { length: 150 }).notNull().unique(),
  module: nvarchar('module', { length: 50 }).notNull(), // PEMINJAMAN | OVER_BUDGET | IURAN_KAS | SERAH_TERIMA
  version: int('version').notNull().default(1),
  isActive: bit('is_active').notNull().default(true),
});

export const workflowSteps = mssqlTable('workflow_steps', {
  stepId: int('step_id').primaryKey().identity(),
  workflowId: int('workflow_id').notNull().references(() => workflows.workflowId),
  stepOrder: int('step_order').notNull(),
  approverRole: nvarchar('approver_role', { length: 30 }).notNull(),
  isRequired: bit('is_required').notNull().default(true),
  condition: nvarchar('condition', { length: 255 }),
});

export const approvalLogs = mssqlTable('approval_logs', {
  approvalId: uniqueidentifier('approval_id').primaryKey().default(sql`NEWID()`),
  stepId: int('step_id').notNull().references(() => workflowSteps.stepId),
  refModule: nvarchar('ref_module', { length: 50 }).notNull(),
  refId: nvarchar('ref_id', { length: 50 }).notNull(),
  approverId: uniqueidentifier('approver_id').notNull().references(() => users.userId),
  decision: nvarchar('decision', { length: 20 }).notNull(), // SETUJU | TOLAK
  note: nvarchar('note', { length: 'max' }),
  decidedAt: datetime2('decided_at').notNull().default(sql`SYSUTCDATETIME()`),
});
