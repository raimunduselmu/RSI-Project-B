import { pool, poolReady } from '../client.js';
import { seedRoles } from './roles.js';
import { seedAdmin } from './admin.js';
import { seedSettings } from './settings.js';
import { seedWorkflows } from './workflows.js';

await poolReady;
await seedRoles();
await seedAdmin();
await seedSettings();
await seedWorkflows();
console.log('Seeder selesai');
await pool.close();
process.exit(0);
