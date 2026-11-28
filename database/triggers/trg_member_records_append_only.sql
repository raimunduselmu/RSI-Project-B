-- TSD Table 120
-- BR-59
-- member_records tidak boleh diubah atau dihapus.

CREATE OR ALTER TRIGGER dbo.trg_member_records_append_only
ON dbo.member_records
INSTEAD OF UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;

  THROW 50001,
    N'Tabel member_records bersifat append-only',
    1;
END;
GO