import { useLocation } from 'react-router-dom';
import { pendingFor } from '@/lib/backendStatus';
import { Icon } from '@/components/ui/Icon';

/** Spanduk "data contoh" untuk halaman yang endpoint backend-nya belum jadi (lihat lib/backendStatus.ts). */
export function PendingBackend() {
  const { pathname } = useLocation();
  const p = pendingFor(pathname);
  if (!p) return null;
  return (
    <div data-pending-backend className="mb-6 flex items-start gap-3 rounded-xl border border-ember-300/30 bg-ember-500/[0.08] px-4 py-3 text-sm text-ember-700">
      <Icon name="info" size={16} className="mt-0.5 shrink-0 text-ember-600" />
      <p>
        <b className="font-semibold">Data contoh.</b> Endpoint backend <code className="rounded bg-slate-900/[0.05] px-1.5 py-0.5 font-mono text-[12px]">{p.endpoint}</code> belum
        diimplementasikan (masih membalas 501), jadi halaman ini belum memakai data asli.
      </p>
    </div>
  );
}
