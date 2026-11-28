-- FSD-2.24
-- BR-60
-- Tanggal sakramen tidak boleh di masa depan.

CREATE OR ALTER TRIGGER dbo.trg_validate_sacrament_date
ON dbo.sacraments
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (
    SELECT 1
    FROM inserted
    WHERE sacrament_date >
      CAST(SYSUTCDATETIME() AS DATE)
  )
  BEGIN
    THROW 50004,
      N'ERR-VAL-04: Tanggal sakramen tidak boleh di masa depan',
      1;
  END;
END;
GO