-- trg_block_archived_period
-- TSD 5.4 | FSD-2.25 BR-62, 2.33 BR-82, 2.44 | ERR-DATA-04
-- Data periode ARSIP bersifat read-only. Satu trigger per tabel (dipisah GO).
-- officers tidak diberi trigger karena trg_revoke_roles_on_archive mengisi end_date saat pengarsipan;
-- pembatasan officers dijaga di organization.service.ts.

-- periods: baris yang sudah ARSIP tidak boleh diubah/dihapus (transisi AKTIF → ARSIP tetap boleh)
CREATE OR ALTER TRIGGER dbo.trg_block_archived_period
ON dbo.periods
AFTER UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (SELECT 1 FROM deleted WHERE status = N'ARSIP')
    THROW 50004, N'ERR-DATA-04', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_block_archived_period_divisions
ON dbo.divisions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1 FROM (SELECT period_id FROM inserted UNION ALL SELECT period_id FROM deleted) x
    JOIN dbo.periods p ON p.period_id = x.period_id WHERE p.status = N'ARSIP')
    THROW 50004, N'ERR-DATA-04', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_block_archived_period_positions
ON dbo.positions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1 FROM (SELECT division_id FROM inserted UNION ALL SELECT division_id FROM deleted) x
    JOIN dbo.divisions dv ON dv.division_id = x.division_id
    JOIN dbo.periods p ON p.period_id = dv.period_id WHERE p.status = N'ARSIP')
    THROW 50004, N'ERR-DATA-04', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_block_archived_period_cash
ON dbo.cash_transactions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1 FROM (SELECT period_id FROM inserted UNION ALL SELECT period_id FROM deleted) x
    JOIN dbo.periods p ON p.period_id = x.period_id WHERE p.status = N'ARSIP')
    THROW 50004, N'ERR-DATA-04', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_block_archived_period_budgets
ON dbo.budgets
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1 FROM (SELECT period_id FROM inserted UNION ALL SELECT period_id FROM deleted) x
    JOIN dbo.periods p ON p.period_id = x.period_id WHERE p.status = N'ARSIP')
    THROW 50004, N'ERR-DATA-04', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_block_archived_period_kas_dues
ON dbo.kas_dues
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1 FROM (SELECT period_id FROM inserted UNION ALL SELECT period_id FROM deleted) x
    JOIN dbo.periods p ON p.period_id = x.period_id WHERE p.status = N'ARSIP')
    THROW 50004, N'ERR-DATA-04', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_block_archived_period_kas_payments
ON dbo.kas_payments
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1 FROM (SELECT period_id FROM inserted UNION ALL SELECT period_id FROM deleted) x
    JOIN dbo.periods p ON p.period_id = x.period_id WHERE p.status = N'ARSIP')
    THROW 50004, N'ERR-DATA-04', 1;
END;
