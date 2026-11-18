-- sp_report_usage
-- TSD 5.1 | FSD-2.13 | POST /usage-reports
-- TODO: implementasi mengikuti "Logic / Pseudocode" di TSD 5.1.
-- Pola: lihat sp_approve_loan.sql (TRY/CATCH, UPDLOCK, @result OUTPUT).
CREATE OR ALTER PROCEDURE dbo.sp_report_usage
  @result NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET @result = N'NOT_IMPLEMENTED';
END;
