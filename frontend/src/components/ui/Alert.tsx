import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

const tones = {
  info: 'bg-brand-50 text-brand-800 border-brand-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
};

export function Alert({ tone = 'info', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <div className={cn('rounded-lg border px-4 py-3 text-sm', tones[tone])}>{children}</div>;
}
