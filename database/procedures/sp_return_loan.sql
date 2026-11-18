-- sp_return_loan
-- TSD 5.1 | FSD-2.12 | POST /loans/{id}/return
-- TODO: implementasi mengikuti "Logic / Pseudocode" di TSD 5.1.
-- Pola: lihat sp_approve_loan.sql (TRY/CATCH, UPDLOCK, @result OUTPUT).
CREATE OR ALTER PROCEDURE dbo.sp_return_loan
  @result NVARCHAR(30) OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  SET @result = N'NOT_IMPLEMENTED';
END;
