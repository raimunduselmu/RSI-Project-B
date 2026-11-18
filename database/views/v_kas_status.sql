-- v_kas_status
-- TSD 5.3 | halaman Iuran Kas
-- TODO: lengkapi join ke kas_payments terakhir
CREATE OR ALTER VIEW dbo.v_kas_status
AS
SELECT d.due_id, d.user_id, u.full_name, d.due_month, d.amount, d.status
FROM dbo.kas_dues d
JOIN dbo.users u ON u.user_id = d.user_id
JOIN dbo.periods p ON p.period_id = d.period_id
WHERE p.status = N'AKTIF';
