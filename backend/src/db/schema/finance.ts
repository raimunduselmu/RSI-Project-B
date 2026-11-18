// TSD Bagian 4 — tabel: cash_categories, cash_transactions, budgets, donors, donations, kas_dues, kas_payments, kas_payment_items
// Tulis definisi tabel mengikuti pola auth.ts:
//   UNIQUEIDENTIFIER → uniqueidentifier('kolom').default(sql`NEWID()`)
//   NVARCHAR(n)      → nvarchar('kolom', { length: n })
//   NVARCHAR(MAX)    → nvarchar('kolom', { length: 'max' })
//   BIT              → bit('kolom')
//   DATETIME2        → datetime2('kolom')   DATE → date('kolom')
//   DECIMAL(15,2)    → decimal('kolom', { precision: 15, scale: 2 })
//   CHECK (...)      → tulis di komentar; validasi juga di Zod schema modul
export {};
