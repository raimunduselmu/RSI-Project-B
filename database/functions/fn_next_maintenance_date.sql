-- fn_next_maintenance_date
-- TSD 5.2 | BR-32
CREATE OR ALTER FUNCTION dbo.fn_next_maintenance_date (@performed_date DATE, @interval_days INT)
RETURNS DATE
AS
BEGIN
  RETURN DATEADD(DAY, @interval_days, @performed_date);
END;
