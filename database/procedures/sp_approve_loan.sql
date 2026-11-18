-- sp_approve_loan
-- TSD 5.1 | FSD-2.11 | POST /loans/{id}/approve & /reject
CREATE OR ALTER PROCEDURE dbo.sp_approve_loan
  @loan_id UNIQUEIDENTIFIER,
  @approver_id UNIQUEIDENTIFIER,
  @decision NVARCHAR(10),            -- SETUJU | TOLAK
  @note NVARCHAR(255) = NULL,
  @result NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @status NVARCHAR(20), @room_id INT, @start DATETIME2, @end DATETIME2;
    SELECT @status = status, @room_id = room_id, @start = start_at, @end = end_at
    FROM dbo.loan_requests WITH (UPDLOCK, ROWLOCK)
    WHERE loan_id = @loan_id;

    IF @status IS NULL OR @status <> N'MENUNGGU'
    BEGIN SET @result = N'ALREADY_PROCESSED'; ROLLBACK; RETURN; END;

    -- Workflow 1 tahap: Sarpras atau Admin (BR-54)
    IF NOT EXISTS (
      SELECT 1 FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = @approver_id AND ur.revoked_at IS NULL
        AND r.role_name IN (N'Sarpras', N'Admin'))
    BEGIN SET @result = N'NOT_AUTHORIZED'; ROLLBACK; RETURN; END;

    IF @decision = N'TOLAK'
    BEGIN
      IF NULLIF(LTRIM(RTRIM(@note)), N'') IS NULL
      BEGIN SET @result = N'REASON_REQUIRED'; ROLLBACK; RETURN; END;   -- BR-25

      UPDATE dbo.loan_requests
      SET status = N'DITOLAK', reject_reason = @note, reviewed_by = @approver_id, reviewed_at = SYSUTCDATETIME()
      WHERE loan_id = @loan_id;
      -- TODO: INSERT approval_logs, notifications
      SET @result = N'SUCCESS_REJECTED';
      COMMIT; RETURN;
    END;

    -- Cek ulang bentrok (BR-26)
    IF EXISTS (SELECT 1 FROM dbo.fn_check_availability(@room_id, N'[]', @start, @end, @loan_id))
    BEGIN SET @result = N'TIME_CONFLICT'; ROLLBACK; RETURN; END;

    UPDATE dbo.loan_requests
    SET status = N'DISETUJUI', reviewed_by = @approver_id, reviewed_at = SYSUTCDATETIME()
    WHERE loan_id = @loan_id;
    -- TODO: INSERT approval_logs, notifications, notification_logs
    SET @result = N'SUCCESS_APPROVED';
    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;
