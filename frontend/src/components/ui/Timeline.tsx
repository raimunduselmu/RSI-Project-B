import type { ReactNode } from 'react';

export interface TimelineItem {
  time: string;
  title: ReactNode;
  desc?: ReactNode;
}

/** Riwayat berurutan (riwayat aset, riwayat pelayanan, dsb). */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-6 border-l border-slate-900/[0.08] pl-6">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className={`absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${i === 0 ? 'bg-ember-400 shadow-ember' : 'bg-brand-300'}`} />
          <p className="font-mono text-[11px] text-ink/45">{it.time}</p>
          <p className="mt-0.5 font-medium text-ink">{it.title}</p>
          {it.desc && <p className="mt-0.5 text-sm text-ink/55">{it.desc}</p>}
        </li>
      ))}
    </ol>
  );
}
