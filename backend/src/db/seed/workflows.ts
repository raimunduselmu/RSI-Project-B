// Workflow persetujuan 1 tahap, read-only di UI (FSD-2.39, AC-16).
// TODO: aktifkan setelah tabel workflows & workflow_steps dibuat di schema/workflow.ts
export const WORKFLOWS = [
  { code: 'PEMINJAMAN', name: 'Persetujuan Peminjaman', approverRole: 'Sarpras' },
  { code: 'OVER_BUDGET', name: 'Pengeluaran Melebihi Anggaran', approverRole: 'PHT' },
  { code: 'IURAN_KAS', name: 'Verifikasi Iuran Kas', approverRole: 'Bendahara' }, // milik Bendahara → PHT
  { code: 'SERAH_TERIMA', name: 'Serah Terima / LPJ', approverRole: 'PHT' },
];

export async function seedWorkflows() {
  console.log('• workflows dilewati (TODO setelah tabel dibuat)');
}
