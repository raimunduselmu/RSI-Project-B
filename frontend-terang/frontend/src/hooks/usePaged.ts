import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type Paginated } from '@/lib/api';

/** Ambil daftar berhalaman (envelope { data, meta }). Panggil reload() setelah mutasi. */
export function usePaged<T>(path: string | null) {
  const [res, setRes] = useState<Paginated<T> | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(!!path);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      setRes(await api.page<T>(path));
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows: res?.data ?? [], meta: res?.meta ?? null, error, loading, reload };
}

/** Susun query string, buang nilai kosong. */
export const qs = (o: Record<string, string | number | undefined | null>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : '';
};
