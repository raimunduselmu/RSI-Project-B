-- trg_incident_after_insert
-- TSD 5.4 | FSD-2.15, BR-34 — status aset mengikuti laporan insiden:
--   HILANG → aset HILANG (keluar dari katalog publik), RUSAK → aset PEMELIHARAAN.
-- Riwayat INSIDEN dicatat di sini; trg_asset_history dilewati agar tidak ganda.
-- Notifikasi ke Sarpras dikirim aplikasi (lib/notify.ts) setelah commit, karena perlu email.
CREATE OR ALTER TRIGGER dbo.trg_incident_after_insert
ON dbo.incidents
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS (SELECT 1 FROM inserted) RETURN;

  DECLARE @prev SQL_VARIANT = SESSION_CONTEXT(N'history_event');
  DECLARE @uid UNIQUEIDENTIFIER = TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER);
  DECLARE @actor NVARCHAR(150) = ISNULL((SELECT full_name FROM dbo.users WHERE user_id = @uid), N'Sistem');

  EXEC sp_set_session_context N'history_event', N'INSIDEN';

  INSERT INTO dbo.asset_histories (asset_id, event_type, old_value, new_value, note, actor_user_id, actor_name)
  SELECT a.asset_id, N'INSIDEN',
         (SELECT a.status AS status FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
         (SELECT CASE i.incident_type WHEN N'HILANG' THEN N'HILANG' ELSE N'PEMELIHARAAN' END AS status,
                 i.incident_type AS jenis FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
         LEFT(i.incident_type + N': ' + i.description, 4000), @uid, @actor
  FROM inserted i JOIN dbo.assets a ON a.asset_id = i.asset_id;

  UPDATE a SET status = CASE i.incident_type WHEN N'HILANG' THEN N'HILANG' ELSE N'PEMELIHARAAN' END,
               updated_at = SYSUTCDATETIME()
  FROM dbo.assets a JOIN inserted i ON i.asset_id = a.asset_id;

  EXEC sp_set_session_context N'history_event', @prev;
END;
