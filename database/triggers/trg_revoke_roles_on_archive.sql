-- trg_revoke_roles_on_archive
-- TSD 5.4 | FSD-2.25 AF-1, 2.26 BR-116
-- Saat periode berubah AKTIF → ARSIP: cabut role divisi pengurus periode itu, isi end_date jabatan,
-- lalu nonaktifkan akun yang tidak punya role aktif lagi (riwayat & data tetap tersimpan).
CREATE OR ALTER TRIGGER dbo.trg_revoke_roles_on_archive
ON dbo.periods
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT UPDATE(status) RETURN;

  DECLARE @archived TABLE (period_id INT PRIMARY KEY, end_date DATE);
  INSERT INTO @archived (period_id, end_date)
  SELECT i.period_id, i.end_date FROM inserted i JOIN deleted d ON d.period_id = i.period_id
  WHERE d.status = N'AKTIF' AND i.status = N'ARSIP';
  IF NOT EXISTS (SELECT 1 FROM @archived) RETURN;

  DECLARE @today DATE = CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE);
  DECLARE @affected TABLE (user_id UNIQUEIDENTIFIER PRIMARY KEY);

  INSERT INTO @affected (user_id)
  SELECT DISTINCT ur.user_id
  FROM dbo.user_roles ur
  JOIN dbo.officers o   ON o.officer_id = ur.officer_id
  JOIN dbo.positions ps ON ps.position_id = o.position_id
  JOIN dbo.divisions dv ON dv.division_id = ps.division_id
  JOIN @archived a      ON a.period_id = dv.period_id
  WHERE ur.revoked_at IS NULL;

  UPDATE ur SET revoked_at = SYSUTCDATETIME()
  FROM dbo.user_roles ur
  JOIN dbo.officers o   ON o.officer_id = ur.officer_id
  JOIN dbo.positions ps ON ps.position_id = o.position_id
  JOIN dbo.divisions dv ON dv.division_id = ps.division_id
  JOIN @archived a      ON a.period_id = dv.period_id
  WHERE ur.revoked_at IS NULL;

  UPDATE o SET end_date = CASE WHEN a.end_date < @today THEN a.end_date ELSE @today END
  FROM dbo.officers o
  JOIN dbo.positions ps ON ps.position_id = o.position_id
  JOIN dbo.divisions dv ON dv.division_id = ps.division_id
  JOIN @archived a      ON a.period_id = dv.period_id
  WHERE o.end_date IS NULL;

  -- Akun tanpa role aktif dinonaktifkan; token_version dinaikkan agar sesi lama berakhir
  UPDATE u SET is_active = 0, token_version = token_version + 1, updated_at = SYSUTCDATETIME()
  FROM dbo.users u JOIN @affected x ON x.user_id = u.user_id
  WHERE NOT EXISTS (SELECT 1 FROM dbo.user_roles ur WHERE ur.user_id = u.user_id AND ur.revoked_at IS NULL);
END;
