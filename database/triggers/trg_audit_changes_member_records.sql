-- FSD-2.24 Main Flow Step 5
-- TSD Table 120
-- Audit penambahan riwayat pelayanan dan katekese.

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_member_records
ON dbo.member_records
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.audit_logs (
    user_id,
    user_email,
    action_type,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    created_at
  )
  SELECT
    TRY_CAST(
      SESSION_CONTEXT(N'user_id')
      AS UNIQUEIDENTIFIER
    ),

    CAST(
      SESSION_CONTEXT(N'username')
      AS NVARCHAR(150)
    ),

    N'MEMBER_RECORD_CREATED',

    N'member_records',

    CAST(
      i.record_id AS NVARCHAR(100)
    ),

    NULL,

    (
      SELECT
        i.record_id,
        i.member_id,
        i.record_type,
        i.title,
        i.record_date,
        i.period_id,
        i.note,
        i.corrects_record_id
      FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    ),

    CAST(
      SESSION_CONTEXT(N'ip_address')
      AS VARCHAR(45)
    ),

    SYSUTCDATETIME()

  FROM inserted AS i;
END;
GO