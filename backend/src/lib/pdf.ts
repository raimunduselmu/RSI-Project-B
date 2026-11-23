// Pembuat file PDF (FSD-2.6 label, FSD-2.19 ekspor laporan) dengan pdf-lib — tanpa dependensi native.
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';

const MM = 72 / 25.4; // 1 mm dalam satuan PDF (pt)
const A4 = { w: 210 * MM, h: 297 * MM };

/** Font standar PDF hanya mendukung WinAnsi: karakter lain diganti agar tidak gagal */
export function pdfSafe(text: unknown) {
  return String(text ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
}

/** Potong teks agar muat di lebar tertentu */
function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  let t = pdfSafe(text);
  if (font.widthOfTextAtSize(t, size) <= maxWidth) return t;
  while (t.length > 1 && font.widthOfTextAtSize(`${t}...`, size) > maxWidth) t = t.slice(0, -1);
  return `${t}...`;
}

/** Ukuran font terbesar (≤ max) yang membuat teks muat */
function sizeToFit(text: string, font: PDFFont, max: number, min: number, maxWidth: number) {
  let s = max;
  while (s > min && font.widthOfTextAtSize(pdfSafe(text), s) > maxWidth) s -= 0.5;
  return s;
}

export interface LabelData {
  code: string;
  name: string;
  category: string;
}

/** Tata letak label di kertas A4 (BR-13: kode, nama, kategori; kode dicetak apa adanya) */
const LABEL_LAYOUT = {
  kecil: { cols: 4, rows: 12, codeMax: 12, textSize: 6.5 },
  sedang: { cols: 3, rows: 8, codeMax: 16, textSize: 8 },
} as const;

export async function buildLabelsPdf(labels: LabelData[], size: keyof typeof LABEL_LAYOUT, org = 'KMK UNS') {
  const L = LABEL_LAYOUT[size];
  const doc = await PDFDocument.create();
  doc.setTitle(`Label aset (${labels.length})`);
  doc.setCreator('Sistem Informasi KMK UNS');
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg = await doc.embedFont(StandardFonts.Helvetica);

  const margin = 8 * MM;
  const gap = 2 * MM;
  const cellW = (A4.w - 2 * margin - (L.cols - 1) * gap) / L.cols;
  const cellH = (A4.h - 2 * margin - (L.rows - 1) * gap) / L.rows;
  const perPage = L.cols * L.rows;
  const pad = 2.2 * MM;
  const inner = cellW - 2 * pad;

  let page: PDFPage | null = null;
  labels.forEach((lb, i) => {
    if (i % perPage === 0) page = doc.addPage([A4.w, A4.h]);
    const idx = i % perPage;
    const col = idx % L.cols;
    const row = Math.floor(idx / L.cols);
    const x = margin + col * (cellW + gap);
    const yTop = A4.h - margin - row * (cellH + gap);
    const p = page as unknown as PDFPage;

    p.drawRectangle({ x, y: yTop - cellH, width: cellW, height: cellH, borderColor: rgb(0.55, 0.55, 0.55), borderWidth: 0.6 });
    // Baris atas: organisasi + kategori
    p.drawText(fit(`${org} · ${lb.category}`.replace('·', '-'), reg, L.textSize, inner), { x: x + pad, y: yTop - pad - L.textSize, size: L.textSize, font: reg, color: rgb(0.35, 0.35, 0.35) });
    // Tengah: kode unik besar
    const cs = sizeToFit(lb.code, bold, L.codeMax, 6, inner);
    p.drawText(pdfSafe(lb.code), { x: x + pad, y: yTop - cellH / 2 - cs / 3, size: cs, font: bold, color: rgb(0, 0, 0) });
    // Bawah: nama aset
    p.drawText(fit(lb.name, reg, L.textSize, inner), { x: x + pad, y: yTop - cellH + pad, size: L.textSize, font: reg, color: rgb(0.1, 0.1, 0.1) });
  });
  if (labels.length === 0) doc.addPage([A4.w, A4.h]);
  return doc.save();
}

export interface PdfColumn {
  header: string;
  key: string;
  /** Lebar relatif (dibagi proporsional ke lebar halaman) */
  width?: number;
  align?: 'left' | 'right';
}

/** Tabel sederhana berhalaman (A4 lanskap), dengan judul, keterangan, dan nomor halaman */
export async function buildTablePdf(opts: { title: string; subtitle?: string; columns: PdfColumn[]; rows: Record<string, unknown>[]; footnote?: string }) {
  const doc = await PDFDocument.create();
  doc.setTitle(pdfSafe(opts.title));
  doc.setCreator('Sistem Informasi KMK UNS');
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const W = A4.h; // lanskap
  const H = A4.w;
  const margin = 12 * MM;
  const usable = W - 2 * margin;
  const totalW = opts.columns.reduce((s, c) => s + (c.width ?? 1), 0);
  const widths = opts.columns.map((c) => ((c.width ?? 1) / totalW) * usable);
  const size = 8;
  const rowH = 14;
  const cellPad = 3;

  const pages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;

  const header = () => {
    let x = margin;
    page.drawRectangle({ x: margin, y: y - rowH + 3, width: usable, height: rowH, color: rgb(0.9, 0.9, 0.92) });
    opts.columns.forEach((c, i) => {
      const h = fit(c.header, bold, size, widths[i] - 2 * cellPad);
      const hx = c.align === 'right' ? x + widths[i] - cellPad - bold.widthOfTextAtSize(h, size) : x + cellPad;
      page.drawText(h, { x: hx, y: y - rowH + 7, size, font: bold });
      x += widths[i];
    });
    y -= rowH;
  };
  const newPage = (first: boolean) => {
    page = doc.addPage([W, H]);
    pages.push(page);
    y = H - margin;
    if (first) {
      page.drawText(fit(opts.title, bold, 14, usable), { x: margin, y: y - 14, size: 14, font: bold });
      y -= 20;
      if (opts.subtitle) {
        page.drawText(fit(opts.subtitle, reg, 9, usable), { x: margin, y: y - 9, size: 9, font: reg, color: rgb(0.3, 0.3, 0.3) });
        y -= 16;
      }
    }
    header();
  };

  newPage(true);
  opts.rows.forEach((r, ri) => {
    if (y - rowH < margin + 14) newPage(false);
    if (ri % 2 === 1) page.drawRectangle({ x: margin, y: y - rowH + 3, width: usable, height: rowH, color: rgb(0.97, 0.97, 0.97) });
    let x = margin;
    opts.columns.forEach((c, i) => {
      const v = r[c.key];
      const text = fit(v instanceof Date ? v.toISOString().slice(0, 16).replace('T', ' ') : v == null ? '-' : String(v), reg, size, widths[i] - 2 * cellPad);
      const tx = c.align === 'right' ? x + widths[i] - cellPad - reg.widthOfTextAtSize(text, size) : x + cellPad;
      page.drawText(text, { x: tx, y: y - rowH + 7, size, font: reg });
      x += widths[i];
    });
    y -= rowH;
  });
  if (opts.rows.length === 0) page.drawText('Tidak ada data.', { x: margin + cellPad, y: y - rowH + 7, size, font: reg });

  const printed = `Dicetak ${new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 16).replace('T', ' ')} WIB`;
  pages.forEach((p, i) => {
    const t = `${opts.footnote ? `${pdfSafe(opts.footnote)} · ` : ''}${printed} · Halaman ${i + 1} dari ${pages.length}`.replace(/·/g, '-');
    p.drawText(t, { x: margin, y: margin - 4, size: 7, font: reg, color: rgb(0.4, 0.4, 0.4) });
  });
  return doc.save();
}
