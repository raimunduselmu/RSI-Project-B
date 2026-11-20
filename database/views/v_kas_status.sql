-- v_kas_status
-- TSD 5.3 | status iuran per pengurus per bulan pada periode AKTIF (FSD-2.43, 2.44)
-- Dipakai: GET /kas/dues/me, GET /kas/recap, dashboard
CREATE OR ALTER VIEW dbo.v_kas_status
AS
SELECT d.due_id, d.user_id, u.full_name, d.period_id, p.period_name, d.due_month, d.amount, d.status,
       lp.payment_id, lp.payment_code, lp.method, lp.payment_status, lp.reject_reason, lp.verified_at
FROM dbo.kas_dues d
JOIN dbo.users u   ON u.user_id = d.user_id
JOIN dbo.periods p ON p.period_id = d.period_id
OUTER APPLY (
  SELECT TOP 1 kp.payment_id, kp.payment_code, kp.method, kp.status AS payment_status, kp.reject_reason, kp.verified_at
  FROM dbo.kas_payment_items i
  JOIN dbo.kas_payments kp ON kp.payment_id = i.payment_id
  WHERE i.due_id = d.due_id
  ORDER BY kp.created_at DESC
) lp
WHERE p.status = N'AKTIF';
