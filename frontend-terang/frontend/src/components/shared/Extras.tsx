// Komponen kecil yang dipakai beberapa layar.
import { cn } from '@/lib/format';

/** Tombol tautan WhatsApp (wa.me) — FSD memakai wa.me, bukan WhatsApp API. */
export function WaLink({ phone, text, label = 'Chat' }: { phone?: string; text?: string; label?: string }) {
  const href = `https://wa.me/${(phone ?? '').replace(/^0/, '62').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-600 transition hover:bg-emerald-400/20">
      <span className="rounded bg-emerald-400/90 px-1 font-mono text-[9px] font-semibold text-ink">wa.me</span>
      {label}
    </a>
  );
}

/** Gambar QR tiruan untuk pratinjau (ganti dengan gambar QRIS / QR asli). */
export function QrPlaceholder({ seed = 'KMK', size = 120, className }: { seed?: string; size?: number; className?: string }) {
  const n = 11;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const r = Math.floor(i / n), c = i % n;
    const finder = (r < 3 && c < 3) || (r < 3 && c >= n - 3) || (r >= n - 3 && c < 3);
    cells.push(finder || ((h >> 16) & 1) === 1);
  }
  return (
    <div className={cn('grid rounded-lg bg-white p-2', className)} style={{ width: size, height: size, gridTemplateColumns: `repeat(${n}, 1fr)` }}>
      {cells.map((on, i) => (
        <span key={i} className={on ? 'bg-white' : ''} />
      ))}
    </div>
  );
}

/** Pil pilihan status sebagai penanda alur (DIAJUKAN → ...). */
export function StatusFlow({ steps, active }: { steps: string[]; active?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {steps.map((s) => (
        <span key={s} className={cn('rounded-full px-2.5 py-1 font-mono text-[10.5px] ring-1 ring-inset', s === active ? 'bg-amber-400/10 text-amber-700 ring-amber-300/30' : 'text-ink/55 ring-slate-900/10')}>
          {s.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );
}
