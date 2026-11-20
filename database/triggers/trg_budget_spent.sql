-- trg_budget_spent
-- TSD 5.4 | FSD-2.33 | serapan anggaran = jumlah kas KELUAR berstatus DISETUJUI pada pos terkait
CREATE OR ALTER TRIGGER dbo.trg_budget_spent
ON dbo.cash_transactions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE b SET spent_amount = (
    SELECT ISNULL(SUM(c.amount), 0) FROM dbo.cash_transactions c
    WHERE c.budget_id = b.budget_id AND c.transaction_type = N'KELUAR' AND c.status = N'DISETUJUI')
  FROM dbo.budgets b
  WHERE b.budget_id IN (SELECT budget_id FROM inserted WHERE budget_id IS NOT NULL
                        UNION SELECT budget_id FROM deleted WHERE budget_id IS NOT NULL);
END;
