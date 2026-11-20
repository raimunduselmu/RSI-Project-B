// Workflow persetujuan 1 tahap, read-only di UI (FSD-2.39, AC-16)
import { pool } from '../client.js';

export const WORKFLOWS = [
  { module: 'PEMINJAMAN', name: 'Persetujuan Peminjaman', approverRole: 'Sarpras' },
  { module: 'OVER_BUDGET', name: 'Pengeluaran Melebihi Anggaran', approverRole: 'PHT' },
  { module: 'IURAN_KAS', name: 'Verifikasi Iuran Kas', approverRole: 'Bendahara' }, // milik Bendahara → PHT (BR-125, diatur di SP)
  { module: 'SERAH_TERIMA', name: 'Serah Terima / LPJ', approverRole: 'PHT' },
];

export async function seedWorkflows() {
  for (const w of WORKFLOWS) {
    await pool.request().input('name', w.name).input('module', w.module).input('role', w.approverRole).query(`
      IF NOT EXISTS (SELECT 1 FROM workflows WHERE module = @module)
      BEGIN
        DECLARE @id INT;
        INSERT INTO workflows (workflow_name, module) VALUES (@name, @module);
        SET @id = SCOPE_IDENTITY();
        INSERT INTO workflow_steps (workflow_id, step_order, approver_role) VALUES (@id, 1, @role);
      END`);
  }
  console.log('✓ workflows');
}
