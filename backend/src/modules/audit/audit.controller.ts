import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
// import { ok, created, paginated } from '../../lib/response.js';
// import * as service from './audit.service.js';

/** GET /audit-logs  —  Log audit (v_audit_detail) (FSD-2.22) */
export const getAuditLogs = asyncHandler(async (_req, _res) => {
  // TODO: validasi di audit.schema.ts, logika di audit.service.ts, balas dengan ok()/created()
  throw new AppError('ERR-SYS-02', 'Belum diimplementasikan (FSD-2.22)');
});
