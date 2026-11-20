import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Penyimpanan file non-publik. Nama file diacak (TSD 6.1).
 * local → folder UPLOAD_DIR (Opsi A, /var/kmk/uploads)
 * blob  → Vercel Blob (Opsi B) — TODO: pasang paket @vercel/blob saat dibutuhkan
 */
export async function saveFile(buffer: Buffer, originalName: string, folder: string) {
  const ext = path.extname(originalName).toLowerCase();
  const name = `${crypto.randomUUID()}${ext}`;
  if (env.STORAGE_DRIVER === 'blob') {
    throw new Error('STORAGE_DRIVER=blob belum diimplementasikan');
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
  if (!relPath || env.STORAGE_DRIVER === 'blob') return;
  try {
    await fs.unlink(resolveFile(relPath));
  } catch {
    /* file sudah tidak ada */
  }
}
