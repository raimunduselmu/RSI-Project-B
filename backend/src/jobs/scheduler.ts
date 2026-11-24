import cron from 'node-cron';
import { remindDueMaintenance } from '../modules/maintenance/maintenance.service.js';
import { retryFailedEmails } from './retryEmail.js';

/** Opsi A: node-cron di dalam proses backend. Opsi B: CRON_ENABLED=false, pakai cron-job.org. */
export function startScheduler() {
  cron.schedule('* * * * *', () => {
    retryFailedEmails().catch((e) => console.error('[cron] retry email', e));
  });
  // FSD-2.14: pengingat pemeliharaan setiap hari pukul 07.00 WIB
  cron.schedule(
    '0 7 * * *',
    () => {
      remindDueMaintenance()
        .then((n) => n && console.log(`[cron] pengingat pemeliharaan: ${n} jadwal`))
        .catch((e) => console.error('[cron] pengingat pemeliharaan', e));
    },
    { timezone: 'Asia/Jakarta' },
  );
  // TODO: pembentukan kas_dues tiap awal bulan
  console.log('[cron] penjadwal aktif');
}
