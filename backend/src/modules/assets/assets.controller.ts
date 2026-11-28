import { AppError } from '../../lib/AppError.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPagination } from '../../lib/pagination.js';
import { created, ok, paginated } from '../../lib/response.js';
import { saveFile, sendStoredFile } from '../../lib/storage.js';
import * as extras from './asset-extras.service.js';
import * as service from './assets.service.js';
import type { ListAssetQuery } from './assets.schema.js';

/** Publik melihat field terbatas; pengurus (login) melihat semua field (TSD 3.2) */
export const list = asyncHandler(async (req, res) => {
  const { page, perPage } = getPagination(req);
  const { rows, total } = await service.list(req.query as unknown as ListAssetQuery, !!req.user, page, perPage);
  paginated(res, rows, page, perPage, total);
});

export const get = asyncHandler(async (req, res) => ok(res, await service.get(req.params.id, !!req.user)));

export const codePreview = asyncHandler(async (req, res) => ok(res, await service.previewCode(Number(req.query.category_id))));

export const create = asyncHandler(async (req, res) => {
  const photo = req.file ? await saveFile(req.file.buffer, req.file.originalname, 'assets') : undefined;
  const a = await service.create(req.body, req.user!, req.ip, photo);
  created(res, await service.get(a.asset_id, true), `Aset terdaftar dengan kode ${a.asset_code}`);
});

export const update = asyncHandler(async (req, res) => {
  const photo = req.file ? await saveFile(req.file.buffer, req.file.originalname, 'assets') : undefined;
  const a = await service.update(req.params.id, req.body, req.user!, req.ip, photo);
  ok(res, await service.get(a.asset_id, true), 'Data aset diperbarui');
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user!, req.ip);
  ok(res, null, 'Aset dihapus');
});

export const histories = asyncHandler(async (req, res) => ok(res, await service.histories(req.params.id, req.query as { date_from?: string; date_to?: string })));

export const photo = asyncHandler(async (req, res) => {
  await sendStoredFile(res, await service.photoPath(req.params.id));
});

/* ---------- Gelombang 4: label (FSD-2.6) & dokumen aset (FSD-2.16) ---------- */

/** POST /labels  —  Unduh PDF label kode unik (FSD-2.6) */
export const labels = asyncHandler(async (req, res) => {
  const { pdf, filename } = await extras.printLabels(req.body, req.user!, req.ip);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(pdf);
});

/** GET /:id/documents  —  Daftar dokumen aset (FSD-2.16) */
export const documents = asyncHandler(async (req, res) => ok(res, await extras.listDocuments(req.params.id)));

/** POST /:id/documents  —  Unggah dokumen (multipart: file, doc_type, doc_title) (FSD-2.16) */
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('ERR-VAL-01', undefined, { file: ['Pilih file dokumen'] });
  let saved: string;
  try {
    saved = await saveFile(req.file.buffer, req.file.originalname, 'asset-documents');
  } catch (e) {
    console.error('[dokumen] gagal menyimpan file', e);
    throw new AppError('ERR-SYS-03');
  }
  const doc = await extras.addDocument(req.params.id, req.body, { path: saved, size: req.file.size, mime: req.file.mimetype }, req.user!, req.ip);
  created(res, doc, 'Dokumen diunggah');
});

/** GET /:id/documents/:docId/download  —  Unduh dokumen (terautentikasi, FSD-2.16 AF-1) */
export const downloadDocument = asyncHandler(async (req, res) => {
  const f = await extras.documentFile(req.params.id, req.params.docId);
  res.setHeader('Content-Type', f.mime);
  res.setHeader('Content-Disposition', `attachment; filename="${f.filename}"`);
  await sendStoredFile(res, f.path);
});

/** DELETE /:id/documents/:docId  —  Hapus dokumen (FSD-2.16 AF-2) */
export const deleteDocument = asyncHandler(async (req, res) => {
  await extras.deleteDocument(req.params.id, req.params.docId, req.user!, req.ip);
  ok(res, null, 'Dokumen dihapus');
});
