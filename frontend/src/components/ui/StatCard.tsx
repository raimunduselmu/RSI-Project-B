import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

/** Kartu angka ringkasan (dashboard, transparansi). */
export function StatCard({ label, value, sub, tone = 'white', no }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'white' | 'brand' | 'ember' | 'green' | 'amber'; no?: number }) {
  const color = { white: 'text-ink', brand: 'text-brand-700', ember: 'text-ember-600', green: 'text-emerald-600', amber: 'text-amber-700' }[tone];
  return (
    <div className="glass group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5 hover:border-ember-300/30">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-ember-500/20 blur-2xl transition duration-500 group-hover:scale-150" />
      <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/50">
        {no !== undefined && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900/[0.05] text-[9px]">{no}</span>}
        {label}
      </p>
      <p className={cn('mt-3 font-display text-4xl leading-none', color)}>{value}</p>
      {sub && <p className="mt-2 text-xs text-ink/45">{sub}</p>}
    </div>
  );
}
