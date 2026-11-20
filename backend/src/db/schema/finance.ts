// TSD Bagian 4 — budgets, cash_transactions, kas_dues, kas_payments, kas_payment_items (FSD-2.33, 2.43, 2.44)
// CHECK, UNIQUE gabungan & index ada di database/constraints/finance.sql
// Perluasan dari TSD pada cash_transactions: status (alur over-budget FSD-2.33 AF-1), description, created_by, created_at.
// event_id belum diberi FK karena tabel events dibuat di modul Kegiatan.
// TODO (Andra, FSD-2.32): donors, donations
import { sql } from 'drizzle-orm';
import { datetime2, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { dateOnly, money, uniqueidentifier } from './_types.js';
import { users } from './auth.js';
import { periods } from './organization.js';

export const budgets = mssqlTable('budgets', {
  budgetId: int('budget_id').primaryKey().identity(),
  periodId: int('period_id').notNull().references(() => periods.periodId),
  posName: nvarchar('pos_name', { length: 150 }).notNull(),
  eventId: uniqueidentifier('event_id'),
  plannedAmount: money('planned_amount').notNull(),
  spentAmount: money('spent_amount').notNull().default(0), // diperbarui trg_budget_spent
});

export const cashTransactions = mssqlTable('cash_transactions', {
  transactionId: uniqueidentifier('transaction_id').primaryKey().default(sql`NEWID()`),
  transactionType: nvarchar('transaction_type', { length: 20 }).notNull(), // MASUK | KELUAR
  amount: money('amount').notNull(),
  category: nvarchar('category', { length: 100 }).notNull(),
  budgetId: int('budget_id').references(() => budgets.budgetId),
  eventId: uniqueidentifier('event_id'),
  transactionDate: dateOnly('transaction_date').notNull(),
  proofPath: nvarchar('proof_path', { length: 255 }),
  periodId: int('period_id').notNull().references(() => periods.periodId),
  sourceRef: nvarchar('source_ref', { length: 100 }),       // mis. kode IUR / donasi
  status: nvarchar('status', { length: 25 }).notNull().default('DISETUJUI'), // DISETUJUI | MENUNGGU_PERSETUJUAN | DITOLAK
  description: nvarchar('description', { length: 'max' }),
  createdBy: uniqueidentifier('created_by').references(() => users.userId),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

export const kasDues = mssqlTable('kas_dues', {
  dueId: uniqueidentifier('due_id').primaryKey().default(sql`NEWID()`),
  userId: uniqueidentifier('user_id').notNull().references(() => users.userId),
  periodId: int('period_id').notNull().references(() => periods.periodId),
  dueMonth: dateOnly('due_month').notNull(),               // tanggal 1 bulan tagihan
  amount: money('amount').notNull(),                       // tarif saat tagihan dibentuk
  status: nvarchar('status', { length: 25 }).notNull().default('BELUM_LUNAS'), // BELUM_LUNAS | MENUNGGU_VERIFIKASI | LUNAS
});

export const kasPayments = mssqlTable('kas_payments', {
  paymentId: uniqueidentifier('payment_id').primaryKey().default(sql`NEWID()`),
  paymentCode: nvarchar('payment_code', { length: 30 }).notNull().unique(), // IUR-DDMMYY-NNN
  userId: uniqueidentifier('user_id').notNull().references(() => users.userId),
  periodId: int('period_id').notNull().references(() => periods.periodId),
  method: nvarchar('method', { length: 10 }).notNull(),    // QRIS | CASH
  totalAmount: money('total_amount').notNull(),
  proofPath: nvarchar('proof_path', { length: 255 }).notNull(),
  note: nvarchar('note', { length: 255 }),
  status: nvarchar('status', { length: 25 }).notNull().default('MENUNGGU_VERIFIKASI'), // MENUNGGU_VERIFIKASI | DISETUJUI | DITOLAK
  rejectReason: nvarchar('reject_reason', { length: 255 }),
  verifiedBy: uniqueidentifier('verified_by').references(() => users.userId),
  verifiedAt: datetime2('verified_at'),
  cashTransactionId: uniqueidentifier('cash_transaction_id').references(() => cashTransactions.transactionId),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
});

export const kasPaymentItems = mssqlTable('kas_payment_items', {
  itemId: uniqueidentifier('item_id').primaryKey().default(sql`NEWID()`),
  paymentId: uniqueidentifier('payment_id').notNull().references(() => kasPayments.paymentId),
  dueId: uniqueidentifier('due_id').notNull().references(() => kasDues.dueId),
  amount: money('amount').notNull(),
});
