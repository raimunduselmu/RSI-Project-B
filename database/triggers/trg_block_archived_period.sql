-- trg_block_archived_period
-- TSD 5.4 | ERR-DATA-04 | contoh untuk cash_transactions
-- Duplikasi pola ini untuk divisions, budgets, kas_dues, kas_payments, handovers.
CREATE OR ALTER TRIGGER dbo.trg_block_archived_period_cash
ON dbo.cash_transactions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1 FROM (SELECT period_id FROM inserted UNION ALL SELECT period_id FROM deleted) x
    JOIN dbo.periods p ON p.period_id = x.period_id
    WHERE p.status = N'ARSIP')
    THROW 50004, N'ERR-DATA-04', 1;
END;
