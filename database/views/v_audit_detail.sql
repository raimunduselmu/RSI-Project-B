-- v_audit_detail
-- TSD 5.3 | GET /admin/audit-logs
CREATE OR ALTER VIEW dbo.v_audit_detail
AS
SELECT a.log_id, a.created_at, u.username, u.full_name,
       roles.role_names, a.action_type, a.resource_type, a.resource_id,
       a.old_values, a.new_values, a.ip_address
FROM dbo.audit_logs a
LEFT JOIN dbo.users u ON u.user_id = a.user_id
OUTER APPLY (
  SELECT STRING_AGG(r.role_name, N', ') AS role_names
  FROM dbo.user_roles ur JOIN dbo.roles r ON r.role_id = ur.role_id
  WHERE ur.user_id = a.user_id AND ur.revoked_at IS NULL
) roles;
