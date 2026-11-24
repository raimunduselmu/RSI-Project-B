import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

interface Props {
  title?: ReactNode;
  /** nomor penanda seperti di mockup FSD */
  no?: number;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** hilangkan padding isi (untuk tabel penuh) */
  flush?: boolean;
}

/** Panel kaca. */
export function Card({ title, no, actions, children, className, flush }: Props) {
  return (
    <section className={cn('glass', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/[0.08] px-5 py-4">
          {title && (
            <h2 className="flex items-center gap-2">
              {no !== undefined && <NumberDot n={no} />}
              {title}
            </h2>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

export function NumberDot({ n }: { n: number }) {
  return <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/[0.05] font-mono text-[10px] text-ink/70">{n}</span>;
}

/** Pasangan label–nilai (detail aset, ringkasan pengajuan). */
export function InfoGrid({ items, cols = 2 }: { items: { label: string; value: ReactNode }[]; cols?: 2 | 3 | 4 }) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' }[cols];
  return (
    <dl className={cn('grid gap-x-6 gap-y-4', grid)}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/45">{it.label}</dt>
          <dd className="mt-1 text-sm text-ink/90">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
