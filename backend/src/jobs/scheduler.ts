import cron from 'node-cron';
import { retryFailedEmails } from './retryEmail.js';

/** Opsi A: node-cron di dalam proses backend. Opsi B: CRON_ENABLED=false, pakai cron-job.org. */
export function startScheduler() {
  cron.schedule('* * * * *', () => {
    retryFailedEmails().catch((e) => console.error('[cron] retry email', e));
  });
  // TODO: pengingat pemeliharaan aset harian, pembentukan kas_dues tiap awal bulan
  console.log('[cron] penjadwal aktif');
}
