-- FSD-2.24 Main Flow Step 5
-- TSD Table 120
-- Audit penambahan catatan sakramen.

CREATE OR ALTER TRIGGER dbo.trg_audit_changes_sacraments
ON dbo.sacraments
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

    N'sacraments',

    CAST(
      i.sacrament_id AS NVARCHAR(100)
    ),

    NULL,

    (
      SELECT
        i.sacrament_id,
        i.member_id,
        i.sacrament_type,
        i.sacrament_date,
        i.place,
        i.note
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