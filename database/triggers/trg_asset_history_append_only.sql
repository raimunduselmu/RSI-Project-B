-- trg_asset_history_append_only
-- TSD 5.4 | asset_histories append-only (AC-09)
CREATE OR ALTER TRIGGER dbo.trg_asset_history_append_only
ON dbo.asset_histories
INSTEAD OF UPDATE, DELETE
AS
BEGIN
  THROW 50001, N'Tabel asset_histories bersifat append-only', 1;
END;
