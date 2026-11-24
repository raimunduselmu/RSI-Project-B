// Pembuat file Excel (.xlsx) untuk ekspor laporan (FSD-2.19) dengan exceljs.
import ExcelJS from 'exceljs';

export interface XlsxSheet {
  name: string;
  columns: { header: string; key: string; width?: number; numFmt?: string }[];
  rows: Record<string, unknown>[];
}

export async function buildXlsx(sheets: XlsxSheet[], meta?: { title?: string }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistem Informasi KMK UNS';
  wb.created = new Date();
  if (meta?.title) wb.title = meta.title;
  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name.slice(0, 31).replace(/[\\/?*[\]:]/g, ' '));
    ws.columns = s.columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 18, style: c.numFmt ? { numFmt: c.numFmt } : {} }));
    ws.addRows(s.rows);
    const head = ws.getRow(1);
    head.font = { bold: true };
    head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    if (s.rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.columns.length } };
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}
