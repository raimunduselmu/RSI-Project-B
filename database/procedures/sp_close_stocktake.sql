-- sp_close_stocktake
-- TSD 5.1 | FSD-2.17 | POST /api/v1/stocktakes/{id}/close
-- Hasil (@result): SUCCESS | NOT_FOUND | ALREADY_CLOSED | UNCHECKED_ITEMS
-- @summary: JSON {ditemukan, tidak_ditemukan, selisih_lokasi, selisih_kondisi}
-- BR-41: penutupan mensyaratkan semua aset diperiksa ATAU diberi catatan; periode DITUTUP tidak dapat diubah.
CREATE OR ALTER PROCEDURE dbo.sp_close_stocktake
  @period_id UNIQUEIDENTIFIER,
  @actor_id  UNIQUEIDENTIFIER = NULL,
  @summary   NVARCHAR(MAX) OUTPUT,
  @result    NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @status NVARCHAR(20) = (SELECT status FROM dbo.stocktake_periods WITH (UPDLOCK, ROWLOCK) WHERE period_id = @period_id);
    IF @status IS NULL BEGIN SET @result = N'NOT_FOUND'; ROLLBACK; RETURN; END;
    IF @status <> N'TERBUKA' BEGIN SET @result = N'ALREADY_CLOSED'; ROLLBACK; RETURN; END;

    IF EXISTS (SELECT 1 FROM dbo.stocktake_items WHERE period_id = @period_id AND found IS NULL AND NULLIF(LTRIM(RTRIM(note)), N'') IS NULL)
    BEGIN SET @result = N'UNCHECKED_ITEMS'; ROLLBACK; RETURN; END;

    -- Ringkasan dihitung SEBELUM aset disesuaikan
    SET @summary = (
      SELECT
        SUM(CASE WHEN si.found = 1 THEN 1 ELSE 0 END) AS ditemukan,
        SUM(CASE WHEN si.found = 0 THEN 1 ELSE 0 END) AS tidak_ditemukan,
        SUM(CASE WHEN si.found IS NULL THEN 1 ELSE 0 END) AS tidak_diperiksa,
        SUM(CASE WHEN si.found = 1 AND si.actual_location IS NOT NULL AND si.actual_location <> a.location_text THEN 1 ELSE 0 END) AS selisih_lokasi,
        SUM(CASE WHEN si.found = 1 AND si.actual_condition IS NOT NULL AND si.actual_condition <> a.asset_condition THEN 1 ELSE 0 END) AS selisih_kondisi
      FROM dbo.stocktake_items si JOIN dbo.assets a ON a.asset_id = si.asset_id
      WHERE si.period_id = @period_id
      FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES);

    DECLARE @actor_name NVARCHAR(150) = ISNULL((SELECT full_name FROM dbo.users WHERE user_id = @actor_id), N'Sistem');
    DECLARE @pname NVARCHAR(150) = (SELECT period_name FROM dbo.stocktake_periods WHERE period_id = @period_id);

    -- Riwayat PEMERIKSAAN untuk aset yang berbeda dari data (trg_asset_history dilewati agar tidak ganda)
    EXEC sp_set_session_context N'history_event', N'PEMERIKSAAN';
    INSERT INTO dbo.asset_histories (asset_id, event_type, old_value, new_value, note, actor_user_id, actor_name)
    SELECT a.asset_id, N'PEMERIKSAAN',
           (SELECT a.location_text AS lokasi, a.asset_condition AS kondisi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT ISNULL(si.actual_location, a.location_text) AS lokasi, ISNULL(si.actual_condition, a.asset_condition) AS kondisi
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           @pname + ISNULL(N' · ' + si.note, N''), @actor_id, @actor_name
    FROM dbo.stocktake_items si JOIN dbo.assets a ON a.asset_id = si.asset_id
    WHERE si.period_id = @period_id AND si.found = 1
      AND (ISNULL(si.actual_location, a.location_text) <> a.location_text OR ISNULL(si.actual_condition, a.asset_condition) <> a.asset_condition);

    UPDATE a SET location_text = ISNULL(si.actual_location, a.location_text),
                 asset_condition = ISNULL(si.actual_condition, a.asset_condition),
                 updated_at = SYSUTCDATETIME()
    FROM dbo.assets a JOIN dbo.stocktake_items si ON si.asset_id = a.asset_id
    WHERE si.period_id = @period_id AND si.found = 1
      AND (ISNULL(si.actual_location, a.location_text) <> a.location_text OR ISNULL(si.actual_condition, a.asset_condition) <> a.asset_condition);
    EXEC sp_set_session_context N'history_event', NULL;

    -- Aset tidak ditemukan TIDAK otomatis diubah menjadi HILANG: Sarpras membuat laporan kehilangan (FSD-2.17 AF-1)
    UPDATE dbo.stocktake_periods
    SET status = N'DITUTUP', closed_at = SYSUTCDATETIME(), end_date = CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE)
    WHERE period_id = @period_id;

    COMMIT;
    SET @result = N'SUCCESS';
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    EXEC sp_set_session_context N'history_event', NULL;
    THROW;
  END CATCH
END;
