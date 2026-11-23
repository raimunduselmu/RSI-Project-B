-- trg_audit_changes (lanjutan gelombang 4)
-- TSD 5.4 | BR-96 | perubahan laporan insiden & jadwal pemeliharaan tercatat di audit_logs.
-- Pola sama dengan trg_audit_changes_gel2.sql. Pelaku dibaca dari SESSION_CONTEXT (lib/sql.ts).

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_incidents
ON dbo.incidents
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'incidents_' + CASE WHEN i.incident_id IS NOT NULL AND d.incident_id IS NOT NULL THEN N'UPDATE'
                     WHEN i.incident_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'incidents',
    CAST(COALESCE(i.incident_id, d.incident_id) AS NVARCHAR(100)),
    CASE WHEN d.incident_id IS NOT NULL THEN (SELECT d.incident_id, d.asset_id, d.incident_type, d.status, d.responsible_name, d.follow_up FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.incident_id IS NOT NULL THEN (SELECT i.incident_id, i.asset_id, i.incident_type, i.status, i.responsible_name, i.follow_up FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.incident_id = i.incident_id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_maintenance_schedules
ON dbo.maintenance_schedules
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.audit_logs (user_id, user_email, action_type, resource_type, resource_id,
                              old_values, new_values, ip_address, created_at)
  SELECT
    TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER),
    CAST(SESSION_CONTEXT(N'username') AS NVARCHAR(150)),
    N'maintenance_schedules_' + CASE WHEN i.schedule_id IS NOT NULL AND d.schedule_id IS NOT NULL THEN N'UPDATE'
                                 WHEN i.schedule_id IS NOT NULL THEN N'INSERT' ELSE N'DELETE' END,
    N'maintenance_schedules',
    CAST(COALESCE(i.schedule_id, d.schedule_id) AS NVARCHAR(100)),
    CASE WHEN d.schedule_id IS NOT NULL THEN (SELECT d.schedule_id, d.asset_id, d.task_name, d.interval_days, d.next_due_date, d.last_done_date, d.is_active FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CASE WHEN i.schedule_id IS NOT NULL THEN (SELECT i.schedule_id, i.asset_id, i.task_name, i.interval_days, i.next_due_date, i.last_done_date, i.is_active FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) END,
    CAST(SESSION_CONTEXT(N'ip_address') AS VARCHAR(45)),
    SYSUTCDATETIME()
  FROM inserted i
  FULL OUTER JOIN deleted d ON d.schedule_id = i.schedule_id;
END;
