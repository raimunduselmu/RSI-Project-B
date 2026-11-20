-- sp_approve_loan
-- TSD 5.1 | FSD-2.11 | POST /loans/{id}/approve & /reject — workflow Peminjaman 1 tahap (Sarpras/Admin)
-- Hasil: SUCCESS_APPROVED | SUCCESS_REJECTED | REASON_REQUIRED | ALREADY_PROCESSED | NOT_AUTHORIZED | TIME_CONFLICT | NOT_FOUND
CREATE OR ALTER PROCEDURE dbo.sp_approve_loan
  @loan_id     UNIQUEIDENTIFIER,
  @approver_id UNIQUEIDENTIFIER,
  @decision    NVARCHAR(10),            -- SETUJU | TOLAK
  @note        NVARCHAR(MAX) = NULL,
  @result      NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @status NVARCHAR(20), @room_id INT, @start DATETIME2, @end DATETIME2, @workflow_id INT, @code NVARCHAR(30), @assets NVARCHAR(MAX);
    SELECT @status = status, @room_id = room_id, @start = start_at, @end = end_at, @workflow_id = workflow_id, @code = loan_code
    FROM dbo.loan_requests WITH (UPDLOCK, ROWLOCK)
    WHERE loan_id = @loan_id;

    IF @status IS NULL BEGIN SET @result = N'NOT_FOUND'; ROLLBACK; RETURN; END;
    IF @status <> N'MENUNGGU' BEGIN SET @result = N'ALREADY_PROCESSED'; ROLLBACK; RETURN; END;   -- ERR-LOAN-03

    -- Penyetuju: role aktif sesuai langkah workflow (Sarpras) atau Admin (BR-54)
    DECLARE @step_id INT, @approver_role NVARCHAR(30);
    SELECT TOP 1 @step_id = step_id, @approver_role = approver_role
    FROM dbo.workflow_steps WHERE workflow_id = @workflow_id ORDER BY step_order;
    IF NOT EXISTS (
      SELECT 1 FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = @approver_id AND ur.revoked_at IS NULL
        AND r.role_name IN (ISNULL(@approver_role, N'Sarpras'), N'Admin'))
    BEGIN SET @result = N'NOT_AUTHORIZED'; ROLLBACK; RETURN; END;

    IF @decision = N'TOLAK'
    BEGIN
      IF NULLIF(LTRIM(RTRIM(@note)), N'') IS NULL
      BEGIN SET @result = N'REASON_REQUIRED'; ROLLBACK; RETURN; END;   -- BR-25

      UPDATE dbo.loan_requests
      SET status = N'DITOLAK', reject_reason = @note, reviewed_by = @approver_id, reviewed_at = SYSUTCDATETIME()
      WHERE loan_id = @loan_id;
      SET @result = N'SUCCESS_REJECTED';
    END
    ELSE
    BEGIN
      -- Cek ulang bentrok sebelum disetujui (BR-26)
      SET @assets = ISNULL((SELECT N'[' + STRING_AGG(N'"' + CAST(asset_id AS NVARCHAR(36)) + N'"', N',') + N']'
                            FROM dbo.loan_items WHERE loan_id = @loan_id), N'[]');
      IF EXISTS (SELECT 1 FROM dbo.fn_check_availability(@room_id, @assets, @start, @end, @loan_id))
      BEGIN SET @result = N'TIME_CONFLICT'; ROLLBACK; RETURN; END;   -- ERR-LOAN-01

      UPDATE dbo.loan_requests
      SET status = N'DISETUJUI', reviewed_by = @approver_id, reviewed_at = SYSUTCDATETIME()
      WHERE loan_id = @loan_id;
      SET @result = N'SUCCESS_APPROVED';
    END;

    IF @step_id IS NOT NULL
      INSERT INTO dbo.approval_logs (step_id, ref_module, ref_id, approver_id, decision, note)
      VALUES (@step_id, N'PEMINJAMAN', @code, @approver_id, CASE WHEN @decision = N'TOLAK' THEN N'TOLAK' ELSE N'SETUJU' END, @note);

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;
