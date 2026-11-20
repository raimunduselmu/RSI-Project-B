-- v_calendar_events
-- TSD 5.3 | GET /calendar — agenda yang memblokir ruangan/aset
-- Saat ini: peminjaman DISETUJUI/DIAMBIL. TODO (BACKLOG): UNION usage_reports, liturgy_schedules, events.
CREATE OR ALTER VIEW dbo.v_calendar_events
AS
SELECT
  N'PEMINJAMAN' AS source_type,
  CAST(lr.loan_id AS NVARCHAR(50)) AS ref_id,
  lr.loan_code AS ref_code,
  lr.purpose AS title,
  lr.room_id,
  r.room_name,
  lr.start_at,
  lr.end_at,
  lr.status
FROM dbo.loan_requests lr
LEFT JOIN dbo.rooms r ON r.room_id = lr.room_id
WHERE lr.status IN (N'DISETUJUI', N'DIAMBIL');
