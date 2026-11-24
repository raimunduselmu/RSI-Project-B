-- sp_report_usage
-- TSD 5.1 | FSD-2.13 | POST /api/v1/usage-reports
-- Hasil (@result): SUCCESS | INVALID_INPUT | INVALID_TIME | TIME_CONFLICT | ASSET_UNAVAILABLE
-- BR-30: tanpa persetujuan, nama & telepon penanggung jawab wajib. BR-31: tidak boleh bentrok.
CREATE OR ALTER PROCEDURE dbo.sp_report_usage
  @reporter_id     UNIQUEIDENTIFIER = NULL,
  @reporter_name   NVARCHAR(150),
  @reporter_phone  NVARCHAR(20),
  @division        NVARCHAR(100),
  @activity_name   NVARCHAR(150),
  @room_id         INT = NULL,
  @asset_ids       NVARCHAR(MAX) = NULL,  -- JSON array UUID
  @start_at        DATETIME2,
  @planned_end_at  DATETIME2,
  @report_id       UNIQUEIDENTIFIER OUTPUT,
  @result          NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  SET @asset_ids = ISNULL(NULLIF(LTRIM(RTRIM(@asset_ids)), N''), N'[]');

  -- 1. Validasi isian (BR-30) dan waktu (ERR-VAL-04). Mulai boleh mundur maks. 1 jam (lapor saat sedang dipakai).
  IF NULLIF(LTRIM(RTRIM(@reporter_name)), N'') IS NULL OR NULLIF(LTRIM(RTRIM(@reporter_phone)), N'') IS NULL
     OR NULLIF(LTRIM(RTRIM(@activity_name)), N'') IS NULL
     OR (@room_id IS NULL AND NOT EXISTS (SELECT 1 FROM OPENJSON(@asset_ids)))
     OR (@room_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.rooms WHERE room_id = @room_id AND is_active = 1))
  BEGIN SET @result = N'INVALID_INPUT'; RETURN; END;

  IF @planned_end_at <= @start_at OR @planned_end_at <= SYSUTCDATETIME() OR @start_at < DATEADD(HOUR, -1, SYSUTCDATETIME())
  BEGIN SET @result = N'INVALID_TIME'; RETURN; END;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- 2. Aset harus ada & berstatus TERSEDIA (ERR-LOAN-02). Dikunci agar tidak direbut proses lain.
    IF EXISTS (
      SELECT 1 FROM OPENJSON(@asset_ids) j
      LEFT JOIN dbo.assets a WITH (UPDLOCK, ROWLOCK)
        ON a.asset_id = TRY_CAST(j.value AS UNIQUEIDENTIFIER) AND a.is_deleted = 0
      WHERE a.asset_id IS NULL OR a.status <> N'TERSEDIA')
    BEGIN SET @result = N'ASSET_UNAVAILABLE'; ROLLBACK; RETURN; END;

    -- 3. Cek bentrok dengan peminjaman & pemakaian lain (BR-31, ERR-LOAN-01)
    EXEC sp_getapplock @Resource = N'usage_report', @LockMode = N'Exclusive', @LockOwner = N'Transaction';
    IF EXISTS (SELECT 1 FROM dbo.fn_check_availability(@room_id, @asset_ids, @start_at, @planned_end_at, NULL))
    BEGIN SET @result = N'TIME_CONFLICT'; ROLLBACK; RETURN; END;

    SET @report_id = NEWID();
    INSERT INTO dbo.usage_reports (report_id, reporter_user_id, reporter_name, reporter_phone, division, activity_name,
                                   room_id, start_at, planned_end_at, status)
    VALUES (@report_id, @reporter_id, LTRIM(RTRIM(@reporter_name)), @reporter_phone, @division, LTRIM(RTRIM(@activity_name)),
            @room_id, @start_at, @planned_end_at, N'BERLANGSUNG');

    INSERT INTO dbo.usage_report_items (report_id, asset_id)
    SELECT DISTINCT @report_id, TRY_CAST(j.value AS UNIQUEIDENTIFIER) FROM OPENJSON(@asset_ids) j;

    -- 4–5. Status aset → DIGUNAKAN + riwayat (trg_asset_history dilewati agar tidak ganda)
    DECLARE @actor_name NVARCHAR(150) = ISNULL((SELECT full_name FROM dbo.users WHERE user_id = @reporter_id), @reporter_name);
    EXEC sp_set_session_context N'history_event', N'PEMINJAMAN';
    INSERT INTO dbo.asset_histories (asset_id, event_type, old_value, new_value, note, actor_user_id, actor_name)
    SELECT a.asset_id, N'PEMINJAMAN',
           (SELECT a.status AS status FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT N'DIGUNAKAN' AS status FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           N'Pemakaian internal: ' + LTRIM(RTRIM(@activity_name)) + N' (' + @division + N')', @reporter_id, @actor_name
    FROM dbo.usage_report_items ui JOIN dbo.assets a ON a.asset_id = ui.asset_id
    WHERE ui.report_id = @report_id;

    UPDATE a SET status = N'DIGUNAKAN', updated_at = SYSUTCDATETIME()
    FROM dbo.assets a JOIN dbo.usage_report_items ui ON ui.asset_id = a.asset_id
    WHERE ui.report_id = @report_id;
    EXEC sp_set_session_context N'history_event', NULL;

    COMMIT;
    SET @result = N'SUCCESS';
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    EXEC sp_set_session_context N'history_event', NULL;
    THROW;
  END CATCH
END;
