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

const BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

type Body = Record<string, unknown> | FormData | undefined;

async function request<T>(method: string, path: string, body?: Body): Promise<T> {
  const isForm = body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: isForm || !body ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === 'error') {
    const err = new ApiError(res.status, json.error_code ?? 'ERR-SYS-01', json.message ?? 'Terjadi kesalahan', json.details);
    if (err.code === 'ERR-AUTH-06') window.dispatchEvent(new Event('kmk:must-change-password'));
    throw err;
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: Body) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: Body) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}
