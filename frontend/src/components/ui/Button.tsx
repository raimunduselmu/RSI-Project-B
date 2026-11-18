import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
const styles: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  secondary: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-stone-600 hover:bg-stone-100',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, className, children, disabled, ...rest }: Props) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50', styles[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
