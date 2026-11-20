-- trg_asset_history
-- TSD 5.4 | FSD-2.8, BR-17 — riwayat lokasi/kondisi/status aset terbentuk otomatis
-- Dilewati bila SESSION_CONTEXT('history_event') sudah diisi SP (peminjaman/pengembalian) agar tidak ganda.
CREATE OR ALTER TRIGGER dbo.trg_asset_history
ON dbo.assets
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF SESSION_CONTEXT(N'history_event') IS NOT NULL RETURN;
  IF NOT (UPDATE(location_text) OR UPDATE(asset_condition) OR UPDATE(status)) RETURN;

  DECLARE @uid UNIQUEIDENTIFIER = TRY_CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER);
  DECLARE @actor NVARCHAR(150) = ISNULL((SELECT full_name FROM dbo.users WHERE user_id = @uid), N'Sistem');

  INSERT INTO dbo.asset_histories (asset_id, event_type, old_value, new_value, actor_user_id, actor_name)
  SELECT i.asset_id, N'PINDAH_LOKASI',
         (SELECT d.location_text AS lokasi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
         (SELECT i.location_text AS lokasi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), @uid, @actor
  FROM inserted i JOIN deleted d ON d.asset_id = i.asset_id
  WHERE i.location_text <> d.location_text;

  INSERT INTO dbo.asset_histories (asset_id, event_type, old_value, new_value, actor_user_id, actor_name)
  SELECT i.asset_id, N'UBAH_KONDISI',
         (SELECT d.asset_condition AS kondisi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
         (SELECT i.asset_condition AS kondisi FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), @uid, @actor
  FROM inserted i JOIN deleted d ON d.asset_id = i.asset_id
  WHERE i.asset_condition <> d.asset_condition;

  INSERT INTO dbo.asset_histories (asset_id, event_type, old_value, new_value, actor_user_id, actor_name)
  SELECT i.asset_id, N'UBAH_STATUS',
         (SELECT d.status AS status FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
         (SELECT i.status AS status FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), @uid, @actor
  FROM inserted i JOIN deleted d ON d.asset_id = i.asset_id
  WHERE i.status <> d.status;
END;
