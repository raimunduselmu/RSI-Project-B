-- trg_audit_log_append_only
-- TSD 5.4 | audit_logs append-only
CREATE OR ALTER TRIGGER dbo.trg_audit_log_append_only
ON dbo.audit_logs
INSTEAD OF UPDATE, DELETE
AS
BEGIN
  THROW 50001, N'Tabel audit_logs bersifat append-only', 1;
END;
