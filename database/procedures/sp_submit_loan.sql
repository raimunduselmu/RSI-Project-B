-- sp_submit_loan
-- TSD 5.1 | FSD-2.10 | POST /api/v1/loans (publik)
-- Hasil (@result): SUCCESS | INVALID_INPUT | INVALID_TIME | TIME_CONFLICT | ASSET_UNAVAILABLE
-- Email konfirmasi dikirim aplikasi SETELAH commit (AC-08), bukan di SP ini.
CREATE OR ALTER PROCEDURE dbo.sp_submit_loan
  @request_type   NVARCHAR(20),          -- RUANGAN | ASET
  @room_id        INT = NULL,
  @asset_ids      NVARCHAR(MAX) = NULL,   -- JSON array UUID
  @start_at       DATETIME2,
  @end_at         DATETIME2,
  @borrower_name  NVARCHAR(150),
  @borrower_phone NVARCHAR(20),
  @borrower_email NVARCHAR(150),
  @borrower_org   NVARCHAR(100) = NULL,
  @purpose        NVARCHAR(255),
  @use_facilities BIT = 0,
  @event_id       UNIQUEIDENTIFIER = NULL,
  @loan_id        UNIQUEIDENTIFIER OUTPUT,
  @loan_code      NVARCHAR(30) OUTPUT,
  @result         NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  SET @asset_ids = ISNULL(NULLIF(LTRIM(RTRIM(@asset_ids)), N''), N'[]');

  -- 1. Validasi waktu (ERR-VAL-04)
  IF @end_at <= @start_at OR @start_at < SYSUTCDATETIME()
  BEGIN SET @result = N'INVALID_TIME'; RETURN; END;

  -- 2. Validasi isi: RUANGAN wajib room_id aktif; ASET wajib minimal 1 aset
  IF (@request_type = N'RUANGAN' AND NOT EXISTS (SELECT 1 FROM dbo.rooms WHERE room_id = @room_id AND is_active = 1))
     OR (@request_type = N'ASET' AND NOT EXISTS (SELECT 1 FROM OPENJSON(@asset_ids)))
     OR @request_type NOT IN (N'RUANGAN', N'ASET')
  BEGIN SET @result = N'INVALID_INPUT'; RETURN; END;

  -- 3. Setiap aset harus ada, boleh dipinjam, dan tidak hilang/nonaktif/pemeliharaan (BR-55, ERR-LOAN-02)
  IF EXISTS (
    SELECT 1 FROM OPENJSON(@asset_ids) j
    LEFT JOIN dbo.assets a ON a.asset_id = TRY_CAST(j.value AS UNIQUEIDENTIFIER) AND a.is_deleted = 0
    WHERE a.asset_id IS NULL OR a.is_lendable = 0 OR a.status IN (N'HILANG', N'NONAKTIF', N'PEMELIHARAAN'))
  BEGIN SET @result = N'ASSET_UNAVAILABLE'; RETURN; END;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- 4. Cek bentrok jadwal (BR-22, ERR-LOAN-01) di dalam transaksi
    IF EXISTS (SELECT 1 FROM dbo.fn_check_availability(@room_id, @asset_ids, @start_at, @end_at, NULL))
    BEGIN SET @result = N'TIME_CONFLICT'; ROLLBACK; RETURN; END;

    -- 5. Kode lacak PJM-DDMMYY-NNN (tanggal WIB, urutan per hari)
    EXEC sp_getapplock @Resource = N'loan_code', @LockMode = N'Exclusive', @LockOwner = N'Transaction';
    DECLARE @prefix NVARCHAR(20) = N'PJM-' + FORMAT(DATEADD(HOUR, 7, SYSUTCDATETIME()), 'ddMMyy') + N'-';
    DECLARE @seq INT = 1 + (SELECT COUNT(*) FROM dbo.loan_requests WHERE loan_code LIKE @prefix + N'%');
    SET @loan_code = @prefix + RIGHT(N'00' + CAST(@seq AS NVARCHAR(4)), 3);
    SET @loan_id = NEWID();

    DECLARE @workflow_id INT = (SELECT TOP 1 workflow_id FROM dbo.workflows WHERE module = N'PEMINJAMAN' AND is_active = 1 ORDER BY version DESC);

    INSERT INTO dbo.loan_requests (loan_id, loan_code, request_type, room_id, borrower_name, borrower_phone, borrower_email,
                                   borrower_org, purpose, start_at, end_at, use_facilities, status, workflow_id, current_step, event_id)
    VALUES (@loan_id, @loan_code, @request_type, CASE WHEN @request_type = N'RUANGAN' THEN @room_id END, @borrower_name, @borrower_phone,
            @borrower_email, @borrower_org, @purpose, @start_at, @end_at, @use_facilities, N'MENUNGGU', @workflow_id, 1, @event_id);

    INSERT INTO dbo.loan_items (loan_id, asset_id)
    SELECT DISTINCT @loan_id, TRY_CAST(j.value AS UNIQUEIDENTIFIER) FROM OPENJSON(@asset_ids) j;

    -- 6. Notifikasi aplikasi untuk semua Sarpras aktif
    INSERT INTO dbo.notifications (recipient_user_id, type, title, message, channel, related_id)
    SELECT DISTINCT ur.user_id, N'LOAN_SUBMITTED', N'Pengajuan peminjaman baru',
           @loan_code + N' oleh ' + @borrower_name, N'APLIKASI', CAST(@loan_id AS NVARCHAR(100))
    FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
    WHERE r.role_name = N'Sarpras' AND ur.revoked_at IS NULL;

    COMMIT;
    SET @result = N'SUCCESS';
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END;
