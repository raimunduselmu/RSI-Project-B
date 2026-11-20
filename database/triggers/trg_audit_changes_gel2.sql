-- trg_audit_changes (lanjutan gelombang 2)
-- TSD 5.4 | BR-96, BR-127 | perubahan data penting tercatat di audit_logs (siapa, kapan, nilai lama & baru)
-- Pola sama dengan trg_audit_changes.sql. Pelaku dibaca dari SESSION_CONTEXT (lib/sql.ts).

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_periods
ON dbo.periods
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'periods_' + CASE WHEN i.period_id IS NOT NULL AND d.period_id IS NOT NULL THEN N'UPDATE'
                   WHEN i.period_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'periods',
    CAST(COALESCE(i.period_id, d.period_id) AS NVARCHAR(100)),
    CASE WHEN d.period_id IS NOT NULL THEN (SELECT d.period_id, d.period_name, d.start_date, d.end_date, d.status, d.closed_at FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.period_id IS NOT NULL THEN (SELECT i.period_id, i.period_name, i.start_date, i.end_date, i.status, i.closed_at FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.period_id = i.period_id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_divisions
ON dbo.divisions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'divisions_' + CASE WHEN i.division_id IS NOT NULL AND d.division_id IS NOT NULL THEN N'UPDATE'
                   WHEN i.division_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'divisions',
    CAST(COALESCE(i.division_id, d.division_id) AS NVARCHAR(100)),
    CASE WHEN d.division_id IS NOT NULL THEN (SELECT d.division_id, d.period_id, d.division_name, d.role_id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.division_id IS NOT NULL THEN (SELECT i.division_id, i.period_id, i.division_name, i.role_id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.division_id = i.division_id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_officers
ON dbo.officers
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'officers_' + CASE WHEN i.officer_id IS NOT NULL AND d.officer_id IS NOT NULL THEN N'UPDATE'
                   WHEN i.officer_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'officers',
    CAST(COALESCE(i.officer_id, d.officer_id) AS NVARCHAR(100)),
    CASE WHEN d.officer_id IS NOT NULL THEN (SELECT d.officer_id, d.member_id, d.position_id, d.user_id, d.start_date, d.end_date FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.officer_id IS NOT NULL THEN (SELECT i.officer_id, i.member_id, i.position_id, i.user_id, i.start_date, i.end_date FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.officer_id = i.officer_id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_user_roles
ON dbo.user_roles
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'user_roles_' + CASE WHEN i.user_role_id IS NOT NULL AND d.user_role_id IS NOT NULL THEN N'UPDATE'
                   WHEN i.user_role_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'user_roles',
    CAST(COALESCE(i.user_role_id, d.user_role_id) AS NVARCHAR(100)),
    CASE WHEN d.user_role_id IS NOT NULL THEN (SELECT d.user_role_id, d.user_id, d.role_id, d.officer_id, d.revoked_at FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.user_role_id IS NOT NULL THEN (SELECT i.user_role_id, i.user_id, i.role_id, i.officer_id, i.revoked_at FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.user_role_id = i.user_role_id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_system_settings
ON dbo.system_settings
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'system_settings_' + CASE WHEN i.setting_key IS NOT NULL AND d.setting_key IS NOT NULL THEN N'UPDATE'
                   WHEN i.setting_key IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'system_settings',
    CAST(COALESCE(i.setting_key, d.setting_key) AS NVARCHAR(100)),
    CASE WHEN d.setting_key IS NOT NULL THEN (SELECT d.setting_key, d.setting_value FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.setting_key IS NOT NULL THEN (SELECT i.setting_key, i.setting_value FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.setting_key = i.setting_key;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_kas_payments
ON dbo.kas_payments
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'kas_payments_' + CASE WHEN i.payment_id IS NOT NULL AND d.payment_id IS NOT NULL THEN N'UPDATE'
                   WHEN i.payment_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'kas_payments',
    CAST(COALESCE(i.payment_id, d.payment_id) AS NVARCHAR(100)),
    CASE WHEN d.payment_id IS NOT NULL THEN (SELECT d.payment_id, d.payment_code, d.user_id, d.method, d.total_amount, d.status, d.reject_reason, d.verified_by FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.payment_id IS NOT NULL THEN (SELECT i.payment_id, i.payment_code, i.user_id, i.method, i.total_amount, i.status, i.reject_reason, i.verified_by FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.payment_id = i.payment_id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_cash_transactions
ON dbo.cash_transactions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'cash_transactions_' + CASE WHEN i.transaction_id IS NOT NULL AND d.transaction_id IS NOT NULL THEN N'UPDATE'
                   WHEN i.transaction_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'cash_transactions',
    CAST(COALESCE(i.transaction_id, d.transaction_id) AS NVARCHAR(100)),
    CASE WHEN d.transaction_id IS NOT NULL THEN (SELECT d.transaction_id, d.transaction_type, d.amount, d.category, d.budget_id, d.status, d.source_ref FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.transaction_id IS NOT NULL THEN (SELECT i.transaction_id, i.transaction_type, i.amount, i.category, i.budget_id, i.status, i.source_ref FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.transaction_id = i.transaction_id;
END;
