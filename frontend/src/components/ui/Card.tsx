import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

export function Card({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-stone-200 bg-white p-5 shadow-sm', className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
