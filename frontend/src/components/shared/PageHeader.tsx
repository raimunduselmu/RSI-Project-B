import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, code, actions }: { title: string; subtitle?: string; code?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {code && <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-500">{code}</span>}
        {actions}
      </div>
    </div>
  );
}
