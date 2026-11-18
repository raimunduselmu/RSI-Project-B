import { cn } from '@/lib/format';

const tone: Record<string, string> = {
  MENUNGGU: 'bg-amber-100 text-amber-800',
  MENUNGGU_VERIFIKASI: 'bg-amber-100 text-amber-800',
  DISETUJUI: 'bg-green-100 text-green-800',
  LUNAS: 'bg-green-100 text-green-800',
  DITOLAK: 'bg-red-100 text-red-800',
  DIAMBIL: 'bg-blue-100 text-blue-800',
  SELESAI: 'bg-stone-200 text-stone-700',
  BELUM_LUNAS: 'bg-stone-100 text-stone-600',
};

/** Badge status; warna otomatis dari nilai status. */
export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', tone[status] ?? 'bg-brand-100 text-brand-800')}>
      {label ?? status.replace(/_/g, ' ')}
    </span>
  );
}
