import { describe, expect, it } from 'vitest';
import { TRACKING_REGEX, formatTrackingCode } from '../src/lib/trackingCode.js';
import { waLink } from '../src/lib/waLink.js';

// Unit test tanpa database. Test API (supertest) butuh DB dev aktif — lihat contoh di bawah.
describe('lib', () => {
  it('format kode lacak PJM-DDMMYY-NNN', () => {
    const code = formatTrackingCode('LOAN', 4, new Date(2026, 10, 20));
    expect(code).toBe('PJM-201126-004');
    expect(TRACKING_REGEX.test(code)).toBe(true);
  });
  it('tautan wa.me menormalkan 08xx → 628xx', () => {
    expect(waLink('0812-3456', 'Halo')).toBe('https://wa.me/628123456?text=Halo');
  });
});

/*
import request from 'supertest';
import { app } from '../src/app.js';
it('GET /health', async () => {
  const res = await request(app).get('/api/v1/health');
  expect(res.status).toBe(200);
});
*/
