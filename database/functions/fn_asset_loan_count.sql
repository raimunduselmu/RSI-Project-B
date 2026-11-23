-- fn_asset_loan_count
-- TSD 5.2 | BR-43 — frekuensi pemanfaatan = peminjaman DIAMBIL/SELESAI + pemakaian internal SELESAI
CREATE OR ALTER FUNCTION dbo.fn_asset_loan_count (@asset_id UNIQUEIDENTIFIER)
RETURNS INT
AS
BEGIN
  RETURN (
    SELECT COUNT(*) FROM dbo.loan_items li
    JOIN dbo.loan_requests lr ON lr.loan_id = li.loan_id
    WHERE li.asset_id = @asset_id AND lr.status IN (N'DIAMBIL', N'SELESAI')
  ) + (
    SELECT COUNT(*) FROM dbo.usage_report_items ui
    JOIN dbo.usage_reports ur ON ur.report_id = ui.report_id
    WHERE ui.asset_id = @asset_id AND ur.status = N'SELESAI'
  );
END;
