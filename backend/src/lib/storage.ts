import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Response } from 'express';
import { put, head, del, copy } from '@vercel/blob';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

/**
 * Penyimpanan file non-publik. Nama file diacak (TSD 6.1).
 * local → folder UPLOAD_DIR (Opsi A, /var/kmk/uploads)
 * blob  → Vercel Blob (Opsi B, deploy Vercel). Nama file UUID acak, URL blob tidak pernah dikirim ke klien:
 *         file selalu dilayani lewat backend (sendStoredFile) setelah cek hak akses.
 * Kolom *_path di database tetap berisi `folder/uuid.ext` untuk kedua driver.
 */
const blobOpts = () => ({ token: env.BLOB_READ_WRITE_TOKEN });
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.pdf': 'application/pdf',
};
export async function saveFile(buffer: Buffer, originalName: string, folder: string) {
  const ext = path.extname(originalName).toLowerCase();
  const name = `${crypto.randomUUID()}${ext}`;
  if (env.STORAGE_DRIVER === 'blob') {
    await put(`${folder}/${name}`, buffer, {
      ...blobOpts(), access: 'public', addRandomSuffix: false,
      contentType: MIME[ext] ?? 'application/octet-stream',
    });
    return `${folder}/${name}`;
  }
  const dir = path.resolve(env.UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buffer);
  return `${folder}/${name}`;          // simpan string ini di kolom *_path
}

export function resolveFile(relPath: string) {
  const full = path.resolve(env.UPLOAD_DIR, relPath);
  if (!full.startsWith(path.resolve(env.UPLOAD_DIR))) throw new Error('Path tidak valid');
  return full;
}

/** Hapus file yang sudah tersimpan (mis. pengajuan gagal setelah file diunggah). Tidak melempar galat. */
export async function removeFile(relPath: string | null | undefined) {
  if (!relPath) return;
  try {
    if (env.STORAGE_DRIVER === 'blob') { await del(relPath, blobOpts()); return; }
    await fs.unlink(resolveFile(relPath));
  } catch {
    /* file sudah tidak ada */
  }
}

/** Pindahkan file ke folder `_dihapus/` (FSD-2.16 AF-2: keluar dari penyimpanan aktif, tidak langsung dimusnahkan). */
export async function archiveFile(relPath: string | null | undefined) {
  if (!relPath) return;
  try {
    if (env.STORAGE_DRIVER === 'blob') {
      const src = await head(relPath, blobOpts());
      await copy(src.url, path.posix.join('_dihapus', relPath), { ...blobOpts(), access: 'public', addRandomSuffix: false });
      await del(src.url, blobOpts());
      return;
    }
    const from = resolveFile(relPath);
    const to = resolveFile(path.posix.join('_dihapus', relPath));
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.rename(from, to);
  } catch {
    /* file sudah tidak ada */
  }
}

/** Kirim file tersimpan ke klien (pengganti res.sendFile(resolveFile(...))). */
export async function sendStoredFile(res: Response, relPath: string) {
  if (env.STORAGE_DRIVER !== 'blob') {
    res.sendFile(resolveFile(relPath));
    return;
  }
  let url: string;
  try {
    url = (await head(relPath, blobOpts())).url;
  } catch {
    throw new AppError('ERR-DATA-01', 'File tidak ditemukan');
  }
  const r = await fetch(url);
  if (!r.ok) throw new AppError('ERR-DATA-01', 'File tidak ditemukan');
  if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', r.headers.get('content-type') ?? 'application/octet-stream');
  res.send(Buffer.from(await r.arrayBuffer()));
}
