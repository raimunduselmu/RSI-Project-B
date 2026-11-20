-- sp_verify_kas_payment
-- TSD 5.1 | FSD-2.44 | POST /kas/payments/{id}/approve & /reject
-- Hasil: SUCCESS_APPROVED | SUCCESS_REJECTED | INVALID_INPUT | NOT_FOUND | ALREADY_PROCESSED | NOT_AUTHORIZED | REASON_REQUIRED | PERIOD_ARCHIVED
CREATE OR ALTER PROCEDURE dbo.sp_verify_kas_payment
  @payment_id          UNIQUEIDENTIFIER,
  @verifier_id         UNIQUEIDENTIFIER,
  @decision            NVARCHAR(10),          -- SETUJU | TOLAK
  @reject_reason       NVARCHAR(255) = NULL,
  @cash_transaction_id UNIQUEIDENTIFIER = NULL OUTPUT,
  @result              NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  IF @decision NOT IN (N'SETUJU', N'TOLAK') BEGIN SET @result = N'INVALID_INPUT'; RETURN; END;
  IF @decision = N'TOLAK' AND LEN(LTRIM(RTRIM(ISNULL(@reject_reason, N'')))) = 0
  BEGIN SET @result = N'REASON_REQUIRED'; RETURN; END;

  BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @status NVARCHAR(25), @owner UNIQUEIDENTIFIER, @period_id INT, @code NVARCHAR(30),
            @total DECIMAL(15,2), @proof NVARCHAR(255), @method NVARCHAR(10);
    SELECT @status = status, @owner = user_id, @period_id = period_id, @code = payment_code,
           @total = total_amount, @proof = proof_path, @method = method
    FROM dbo.kas_payments WITH (UPDLOCK, ROWLOCK)
    WHERE payment_id = @payment_id;

    IF @status IS NULL BEGIN SET @result = N'NOT_FOUND'; ROLLBACK; RETURN; END;
    IF @status <> N'MENUNGGU_VERIFIKASI' BEGIN SET @result = N'ALREADY_PROCESSED'; ROLLBACK; RETURN; END;   -- ERR-KAS-03
    IF EXISTS (SELECT 1 FROM dbo.periods WHERE period_id = @period_id AND status = N'ARSIP')
    BEGIN SET @result = N'PERIOD_ARCHIVED'; ROLLBACK; RETURN; END;                                          -- ERR-DATA-04

    -- BR-125: verifikator Bendahara; pengajuan milik Bendahara → PHT; tidak boleh memverifikasi milik sendiri
    DECLARE @need_role NVARCHAR(20) = CASE WHEN EXISTS (
      SELECT 1 FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = @owner AND ur.revoked_at IS NULL AND r.role_name = N'Bendahara') THEN N'PHT' ELSE N'Bendahara' END;
    IF @verifier_id = @owner OR NOT EXISTS (
      SELECT 1 FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = @verifier_id AND ur.revoked_at IS NULL AND r.role_name = @need_role)
    BEGIN SET @result = N'NOT_AUTHORIZED'; ROLLBACK; RETURN; END;

    DECLARE @step_id INT = (
      SELECT TOP 1 ws.step_id FROM dbo.workflow_steps ws JOIN dbo.workflows w ON w.workflow_id = ws.workflow_id
      WHERE w.module = N'IURAN_KAS' AND w.is_active = 1 ORDER BY w.version DESC, ws.step_order);

    IF @decision = N'TOLAK'
    BEGIN
      UPDATE dbo.kas_payments
      SET status = N'DITOLAK', reject_reason = @reject_reason, verified_by = @verifier_id, verified_at = SYSUTCDATETIME()
      WHERE payment_id = @payment_id;

      UPDATE d SET status = N'BELUM_LUNAS'
      FROM dbo.kas_dues d JOIN dbo.kas_payment_items i ON i.due_id = d.due_id
      WHERE i.payment_id = @payment_id AND d.status = N'MENUNGGU_VERIFIKASI';

      SET @result = N'SUCCESS_REJECTED';
    END
    ELSE
    BEGIN
      -- Kas Masuk otomatis (FSD-2.33 AF-3), satu transaksi per pengajuan (BR-124)
      DECLARE @month_list NVARCHAR(400) = (
        SELECT STRING_AGG(FORMAT(d.due_month, 'MM/yyyy'), N', ') WITHIN GROUP (ORDER BY d.due_month)
        FROM dbo.kas_dues d JOIN dbo.kas_payment_items i ON i.due_id = d.due_id WHERE i.payment_id = @payment_id);
      SET @cash_transaction_id = NEWID();
      INSERT INTO dbo.cash_transactions (transaction_id, transaction_type, amount, category, transaction_date, proof_path,
                                         period_id, source_ref, status, description, created_by)
      VALUES (@cash_transaction_id, N'MASUK', @total, N'Iuran Kas', CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE), @proof,
              @period_id, @code, N'DISETUJUI',
              N'Iuran kas ' + (SELECT full_name FROM dbo.users WHERE user_id = @owner) + N' (' + @method + N'): ' + ISNULL(@month_list, N'-'),
              @verifier_id);

      UPDATE d SET status = N'LUNAS'
      FROM dbo.kas_dues d JOIN dbo.kas_payment_items i ON i.due_id = d.due_id
      WHERE i.payment_id = @payment_id;

      UPDATE dbo.kas_payments
      SET status = N'DISETUJUI', verified_by = @verifier_id, verified_at = SYSUTCDATETIME(), cash_transaction_id = @cash_transaction_id
      WHERE payment_id = @payment_id;

      SET @result = N'SUCCESS_APPROVED';
    END;

    INSERT INTO dbo.approval_logs (step_id, ref_module, ref_id, approver_id, decision, note)
    VALUES (@step_id, N'IURAN_KAS', @code, @verifier_id, @decision, CASE WHEN @decision = N'TOLAK' THEN @reject_reason END);

    INSERT INTO dbo.notifications (recipient_user_id, type, title, message, channel, related_id)
    VALUES (@owner,
            CASE WHEN @decision = N'TOLAK' THEN N'KAS_REJECTED' ELSE N'KAS_APPROVED' END,
            CASE WHEN @decision = N'TOLAK' THEN N'Pembayaran iuran ditolak' ELSE N'Pembayaran iuran disetujui' END,
            @code + CASE WHEN @decision = N'TOLAK' THEN N' ditolak: ' + @reject_reason ELSE N' disetujui. Bulan terkait sudah LUNAS.' END,
            N'APLIKASI', CAST(@payment_id AS NVARCHAR(100)));

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;
