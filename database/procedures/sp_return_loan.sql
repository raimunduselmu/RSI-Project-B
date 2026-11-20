-- sp_return_loan
-- TSD 5.1 | FSD-2.12 | POST /loans/{id}/return — catat pengembalian & kondisi aset (BR-27, BR-28)
-- Hasil: SUCCESS | NOT_HANDED_OVER | NOT_FOUND ; @damaged_assets = JSON array kode aset yang rusak
CREATE OR ALTER PROCEDURE dbo.sp_return_loan
  @loan_id        UNIQUEIDENTIFIER,
  @actor_id       UNIQUEIDENTIFIER,
  @conditions     NVARCHAR(MAX) = NULL,  -- JSON [{"asset_id":"...","condition":"RUSAK_RINGAN"}]; tidak disebut = BAIK
  @return_note    NVARCHAR(MAX) = NULL,
  @result         NVARCHAR(30) OUTPUT,
  @damaged_assets NVARCHAR(MAX) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @status NVARCHAR(20), @code NVARCHAR(30);
    SELECT @status = status, @code = loan_code FROM dbo.loan_requests WITH (UPDLOCK, ROWLOCK) WHERE loan_id = @loan_id;
    IF @status IS NULL BEGIN SET @result = N'NOT_FOUND'; ROLLBACK; RETURN; END;
    IF @status <> N'DIAMBIL' BEGIN SET @result = N'NOT_HANDED_OVER'; ROLLBACK; RETURN; END;   -- ERR-LOAN-04

    DECLARE @actor_name NVARCHAR(150) = ISNULL((SELECT full_name FROM dbo.users WHERE user_id = @actor_id), N'Sistem');

    UPDATE li SET condition_in = ISNULL(j.condition, N'BAIK')
    FROM dbo.loan_items li
    LEFT JOIN OPENJSON(ISNULL(@conditions, N'[]')) WITH (asset_id UNIQUEIDENTIFIER '$.asset_id', condition NVARCHAR(20) '$.condition') j
      ON j.asset_id = li.asset_id
    WHERE li.loan_id = @loan_id;

    SET @damaged_assets = (
      SELECT a.asset_code AS [value] FROM dbo.loan_items li JOIN dbo.assets a ON a.asset_id = li.asset_id
      WHERE li.loan_id = @loan_id AND li.condition_in IN (N'RUSAK_RINGAN', N'RUSAK_BERAT') FOR JSON PATH);

    EXEC sp_set_session_context N'history_event', N'PENGEMBALIAN';
    INSERT INTO dbo.asset_histories (asset_id, event_type, old_value, new_value, note, actor_user_id, actor_name)
    SELECT a.asset_id, N'PENGEMBALIAN',
           (SELECT a.status AS status, a.asset_condition AS kondisi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT CASE WHEN li.condition_in = N'BAIK' THEN N'TERSEDIA' ELSE N'PEMELIHARAAN' END AS status, li.condition_in AS kondisi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           @code + ISNULL(N' · ' + @return_note, N''), @actor_id, @actor_name
    FROM dbo.loan_items li JOIN dbo.assets a ON a.asset_id = li.asset_id
    WHERE li.loan_id = @loan_id;

    -- Aset rusak → PEMELIHARAAN, selain itu → TERSEDIA (BR-28)
    UPDATE a SET asset_condition = li.condition_in,
                 status = CASE WHEN li.condition_in = N'BAIK' THEN N'TERSEDIA' ELSE N'PEMELIHARAAN' END,
                 updated_at = SYSUTCDATETIME()
    FROM dbo.assets a JOIN dbo.loan_items li ON li.asset_id = a.asset_id
    WHERE li.loan_id = @loan_id;
    EXEC sp_set_session_context N'history_event', NULL;

    UPDATE dbo.loan_requests SET status = N'SELESAI', returned_at = SYSUTCDATETIME(), return_note = @return_note WHERE loan_id = @loan_id;

    -- Notifikasi Sarpras bila ada aset rusak
    IF @damaged_assets IS NOT NULL
      INSERT INTO dbo.notifications (recipient_user_id, type, title, message, channel, related_id)
      SELECT DISTINCT ur.user_id, N'ASSET_DAMAGED', N'Aset kembali dalam kondisi rusak',
             @code + N' — perlu pemeliharaan', N'APLIKASI', CAST(@loan_id AS NVARCHAR(100))
      FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
      WHERE r.role_name = N'Sarpras' AND ur.revoked_at IS NULL;

    COMMIT;
    SET @result = N'SUCCESS';
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    EXEC sp_set_session_context N'history_event', NULL;
    THROW;
  END CATCH
END;
