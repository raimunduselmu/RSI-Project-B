-- fn_generate_asset_code
-- TSD 5.2 | BR-10
CREATE OR ALTER FUNCTION dbo.fn_generate_asset_code (@category_id INT, @date DATE)
RETURNS NVARCHAR(30)
AS
BEGIN
  DECLARE @prefix NVARCHAR(10) = (SELECT category_code FROM dbo.asset_categories WHERE category_id = @category_id);
  DECLARE @basis NVARCHAR(30) = @prefix + N'-' + FORMAT(@date, 'ddMMyy');
  DECLARE @n INT = (SELECT COUNT(*) FROM dbo.assets WHERE asset_code LIKE @basis + N'%');
  RETURN CASE WHEN @n = 0 THEN @basis
              ELSE @basis + N'-' + RIGHT(N'0' + CAST(@n + 1 AS NVARCHAR(3)), 2) END;
END;
