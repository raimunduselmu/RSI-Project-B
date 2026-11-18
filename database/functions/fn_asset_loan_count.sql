-- fn_asset_loan_count
-- TSD 5.2
CREATE OR ALTER FUNCTION dbo.fn_asset_loan_count (@asset_id UNIQUEIDENTIFIER)
RETURNS INT
AS
BEGIN
  -- TODO: tambah COUNT usage_report_items setelah tabel dibuat
  RETURN (
    SELECT COUNT(*) FROM dbo.loan_items li
    JOIN dbo.loan_requests lr ON lr.loan_id = li.loan_id
    WHERE li.asset_id = @asset_id AND lr.status IN (N'DIAMBIL', N'SELESAI')
  );
END;
