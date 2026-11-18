// Opsi B: entry Vercel Function. Semua route diteruskan ke Express app.
import { app } from '../src/app.js';
import { poolReady } from '../src/db/client.js';

await poolReady;
export default app;
