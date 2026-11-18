-- sp_record_donation
-- TSD 5.1 | FSD-2.42 | POST /donations
-- TODO: implementasi mengikuti "Logic / Pseudocode" di TSD 5.1.
-- Pola: lihat sp_approve_loan.sql (TRY/CATCH, UPDLOCK, @result OUTPUT).
CREATE OR ALTER PROCEDURE dbo.sp_record_donation
  @result NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET @result = N'NOT_IMPLEMENTED';
END;
