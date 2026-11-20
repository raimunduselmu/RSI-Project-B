-- fn_check_availability
-- TSD 5.2 | dipakai sp_submit_loan, sp_approve_loan, GET /availability
-- Mengembalikan daftar jadwal yang BENTROK. Tidak ada baris = tersedia.
-- Bentrok bila mulai_A < selesai_B AND selesai_A > mulai_B (BR-19).
-- Sumber pemblokir saat ini: peminjaman DISETUJUI/DIAMBIL.
-- TODO (BACKLOG): tambah usage_reports BERLANGSUNG & liturgy_schedules TERBIT (BR-20) saat tabelnya dibuat.
CREATE OR ALTER FUNCTION dbo.fn_check_availability (
  @room_id INT,
  @asset_ids NVARCHAR(MAX),          -- JSON array UUID, boleh NULL / '[]'
  @start_at DATETIME2,
  @end_at DATETIME2,
  @exclude_loan_id UNIQUEIDENTIFIER = NULL
)
RETURNS TABLE
AS
RETURN
(
  SELECT N'PEMINJAMAN' AS source, lr.loan_code AS ref_code, lr.start_at, lr.end_at,
         CASE WHEN lr.room_id = @room_id THEN N'RUANGAN' ELSE N'ASET' END AS conflict_on
  FROM dbo.loan_requests lr
  WHERE lr.status IN (N'DISETUJUI', N'DIAMBIL')
    AND (@exclude_loan_id IS NULL OR lr.loan_id <> @exclude_loan_id)
    AND lr.start_at < @end_at AND lr.end_at > @start_at
    AND (
      (@room_id IS NOT NULL AND lr.room_id = @room_id)
      OR EXISTS (
        SELECT 1 FROM dbo.loan_items li
        JOIN OPENJSON(ISNULL(@asset_ids, N'[]')) j ON TRY_CAST(j.value AS UNIQUEIDENTIFIER) = li.asset_id
        WHERE li.loan_id = lr.loan_id)
    )
);
