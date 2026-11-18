-- trg_audit_changes
-- TSD 5.4 | contoh untuk users
-- Duplikasi pola ini untuk tabel lain di TSD 5.4 (ganti nama tabel & PK).
CREATE OR ALTER TRIGGER dbo.trg_audit_changes_users
ON dbo.users
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'users_' + CASE WHEN i.user_id IS NOT NULL AND d.user_id IS NOT NULL THEN N'UPDATE'
                     WHEN i.user_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'users',
    CAST(COALESCE(i.user_id, d.user_id) AS NVARCHAR(100)),
    (SELECT d.user_id, d.full_name, d.username, d.email, d.is_active FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
    (SELECT i.user_id, i.full_name, i.username, i.email, i.is_active FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.user_id = i.user_id;   -- password_hash sengaja tidak dicatat
END;
