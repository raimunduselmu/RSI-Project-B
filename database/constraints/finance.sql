-- CHECK, UNIQUE & index tabel Keuangan + Iuran Kas (TSD Bagian 4, FSD-2.33, 2.43, 2.44). Aman dijalankan ulang.
IF OBJECT_ID(N'dbo.CK_budgets_amount', N'C') IS NULL
  ALTER TABLE dbo.budgets ADD CONSTRAINT CK_budgets_amount CHECK (planned_amount > 0 AND spent_amount >= 0);

IF OBJECT_ID(N'dbo.CK_cash_tx_type', N'C') IS NULL
  ALTER TABLE dbo.cash_transactions ADD CONSTRAINT CK_cash_tx_type CHECK (transaction_type IN (N'MASUK', N'KELUAR'));
IF OBJECT_ID(N'dbo.CK_cash_tx_amount', N'C') IS NULL
  ALTER TABLE dbo.cash_transactions ADD CONSTRAINT CK_cash_tx_amount CHECK (amount > 0);
IF OBJECT_ID(N'dbo.CK_cash_tx_status', N'C') IS NULL
  ALTER TABLE dbo.cash_transactions ADD CONSTRAINT CK_cash_tx_status
    CHECK (status IN (N'DISETUJUI', N'MENUNGGU_PERSETUJUAN', N'DITOLAK'));
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_cash_tx_period_date')
  CREATE INDEX IX_cash_tx_period_date ON dbo.cash_transactions (period_id, transaction_date) INCLUDE (transaction_type, amount, status);

IF OBJECT_ID(N'dbo.CK_kas_dues_status', N'C') IS NULL
  ALTER TABLE dbo.kas_dues ADD CONSTRAINT CK_kas_dues_status
    CHECK (status IN (N'BELUM_LUNAS', N'MENUNGGU_VERIFIKASI', N'LUNAS'));
IF OBJECT_ID(N'dbo.CK_kas_dues_amount', N'C') IS NULL
  ALTER TABLE dbo.kas_dues ADD CONSTRAINT CK_kas_dues_amount CHECK (amount > 0);
IF OBJECT_ID(N'dbo.CK_kas_dues_month', N'C') IS NULL
  ALTER TABLE dbo.kas_dues ADD CONSTRAINT CK_kas_dues_month CHECK (DAY(due_month) = 1);
-- satu tagihan per pengurus per bulan
IF OBJECT_ID(N'dbo.UQ_kas_dues_user_month', N'UQ') IS NULL
  ALTER TABLE dbo.kas_dues ADD CONSTRAINT UQ_kas_dues_user_month UNIQUE (user_id, due_month);

IF OBJECT_ID(N'dbo.CK_kas_payments_method', N'C') IS NULL
  ALTER TABLE dbo.kas_payments ADD CONSTRAINT CK_kas_payments_method CHECK (method IN (N'QRIS', N'CASH'));
IF OBJECT_ID(N'dbo.CK_kas_payments_total', N'C') IS NULL
  ALTER TABLE dbo.kas_payments ADD CONSTRAINT CK_kas_payments_total CHECK (total_amount > 0);
IF OBJECT_ID(N'dbo.CK_kas_payments_status', N'C') IS NULL
  ALTER TABLE dbo.kas_payments ADD CONSTRAINT CK_kas_payments_status
    CHECK (status IN (N'MENUNGGU_VERIFIKASI', N'DISETUJUI', N'DITOLAK'));
-- BR-124/125: alasan wajib bila DITOLAK; verifikator bukan pemohon
IF OBJECT_ID(N'dbo.CK_kas_payments_reject', N'C') IS NULL
  ALTER TABLE dbo.kas_payments ADD CONSTRAINT CK_kas_payments_reject
    CHECK (status <> N'DITOLAK' OR LEN(LTRIM(RTRIM(ISNULL(reject_reason, N'')))) > 0);
IF OBJECT_ID(N'dbo.CK_kas_payments_verifier', N'C') IS NULL
  ALTER TABLE dbo.kas_payments ADD CONSTRAINT CK_kas_payments_verifier CHECK (verified_by IS NULL OR verified_by <> user_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_kas_payments_status')
  CREATE INDEX IX_kas_payments_status ON dbo.kas_payments (status, created_at) INCLUDE (user_id, method, total_amount);

IF OBJECT_ID(N'dbo.UQ_kas_payment_items', N'UQ') IS NULL
  ALTER TABLE dbo.kas_payment_items ADD CONSTRAINT UQ_kas_payment_items UNIQUE (payment_id, due_id);
