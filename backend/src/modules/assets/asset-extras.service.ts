// FSD-2.6 Cetak Label Kode Unik · FSD-2.16 Kelola Dokumen Aset (gelombang 4)
import { randomUUID } from 'node:crypto';
import { AppError } from '../../lib/AppError.js';
import { findAsset, writeAudit } from '../../lib/assetRef.js';
import { buildLabelsPdf } from '../../lib/pdf.js';
import { query } from '../../lib/sql.js';
import { archiveFile, removeFile } from '../../lib/storage.js';
import type { AuthUser } from '../../types/express.js';
import type { LabelInput, UploadDocumentInput } from './assets.schema.js';

/* ---------------- Label ---------------- */
/** BR-13: kode, nama, kategori; kode tidak diubah. BR-14: setiap cetak (termasuk ulang) dicatat LABEL_PRINTED */
export async function printLabels(input: LabelInput, user: AuthUser, ip?: string) {
  const keys: string[] = Array.from(new Set<string>(input.asset_ids));
  const params: Record<string, unknown> = {};
  keys.forEach((k, i) => (params[`k${i}`] = k));
  const inList = keys.map((_, i) => `@k${i}`).join(',');
  const rows = await query<{ asset_id: string; asset_code: string; asset_name: string; category_name: string }>(
    `SELECT a.asset_id, a.asset_code, a.asset_name, c.category_name
     FROM assets a JOIN asset_categories c ON c.category_id = a.category_id
     WHERE a.is_deleted = 0 AND (a.asset_code IN (${inList}) OR CAST(a.asset_id AS NVARCHAR(36)) IN (${inList}))
     ORDER BY a.asset_code`,
    params,
  );
  if (rows.length < keys.length) {
    const found = new Set(rows.flatMap((r) => [r.asset_code.toLowerCase(), r.asset_id.toLowerCase()]));
    const missing = keys.filter((k) => !found.has(k.toLowerCase()));
    throw new AppError('ERR-DATA-01', 'Sebagian aset tidak ditemukan', { asset_ids: missing.map((m) => `Tidak ditemukan: ${m}`) });
  }
  let pdf: Uint8Array;
  try {
    pdf = await buildLabelsPdf(rows.map((r) => ({ code: r.asset_code, name: r.asset_name, category: r.category_name })), input.label_size);
  } catch (e) {
    console.error('[label] gagal membuat PDF', e);
    throw new AppError('ERR-SYS-03');
  }
  for (const r of rows) {
    await writeAudit({ userId: user.id, username: user.username, action: 'LABEL_PRINTED', resourceType: 'assets', resourceId: r.asset_id, detail: { asset_code: r.asset_code, label_size: input.label_size }, ip });
  }
  return { pdf: Buffer.from(pdf), filename: `label-aset-${rows.length}-${input.label_size}.pdf` };
}

/* ---------------- Dokumen ---------------- */
export async function listDocuments(assetKey: string) {
  const a = await findAsset(assetKey);
  return query(
    `SELECT d.document_id, d.asset_id, d.doc_type, d.doc_title, d.file_size_kb, d.mime_type, d.uploaded_at, u.full_name AS uploaded_by_name
     FROM asset_documents d LEFT JOIN users u ON u.user_id = d.uploaded_by
     WHERE d.asset_id = @a ORDER BY d.uploaded_at DESC`,
    { a: a.asset_id },
  );
}

/** Langkah 3–4: file sudah divalidasi multer (PDF/JPG/PNG ≤ 5 MB) dan disimpan dengan nama acak (BR-38) */
export async function addDocument(assetKey: string, input: UploadDocumentInput, file: { path: string; size: number; mime: string }, user: AuthUser, ip?: string) {
  try {
    const a = await findAsset(assetKey);
    const id = randomUUID();
    await query(
      `INSERT INTO asset_documents (document_id, asset_id, doc_type, doc_title, file_path, file_size_kb, mime_type, uploaded_by)
       VALUES (@id, @a, @t, @title, @p, @kb, @m, @u)`,
      { id, a: a.asset_id, t: input.doc_type, title: input.doc_title, p: file.path, kb: Math.max(1, Math.ceil(file.size / 1024)), m: file.mime, u: user.id },
    );
    await writeAudit({ userId: user.id, username: user.username, action: 'DOCUMENT_UPLOADED', resourceType: 'asset_documents', resourceId: id, detail: { asset_code: a.asset_code, doc_type: input.doc_type, doc_title: input.doc_title }, ip });
    const [doc] = await query(`SELECT document_id, asset_id, doc_type, doc_title, file_size_kb, mime_type, uploaded_at FROM asset_documents WHERE document_id = @id`, { id });
    return doc;
  } catch (e) {
    await removeFile(file.path);
    throw e;
  }
}

async function getDocument(assetKey: string, docId: string) {
  const a = await findAsset(assetKey);
  const [d] = await query<{ document_id: string; doc_title: string; file_path: string; mime_type: string; doc_type: string }>(
    `SELECT document_id, doc_title, file_path, mime_type, doc_type FROM asset_documents WHERE document_id = @d AND asset_id = @a`,
    { d: docId, a: a.asset_id },
  );
  if (!d) throw new AppError('ERR-DATA-01', 'Dokumen tidak ditemukan');
  return { ...d, asset_code: a.asset_code };
}

/** AF-1: unduh lewat endpoint terautentikasi */
export async function documentFile(assetKey: string, docId: string) {
  const d = await getDocument(assetKey, docId);
  const ext = d.file_path.split('.').pop() ?? 'bin';
  const safeTitle = d.doc_title.replace(/[^\w -]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60) || 'dokumen';
  return { path: d.file_path, mime: d.mime_type, filename: `${d.asset_code}_${safeTitle}.${ext}` };
}

/** AF-2: hapus record, file dipindahkan dari penyimpanan aktif (BR-39 dicatat) */
export async function deleteDocument(assetKey: string, docId: string, user: AuthUser, ip?: string) {
  const d = await getDocument(assetKey, docId);
  await query(`DELETE FROM asset_documents WHERE document_id = @d`, { d: docId });
  await archiveFile(d.file_path);
  await writeAudit({ userId: user.id, username: user.username, action: 'DOCUMENT_DELETED', resourceType: 'asset_documents', resourceId: docId, detail: { asset_code: d.asset_code, doc_title: d.doc_title, doc_type: d.doc_type }, ip });
}
