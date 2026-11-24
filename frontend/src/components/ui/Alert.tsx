import type { ReactNode } from 'react';
import { cn } from '@/lib/format';
import { Icon, type IconName } from './Icon';

const tones: Record<string, { cls: string; icon: IconName }> = {
  info: { cls: 'border-brand-300/25 bg-brand-400/[0.08] text-brand-700', icon: 'info' },
  error: { cls: 'border-ember-300/30 bg-ember-400/[0.08] text-ember-700', icon: 'alert' },
  success: { cls: 'border-emerald-300/25 bg-emerald-400/[0.08] text-emerald-700', icon: 'circleCheck' },
  warning: { cls: 'border-amber-300/25 bg-amber-400/[0.08] text-amber-700', icon: 'alert' },
};

export function Alert({ tone = 'info', title, children }: { tone?: 'info' | 'error' | 'success' | 'warning'; title?: string; children: ReactNode }) {
  const t = tones[tone];
  return (
    <div className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', t.cls)}>
      <Icon name={t.icon} size={16} className="mt-0.5 shrink-0 opacity-80" />
      <div>
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? 'mt-0.5 opacity-80' : ''}>{children}</div>
      </div>
    </div>
  );
}
