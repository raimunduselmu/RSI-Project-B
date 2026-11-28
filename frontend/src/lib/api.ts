// Satu-satunya pintu ke backend. Cookie kmk_token ikut otomatis (credentials: 'include').
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export const BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

type Body = Record<string, unknown> | FormData | undefined;

/**
 * Kecilkan foto sebelum diunggah. Batas request Vercel Functions 4,5 MB, foto HP sering lebih besar.
 * Hanya JPG/PNG/WebP di atas 1 MB yang diubah (sisi terpanjang maks 1920 px, JPEG kualitas 0,85).
 * PDF dan file lain dikirim apa adanya.
 */
async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size <= 1024 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.(png|webp|jpe?g)$/i, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

async function shrinkForm(form: FormData): Promise<FormData> {
  const out = new FormData();
  for (const [k, v] of form.entries()) {
    if (v instanceof File) { const f = await shrinkImage(v); out.append(k, f, f.name); }
    else out.append(k, v);
  }
  return out;
}

async function request<T>(method: string, path: string, body?: Body, raw = false): Promise<T> {
  const isForm = body instanceof FormData;
  const form = isForm ? await shrinkForm(body as FormData) : undefined;
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: isForm || !body ? undefined : { 'Content-Type': 'application/json' },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === 'error') {
    const err = new ApiError(res.status, json.error_code ?? 'ERR-SYS-01', json.message ?? (res.status === 413 ? 'Ukuran file terlalu besar (maks. 4 MB).' : 'Terjadi kesalahan'), json.details);
    if (err.code === 'ERR-AUTH-06') window.dispatchEvent(new Event('kmk:must-change-password'));
    throw err;
  }
  return (raw ? json : json.data) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  /** GET daftar berhalaman: kembalikan { data, meta } (total, last_page, ...) */
  page: <T>(path: string) => request<Paginated<T>>('GET', path, undefined, true),
  post: <T>(path: string, body?: Body) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: Body) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}