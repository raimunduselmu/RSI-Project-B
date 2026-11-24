import { cn } from '@/lib/format';

type Tone = 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'slate';

const tones: Record<Tone, string> = {
  green: 'bg-emerald-400/10 text-emerald-600 ring-emerald-300/25',
  amber: 'bg-ember-400/15 text-ember-700 ring-ember-300/35',
  red: 'bg-rose-400/10 text-rose-600 ring-rose-300/30',
  blue: 'bg-brand-400/10 text-brand-700 ring-brand-300/30',
  violet: 'bg-violet-400/10 text-violet-700 ring-violet-300/25',
  slate: 'bg-white text-ink/60 ring-slate-900/10',
};

/** Warna otomatis berdasarkan nilai status/kondisi dari FSD. */
const STATUS_TONE: Record<string, Tone> = {
  // umum / pengajuan
  MENUNGGU: 'amber',
  MENUNGGU_VERIFIKASI: 'amber',
  DISETUJUI: 'green',
  DITOLAK: 'red',
  DIBATALKAN: 'slate',
  SELESAI: 'slate',
  LUNAS: 'green',
  BELUM_LUNAS: 'slate',
  // aset
  TERSEDIA: 'green',
  DIPINJAM: 'blue',
  DIAMBIL: 'blue',
  PEMELIHARAAN: 'amber',
  HILANG: 'red',
  BAIK: 'green',
  RUSAK_RINGAN: 'amber',
  RUSAK_BERAT: 'red',
  // keumatan
  AKTIF: 'green',
  NONAKTIF: 'slate',
  ALUMNI: 'violet',
  YA: 'green',
  TIDAK: 'slate',
};

export function Badge({ status, label, tone }: { status: string; label?: string; tone?: Tone }) {
  const t = tone ?? STATUS_TONE[status.toUpperCase()] ?? 'slate';
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-wide ring-1 ring-inset', tones[t])}>
      <span className="h-1 w-1 rounded-full bg-current opacity-80" />
      {label ?? status.replace(/_/g, ' ')}
    </span>
  );
}
