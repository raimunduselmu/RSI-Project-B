// Unit test gelombang 4 — inventaris lanjutan (tanpa database). Jalankan: npm test
import { describe, expect, it } from 'vitest';
import { buildLabelsPdf, buildTablePdf, pdfSafe } from '../src/lib/pdf.js';
import { labelSchema, uploadDocumentSchema } from '../src/modules/assets/assets.schema.js';
import { createIncidentSchema, isFutureDate, updateIncidentSchema } from '../src/modules/incidents/incidents.schema.js';
import { createLogSchema, createScheduleSchema, updateScheduleSchema } from '../src/modules/maintenance/maintenance.schema.js';
import { exportQuery, inventoryReportQuery } from '../src/modules/reports/reports.schema.js';
import { checkItemSchema, openStocktakeSchema } from '../src/modules/stocktakes/stocktakes.schema.js';
import { createUsageSchema, finishUsageSchema } from '../src/modules/usage-reports/usage-reports.schema.js';

const A = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';
const hour = 3600_000;
const iso = (ms: number) => new Date(Date.now() + ms).toISOString();

describe('Pemakaian internal (FSD-2.13)', () => {
  const base = { reporter_name: 'Yohanes', reporter_phone: '0812-3456-7890', division: 'Liturgi', activity_name: 'Latihan koor', room_id: 1 };
  it('menerima ruangan atau aset; telepon dinormalkan', () => {
    const r = createUsageSchema.parse({ ...base, start_at: iso(0), planned_end_at: iso(2 * hour) });
    expect(r.reporter_phone).toBe('081234567890');
    expect(createUsageSchema.safeParse({ ...base, room_id: null, asset_ids: [A], start_at: iso(0), planned_end_at: iso(hour) }).success).toBe(true);
  });
  it('wajib ruangan/aset, telepon valid (ERR-VAL-03), waktu benar (ERR-VAL-04)', () => {
    expect(createUsageSchema.safeParse({ ...base, room_id: null, start_at: iso(0), planned_end_at: iso(hour) }).success).toBe(false);
    expect(createUsageSchema.safeParse({ ...base, reporter_phone: '12345', start_at: iso(0), planned_end_at: iso(hour) }).success).toBe(false);
    expect(createUsageSchema.safeParse({ ...base, start_at: iso(2 * hour), planned_end_at: iso(hour) }).success).toBe(false);
    expect(createUsageSchema.safeParse({ ...base, start_at: iso(-3 * hour), planned_end_at: iso(-hour) }).success).toBe(false);
  });
  it('selesai: kondisi per aset, default kosong', () => {
    expect(finishUsageSchema.parse({}).items).toEqual([]);
    expect(finishUsageSchema.safeParse({ items: [{ asset_id: A, condition_after: 'HANCUR' }] }).success).toBe(false);
  });
});

describe('Pemeliharaan (FSD-2.14)', () => {
  it('interval boleh kosong (AF-1) tetapi bila diisi harus > 0 (EF-1)', () => {
    expect(createScheduleSchema.safeParse({ asset_id: 'ELEC-120326', task_name: 'Servis AC', next_due_date: '2026-12-01' }).success).toBe(true);
    expect(createScheduleSchema.safeParse({ asset_id: 'ELEC-120326', task_name: 'Servis AC', interval_days: '0', next_due_date: '2026-12-01' }).success).toBe(false);
    expect(createScheduleSchema.parse({ asset_id: 'ELEC-120326', task_name: 'Servis AC', interval_days: '', next_due_date: '2026-12-01' }).interval_days).toBeUndefined();
  });
  it('catat pelaksanaan wajib tanggal, pelaksana, hasil (BR-33); tanggal tidak di masa depan', () => {
    expect(createLogSchema.safeParse({ performed_date: '2026-01-10', performed_by: 'Budi', result_condition: 'BAIK' }).success).toBe(true);
    expect(createLogSchema.safeParse({ performed_date: '2026-01-10', performed_by: 'Budi' }).success).toBe(false);
    expect(createLogSchema.safeParse({ performed_date: '2999-01-01', performed_by: 'Budi', result_condition: 'BAIK' }).success).toBe(false);
  });
  it('nonaktifkan jadwal (AF-2)', () => {
    expect(updateScheduleSchema.safeParse({ is_active: false }).success).toBe(true);
    expect(updateScheduleSchema.safeParse({}).success).toBe(false);
  });
});

describe('Kehilangan & kerusakan (FSD-2.15)', () => {
  it('jenis HILANG/RUSAK, deskripsi wajib', () => {
    expect(createIncidentSchema.safeParse({ asset_id: 'ELEC-120326', incident_type: 'RUSAK', occurred_date: '2026-11-01', description: 'Layar retak' }).success).toBe(true);
    expect(createIncidentSchema.safeParse({ asset_id: 'ELEC-120326', incident_type: 'DICURI', occurred_date: '2026-11-01', description: 'Layar retak' }).success).toBe(false);
    expect(createIncidentSchema.safeParse({ asset_id: 'ELEC-120326', incident_type: 'RUSAK', occurred_date: '2026-11-01', description: '' }).success).toBe(false);
  });
  it('tanggal kejadian di masa depan ditolak (EF-2)', () => {
    expect(isFutureDate('2999-01-01')).toBe(true);
    expect(isFutureDate('2020-01-01')).toBe(false);
  });
  it('SELESAI wajib tindak lanjut; status aset hanya diubah saat SELESAI', () => {
    expect(updateIncidentSchema.safeParse({ status: 'SELESAI' }).success).toBe(false);
    expect(updateIncidentSchema.safeParse({ status: 'SELESAI', follow_up: 'Ditemukan di gudang', asset_status_after: 'TERSEDIA' }).success).toBe(true);
    expect(updateIncidentSchema.safeParse({ status: 'DIPROSES', asset_status_after: 'TERSEDIA' }).success).toBe(false);
  });
});

describe('Dokumen aset & label (FSD-2.16, FSD-2.6)', () => {
  it('jenis dokumen terbatas, judul wajib', () => {
    expect(uploadDocumentSchema.safeParse({ doc_type: 'NOTA', doc_title: 'Nota pembelian' }).success).toBe(true);
    expect(uploadDocumentSchema.safeParse({ doc_type: 'KTP', doc_title: 'Nota pembelian' }).success).toBe(false);
  });
  it('label: minimal satu aset (EF-1), ukuran default sedang', () => {
    expect(labelSchema.safeParse({ asset_ids: [] }).success).toBe(false);
    expect(labelSchema.parse({ asset_ids: ['ELEC-120326'] }).label_size).toBe('sedang');
  });
  it('PDF label & tabel benar-benar terbentuk', async () => {
    const labels = Array.from({ length: 30 }, (_, i) => ({ code: `ELEC-1203${i}`, name: `Kursi “lipat” ${i} — biru`, category: 'Perabot' }));
    for (const size of ['kecil', 'sedang'] as const) {
      const pdf = await buildLabelsPdf(labels, size);
      expect(Buffer.from(pdf).subarray(0, 5).toString()).toBe('%PDF-');
    }
    const t = await buildTablePdf({ title: 'Uji', columns: [{ header: 'A', key: 'a' }], rows: [{ a: 'x' }] });
    expect(t.length).toBeGreaterThan(500);
  });
  it('teks di luar WinAnsi diganti agar PDF tidak gagal', () => {
    expect(pdfSafe('“Halo” — ✓')).toBe('"Halo" - ?');
  });
});

describe('Pemeriksaan fisik (FSD-2.17)', () => {
  it('aset tidak ditemukan wajib diberi catatan', () => {
    expect(checkItemSchema.safeParse({ found: false }).success).toBe(false);
    expect(checkItemSchema.safeParse({ found: false, note: 'Tidak ada di gudang' }).success).toBe(true);
    expect(checkItemSchema.safeParse({ found: true, actual_condition: 'RUSAK_RINGAN' }).success).toBe(true);
  });
  it('nama periode wajib', () => {
    expect(openStocktakeSchema.safeParse({ period_name: '' }).success).toBe(false);
    expect(openStocktakeSchema.safeParse({ period_name: 'Inventarisasi 2026/2027' }).success).toBe(true);
  });
});

describe('Laporan inventaris (FSD-2.19)', () => {
  it('jenis laporan & format ekspor', () => {
    expect(inventoryReportQuery.parse({}).report_type).toBe('INVENTARIS');
    expect(exportQuery.parse({ report_type: 'INSIDEN' }).format).toBe('XLSX');
    expect(exportQuery.safeParse({ format: 'DOCX' }).success).toBe(false);
    expect(inventoryReportQuery.safeParse({ date_from: '01-11-2026' }).success).toBe(false);
  });
});
