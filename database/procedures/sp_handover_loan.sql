-- sp_handover_loan
-- TSD 5.1 | FSD-2.12 | POST /loans/{id}/pickup — catat pengambilan & kondisi keluar
-- Hasil: SUCCESS | NOT_APPROVED | NOT_FOUND
CREATE OR ALTER PROCEDURE dbo.sp_handover_loan
  @loan_id  UNIQUEIDENTIFIER,
  @actor_id UNIQUEIDENTIFIER,
  @items    NVARCHAR(MAX) = NULL,      -- JSON [{"asset_id":"...","condition_out":"BAIK"}]; aset yang tidak disebut dianggap BAIK
  @note     NVARCHAR(MAX) = NULL,
  @result   NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON; SET XACT_ABORT ON;
  BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @status NVARCHAR(20), @code NVARCHAR(30);
    SELECT @status = status, @code = loan_code FROM dbo.loan_requests WITH (UPDLOCK, ROWLOCK) WHERE loan_id = @loan_id;
    IF @status IS NULL BEGIN SET @result = N'NOT_FOUND'; ROLLBACK; RETURN; END;
    IF @status <> N'DISETUJUI' BEGIN SET @result = N'NOT_APPROVED'; ROLLBACK; RETURN; END;   -- ERR-LOAN-03

    DECLARE @actor_name NVARCHAR(150) = ISNULL((SELECT full_name FROM dbo.users WHERE user_id = @actor_id), N'Sistem');

    UPDATE li SET condition_out = ISNULL(j.condition_out, N'BAIK')
    FROM dbo.loan_items li
    LEFT JOIN OPENJSON(ISNULL(@items, N'[]')) WITH (asset_id UNIQUEIDENTIFIER '$.asset_id', condition_out NVARCHAR(20) '$.condition_out') j
      ON j.asset_id = li.asset_id
    WHERE li.loan_id = @loan_id;

    -- Riwayat dicatat di sini; trg_asset_history dilewati agar tidak ganda
    EXEC sp_set_session_context N'history_event', N'PEMINJAMAN';
    INSERT INTO dbo.asset_histories (asset_id, event_type, old_value, new_value, note, actor_user_id, actor_name)
    SELECT a.asset_id, N'PEMINJAMAN',
           (SELECT a.status AS status FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           (SELECT N'DIPINJAM' AS status, li.condition_out AS kondisi_keluar FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
           @code + ISNULL(N' · ' + @note, N''), @actor_id, @actor_name
    FROM dbo.loan_items li JOIN dbo.assets a ON a.asset_id = li.asset_id
    WHERE li.loan_id = @loan_id;

    UPDATE a SET status = N'DIPINJAM', updated_at = SYSUTCDATETIME()
    FROM dbo.assets a JOIN dbo.loan_items li ON li.asset_id = a.asset_id
    WHERE li.loan_id = @loan_id;
    EXEC sp_set_session_context N'history_event', NULL;

    UPDATE dbo.loan_requests SET status = N'DIAMBIL', handed_over_at = SYSUTCDATETIME() WHERE loan_id = @loan_id;
    COMMIT;
    SET @result = N'SUCCESS';
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    EXEC sp_set_session_context N'history_event', NULL;
    THROW;
  END CATCH
END;
