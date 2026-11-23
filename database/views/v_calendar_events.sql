-- v_calendar_events
-- TSD 5.3 | GET /calendar — agenda yang memblokir ruangan/aset
-- Sumber: peminjaman DISETUJUI/DIAMBIL + pemakaian internal BERLANGSUNG.
-- TODO (BACKLOG): UNION liturgy_schedules, events.
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
WHERE lr.status IN (N'DISETUJUI', N'DIAMBIL')
UNION ALL
SELECT
  N'PEMAKAIAN_INTERNAL',
  CAST(ur.report_id AS NVARCHAR(50)),
  N'INT-' + LEFT(CONVERT(NVARCHAR(36), ur.report_id), 8),
  ur.activity_name + N' (' + ur.division + N')',
  ur.room_id,
  r.room_name,
  ur.start_at,
  ur.planned_end_at,
  ur.status
FROM dbo.usage_reports ur
LEFT JOIN dbo.rooms r ON r.room_id = ur.room_id
WHERE ur.status = N'BERLANGSUNG';
