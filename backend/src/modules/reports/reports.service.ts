// FSD-2.19 Laporan Inventaris — ringkasan (v_inventory_summary + transaksi) dan ekspor PDF/XLSX (BR-44, BR-45)
import { AppError } from '../../lib/AppError.js';
import { writeAudit, ymd } from '../../lib/assetRef.js';
import { buildTablePdf, type PdfColumn } from '../../lib/pdf.js';
import { query } from '../../lib/sql.js';
import { todayWib } from '../../lib/time.js';
import { buildXlsx } from '../../lib/xlsx.js';
import type { AuthUser } from '../../types/express.js';
import type { ExportQuery, InventoryReportQuery } from './reports.schema.js';

interface Range {
  from: string;
  to: string;
  label: string;
}

/** Rentang tanggal (WIB): date_from/date_to → periode kepengurusan → periode AKTIF → tahun berjalan */
async function resolveRange(q: InventoryReportQuery): Promise<Range> {
  if (q.date_from || q.date_to) {
    const from = q.date_from ?? '2000-01-01';
    const to = q.date_to ?? todayWib();
    if (to < from) throw new AppError('ERR-VAL-04', 'Tanggal akhir harus setelah tanggal awal', { date_to: ['Tanggal akhir harus setelah tanggal awal'] });
    return { from, to, label: `${from} s.d. ${to}` };
  }
  const [p] = q.period_id
    ? await query<{ period_name: string; start_date: unknown; end_date: unknown }>(`SELECT period_name, start_date, end_date FROM periods WHERE period_id = @p`, { p: q.period_id })
    : await query<{ period_name: string; start_date: unknown; end_date: unknown }>(`SELECT TOP 1 period_name, start_date, end_date FROM periods WHERE status = N'AKTIF' ORDER BY start_date DESC`);
  if (!p && q.period_id) throw new AppError('ERR-DATA-01', 'Periode tidak ditemukan');
  if (!p) {
    const y = todayWib().slice(0, 4);
    return { from: `${y}-01-01`, to: `${y}-12-31`, label: `Tahun ${y}` };
  }
  return { from: ymd(p.start_date)!, to: ymd(p.end_date) ?? todayWib(), label: `Periode ${p.period_name}` };
}

type Row = Record<string, unknown>;
interface ReportResult {
  report_type: string;
  range: Range | null;
  category_id: number | null;
  summary: Row;
  by_category?: Row[];
  rows: Row[];
}

/* WIB: tanggal-waktu UTC di DB dibandingkan dengan batas hari WIB */
const DAY_FROM = `DATEADD(HOUR, -7, CAST(@from AS DATETIME2))`;
const DAY_TO = `DATEADD(HOUR, -7, DATEADD(DAY, 1, CAST(@to AS DATETIME2)))`;

export async function inventoryReport(q: InventoryReportQuery): Promise<ReportResult> {
  const cat = q.category_id ?? null;

  if (q.report_type === 'INVENTARIS') {
    const byCategory = await query(`SELECT * FROM v_inventory_summary WHERE (@c IS NULL OR category_id = @c) ORDER BY category_name`, { c: cat });
    const rows = await query<Row & { acquired_date: unknown }>(
      `SELECT a.asset_code, a.asset_name, c.category_name, a.location_text, a.asset_condition, a.status, a.source_type,
              a.donor_name, a.acquired_date, a.acquisition_value, dbo.fn_asset_loan_count(a.asset_id) AS frekuensi_pemanfaatan
       FROM assets a JOIN asset_categories c ON c.category_id = a.category_id
       WHERE a.is_deleted = 0 AND (@c IS NULL OR a.category_id = @c) ORDER BY c.category_name, a.asset_code`,
      { c: cat },
    );
    const sum = (k: string) => byCategory.reduce((s, r) => s + Number(r[k] ?? 0), 0);
    return {
      report_type: q.report_type,
      range: null, // inventaris = posisi saat ini
      category_id: cat,
      summary: {
        total_aset: sum('total'),
        kondisi: { baik: sum('kondisi_baik'), rusak_ringan: sum('kondisi_rusak_ringan'), rusak_berat: sum('kondisi_rusak_berat') },
        status: {
          tersedia: sum('status_tersedia'), dipinjam: sum('status_dipinjam'), digunakan: sum('status_digunakan'),
          pemeliharaan: sum('status_pemeliharaan'), hilang: sum('status_hilang'), nonaktif: sum('status_nonaktif'),
        },
        sumber_donasi_hibah: sum('sumber_donasi_hibah'),
        total_nilai_perolehan: sum('total_nilai_perolehan'),
      },
      by_category: byCategory,
      rows: rows.map((r) => ({ ...r, acquired_date: ymd(r.acquired_date) })),
    };
  }

  const range = await resolveRange(q);
  const p = { from: range.from, to: range.to, c: cat };

  if (q.report_type === 'PEMINJAMAN') {
    const catFilter = `(@c IS NULL OR EXISTS (SELECT 1 FROM loan_items li JOIN assets a ON a.asset_id = li.asset_id WHERE li.loan_id = lr.loan_id AND a.category_id = @c))`;
    const rows = await query(
      `SELECT lr.loan_code, lr.request_type, lr.borrower_name, lr.borrower_org, lr.purpose,
              COALESCE(r.room_name, (SELECT STRING_AGG(a.asset_code, N', ') FROM loan_items li JOIN assets a ON a.asset_id = li.asset_id WHERE li.loan_id = lr.loan_id)) AS objek,
              lr.start_at, lr.end_at, lr.status
       FROM loan_requests lr LEFT JOIN rooms r ON r.room_id = lr.room_id
       WHERE lr.start_at >= ${DAY_FROM} AND lr.start_at < ${DAY_TO} AND ${catFilter}
       ORDER BY lr.start_at`,
      p,
    );
    const [usage] = await query<{ total: number; selesai: number }>(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN ur.status = N'SELESAI' THEN 1 ELSE 0 END) AS selesai
       FROM usage_reports ur WHERE ur.start_at >= ${DAY_FROM} AND ur.start_at < ${DAY_TO}
         AND (@c IS NULL OR EXISTS (SELECT 1 FROM usage_report_items ui JOIN assets a ON a.asset_id = ui.asset_id WHERE ui.report_id = ur.report_id AND a.category_id = @c))`,
      p,
    );
    const byStatus: Record<string, number> = {};
    for (const r of rows) byStatus[String(r.status)] = (byStatus[String(r.status)] ?? 0) + 1;
    return {
      report_type: q.report_type, range, category_id: cat,
      summary: { total_pengajuan: rows.length, per_status: byStatus, pemakaian_internal: { total: usage.total, selesai: usage.selesai ?? 0 } },
      rows,
    };
  }

  if (q.report_type === 'PEMELIHARAAN') {
    const rows = await query<Row & { performed_date: unknown }>(
      `SELECT l.performed_date, a.asset_code, a.asset_name, c.category_name, s.task_name, l.performed_by, l.result_condition, l.notes
       FROM maintenance_logs l JOIN maintenance_schedules s ON s.schedule_id = l.schedule_id
       JOIN assets a ON a.asset_id = l.asset_id JOIN asset_categories c ON c.category_id = a.category_id
       WHERE l.performed_date BETWEEN @from AND @to AND (@c IS NULL OR a.category_id = @c)
       ORDER BY l.performed_date`,
      p,
    );
    const [due] = await query<{ terlambat: number; aktif: number }>(
      `SELECT SUM(CASE WHEN s.next_due_date < @today THEN 1 ELSE 0 END) AS terlambat, COUNT(*) AS aktif
       FROM maintenance_schedules s JOIN assets a ON a.asset_id = s.asset_id
       WHERE s.is_active = 1 AND a.is_deleted = 0 AND (@c IS NULL OR a.category_id = @c)`,
      { ...p, today: todayWib() },
    );
    const byResult: Record<string, number> = {};
    for (const r of rows) byResult[String(r.result_condition)] = (byResult[String(r.result_condition)] ?? 0) + 1;
    return {
      report_type: q.report_type, range, category_id: cat,
      summary: { total_pelaksanaan: rows.length, per_hasil: byResult, jadwal_aktif: due.aktif, jadwal_terlambat: due.terlambat ?? 0 },
      rows: rows.map((r) => ({ ...r, performed_date: ymd(r.performed_date) })),
    };
  }

  // INSIDEN
  const rows = await query<Row & { occurred_date: unknown }>(
    `SELECT i.occurred_date, a.asset_code, a.asset_name, c.category_name, i.incident_type, i.status, i.responsible_name,
            i.description, i.follow_up, i.resolved_at
     FROM incidents i JOIN assets a ON a.asset_id = i.asset_id JOIN asset_categories c ON c.category_id = a.category_id
     WHERE i.occurred_date BETWEEN @from AND @to AND (@c IS NULL OR a.category_id = @c)
     ORDER BY i.occurred_date`,
    p,
  );
  const count = (k: string, v: string) => rows.filter((r) => r[k] === v).length;
  return {
    report_type: q.report_type, range, category_id: cat,
    summary: {
      total_laporan: rows.length,
      hilang: count('incident_type', 'HILANG'), rusak: count('incident_type', 'RUSAK'),
      dilaporkan: count('status', 'DILAPORKAN'), diproses: count('status', 'DIPROSES'), selesai: count('status', 'SELESAI'),
    },
    rows: rows.map((r) => ({ ...r, occurred_date: ymd(r.occurred_date) })),
  };
}

/* ---------------- Ekspor ---------------- */
const COLUMNS: Record<string, (PdfColumn & { xw?: number })[]> = {
  INVENTARIS: [
    { header: 'Kode', key: 'asset_code', width: 1.2 }, { header: 'Nama Aset', key: 'asset_name', width: 2.2 },
    { header: 'Kategori', key: 'category_name', width: 1.3 }, { header: 'Lokasi', key: 'location_text', width: 1.3 },
    { header: 'Kondisi', key: 'asset_condition', width: 1 }, { header: 'Status', key: 'status', width: 1 },
    { header: 'Sumber', key: 'source_type', width: 0.8 }, { header: 'Tgl Perolehan', key: 'acquired_date', width: 1 },
    { header: 'Nilai (Rp)', key: 'acquisition_value', width: 1, align: 'right' }, { header: 'Dipakai (x)', key: 'frekuensi_pemanfaatan', width: 0.8, align: 'right' },
  ],
  PEMINJAMAN: [
    { header: 'Kode', key: 'loan_code', width: 1.2 }, { header: 'Jenis', key: 'request_type', width: 0.8 },
    { header: 'Peminjam', key: 'borrower_name', width: 1.4 }, { header: 'Organisasi', key: 'borrower_org', width: 1.2 },
    { header: 'Ruangan/Aset', key: 'objek', width: 1.8 }, { header: 'Mulai (UTC)', key: 'start_at', width: 1.2 },
    { header: 'Selesai (UTC)', key: 'end_at', width: 1.2 }, { header: 'Status', key: 'status', width: 1 },
  ],
  PEMELIHARAAN: [
    { header: 'Tanggal', key: 'performed_date', width: 1 }, { header: 'Kode', key: 'asset_code', width: 1.1 },
    { header: 'Nama Aset', key: 'asset_name', width: 1.8 }, { header: 'Tugas', key: 'task_name', width: 1.6 },
    { header: 'Pelaksana', key: 'performed_by', width: 1.2 }, { header: 'Hasil', key: 'result_condition', width: 1 },
    { header: 'Catatan', key: 'notes', width: 2 },
  ],
  INSIDEN: [
    { header: 'Tanggal', key: 'occurred_date', width: 1 }, { header: 'Kode', key: 'asset_code', width: 1.1 },
    { header: 'Nama Aset', key: 'asset_name', width: 1.6 }, { header: 'Jenis', key: 'incident_type', width: 0.8 },
    { header: 'Status', key: 'status', width: 1 }, { header: 'Penanggung Jawab', key: 'responsible_name', width: 1.3 },
    { header: 'Deskripsi', key: 'description', width: 2 }, { header: 'Tindak Lanjut', key: 'follow_up', width: 2 },
  ],
};

const TITLES: Record<string, string> = {
  INVENTARIS: 'Laporan Inventaris Aset',
  PEMINJAMAN: 'Laporan Peminjaman',
  PEMELIHARAAN: 'Laporan Pemeliharaan Aset',
  INSIDEN: 'Laporan Kehilangan & Kerusakan',
};

/** Ringkasan bertingkat → baris "Butir / Nilai" untuk sheet Ringkasan */
function flatten(obj: Row, prefix = ''): { butir: string; nilai: unknown }[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !(v instanceof Date) ? flatten(v as Row, `${prefix}${k}.`) : [{ butir: `${prefix}${k}`, nilai: v }],
  );
}

export async function exportReport(q: ExportQuery, user: AuthUser, ip?: string) {
  const r = await inventoryReport(q);
  const title = TITLES[q.report_type];
  const cols = COLUMNS[q.report_type];
  const sub = [r.range ? r.range.label : `Posisi per ${todayWib()}`, q.category_id ? `Kategori #${q.category_id}` : 'Semua kategori', `${r.rows.length} baris`].join(' · ');
  const stamp = todayWib().replace(/-/g, '');
  let file: Buffer;
  try {
    if (q.format === 'PDF') {
      file = Buffer.from(await buildTablePdf({ title, subtitle: sub, columns: cols, rows: r.rows, footnote: 'KMK UNS' }));
    } else {
      file = await buildXlsx(
        [
          { name: 'Ringkasan', columns: [{ header: 'Butir', key: 'butir', width: 36 }, { header: 'Nilai', key: 'nilai', width: 20 }], rows: [{ butir: 'Laporan', nilai: title }, { butir: 'Cakupan', nilai: sub }, ...flatten(r.summary)] },
          ...(r.by_category ? [{ name: 'Per Kategori', columns: Object.keys(r.by_category[0] ?? { category_name: '' }).map((k) => ({ header: k, key: k, width: 16 })), rows: r.by_category }] : []),
          { name: 'Data', columns: cols.map((c) => ({ header: c.header, key: c.key, width: Math.round((c.width ?? 1) * 14) })), rows: r.rows },
        ],
        { title },
      );
    }
  } catch (e) {
    console.error('[laporan] gagal membuat file', e);
    throw new AppError('ERR-SYS-03');
  }
  // BR-45: setiap ekspor dicatat DATA_EXPORTED + jenis & periode
  await writeAudit({
    userId: user.id, username: user.username, action: 'DATA_EXPORTED', resourceType: 'reports', resourceId: q.report_type,
    detail: { report_type: q.report_type, format: q.format, range: r.range, category_id: q.category_id ?? null, rows: r.rows.length }, ip,
  });
  const ext = q.format === 'PDF' ? 'pdf' : 'xlsx';
  return {
    file,
    filename: `laporan-${q.report_type.toLowerCase()}-${stamp}.${ext}`,
    mime: q.format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}
