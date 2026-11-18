import { app } from './app.js';
import { env } from './config/env.js';
import { poolReady } from './db/client.js';
import { startScheduler } from './jobs/scheduler.js';

await poolReady;
console.log(`[db] terhubung ke ${env.DB_HOST}/${env.DB_NAME}`);

if (env.CRON_ENABLED) startScheduler();

app.listen(env.API_PORT, () => {
  console.log(`[api] http://localhost:${env.API_PORT}/api/v1  (docs: /api/docs)`);
});
