-- sp_submit_kas_payment
-- TSD 5.1 | FSD-2.43 | POST /kas/payments
-- Hasil: SUCCESS | NOT_ACTIVE_OFFICER | RATE_NOT_SET | INVALID_INPUT | DUE_NOT_OPEN
CREATE OR ALTER PROCEDURE dbo.sp_submit_kas_payment
  @user_id      UNIQUEIDENTIFIER,
  @due_ids      NVARCHAR(MAX),            -- JSON array UUID
  @method       NVARCHAR(10),             -- QRIS | CASH
  @proof_path   NVARCHAR(255),
  @note         NVARCHAR(255) = NULL,
  @payment_id   UNIQUEIDENTIFIER OUTPUT,
  @payment_code NVARCHAR(30) OUTPUT,
  @total_amount DECIMAL(15,2) OUTPUT,
  @months       INT OUTPUT,
  @result       NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  DECLARE @today DATE = CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE);   -- tanggal WIB

  -- 1. Pengurus aktif periode berjalan (BR-120, ERR-KAS-02)
  DECLARE @period_id INT = (SELECT period_id FROM dbo.periods WHERE status = N'AKTIF');
  IF @period_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM dbo.officers o
    JOIN dbo.positions ps ON ps.position_id = o.position_id
    JOIN dbo.divisions dv ON dv.division_id = ps.division_id
    WHERE o.user_id = @user_id AND dv.period_id = @period_id AND (o.end_date IS NULL OR o.end_date >= @today))
  BEGIN SET @result = N'NOT_ACTIVE_OFFICER'; RETURN; END;

  -- 2. Tarif sudah diatur (ERR-CFG-01)
  DECLARE @rate DECIMAL(15,2) = TRY_CAST((SELECT setting_value FROM dbo.system_settings WHERE setting_key = N'KAS_MONTHLY_RATE') AS DECIMAL(15,2));
  IF @rate IS NULL OR @rate <= 0 BEGIN SET @result = N'RATE_NOT_SET'; RETURN; END;

  IF @method NOT IN (N'QRIS', N'CASH') OR ISJSON(@due_ids) <> 1 OR LEN(ISNULL(@proof_path, N'')) = 0
  BEGIN SET @result = N'INVALID_INPUT'; RETURN; END;

  DECLARE @ids TABLE (due_id UNIQUEIDENTIFIER PRIMARY KEY);
  INSERT INTO @ids (due_id) SELECT DISTINCT TRY_CAST(j.value AS UNIQUEIDENTIFIER) FROM OPENJSON(@due_ids) j WHERE TRY_CAST(j.value AS UNIQUEIDENTIFIER) IS NOT NULL;
  SET @months = (SELECT COUNT(*) FROM @ids);
  IF @months = 0 BEGIN SET @result = N'INVALID_INPUT'; RETURN; END;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- 3. Semua bulan milik pemohon, pada periode aktif, dan BELUM_LUNAS (BR-121, BR-123, ERR-KAS-01)
    DECLARE @open INT;
    SELECT @open = COUNT(*), @total_amount = SUM(d.amount)
    FROM dbo.kas_dues d WITH (UPDLOCK, ROWLOCK)
    JOIN @ids i ON i.due_id = d.due_id
    WHERE d.user_id = @user_id AND d.period_id = @period_id AND d.status = N'BELUM_LUNAS';
    IF @open <> @months BEGIN SET @result = N'DUE_NOT_OPEN'; ROLLBACK; RETURN; END;

    -- 4. Kode IUR-DDMMYY-NNN (tanggal WIB, urutan per hari)
    EXEC sp_getapplock @Resource = N'kas_code', @LockMode = N'Exclusive', @LockOwner = N'Transaction';
    DECLARE @prefix NVARCHAR(20) = N'IUR-' + FORMAT(DATEADD(HOUR, 7, SYSUTCDATETIME()), 'ddMMyy') + N'-';
    DECLARE @seq INT = 1 + (SELECT COUNT(*) FROM dbo.kas_payments WHERE payment_code LIKE @prefix + N'%');
    SET @payment_code = @prefix + RIGHT(N'00' + CAST(@seq AS NVARCHAR(4)), 3);
    SET @payment_id = NEWID();

    -- 5. Simpan pengajuan + rincian, kunci bulan
    INSERT INTO dbo.kas_payments (payment_id, payment_code, user_id, period_id, method, total_amount, proof_path, note, status)
    VALUES (@payment_id, @payment_code, @user_id, @period_id, @method, @total_amount, @proof_path, @note, N'MENUNGGU_VERIFIKASI');

    INSERT INTO dbo.kas_payment_items (payment_id, due_id, amount)
    SELECT @payment_id, d.due_id, d.amount FROM dbo.kas_dues d JOIN @ids i ON i.due_id = d.due_id;

    UPDATE d SET status = N'MENUNGGU_VERIFIKASI' FROM dbo.kas_dues d JOIN @ids i ON i.due_id = d.due_id;

    -- 6. Notifikasi verifikator: Bendahara; bila pemohon Bendahara → PHT (BR-125)
    DECLARE @verifier_role NVARCHAR(20) = CASE WHEN EXISTS (
      SELECT 1 FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = @user_id AND ur.revoked_at IS NULL AND r.role_name = N'Bendahara') THEN N'PHT' ELSE N'Bendahara' END;
    DECLARE @name NVARCHAR(100) = (SELECT full_name FROM dbo.users WHERE user_id = @user_id);

    INSERT INTO dbo.notifications (recipient_user_id, type, title, message, channel, related_id)
    SELECT DISTINCT ur.user_id, N'KAS_SUBMITTED', N'Pengajuan iuran kas baru',
           @payment_code + N' oleh ' + @name + N' (' + CAST(@months AS NVARCHAR(4)) + N' bulan)', N'APLIKASI', CAST(@payment_id AS NVARCHAR(100))
    FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
    WHERE r.role_name = @verifier_role AND ur.revoked_at IS NULL AND ur.user_id <> @user_id;

    COMMIT;
    SET @result = N'SUCCESS';
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;
