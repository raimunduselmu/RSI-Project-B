-- TSD Table 120
-- BR-59
-- sacraments tidak boleh diubah atau dihapus.

CREATE OR ALTER TRIGGER dbo.trg_sacraments_append_only
ON dbo.sacraments
INSTEAD OF UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;

  THROW 50001,
    N'Tabel sacraments bersifat append-only',
    1;
END;
GO