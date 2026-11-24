import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/format';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'brand' | 'secondary' | 'success' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const styles: Record<Variant, string> = {
  // pil putih seperti "Get Started Free"
  primary: 'bg-white text-night-900 hover:bg-ember-50 shadow-[0_8px_30px_-10px_rgba(255,255,255,0.6)]',
  // oranye menyala (aksi utama di form)
  brand: 'bg-gradient-to-br from-ember-300 via-ember-500 to-rose-500 text-white shadow-ember hover:brightness-110 hover:-translate-y-px',
  // pil kaca bergaris
  secondary: 'border border-slate-900/[0.08] bg-white text-ink hover:bg-ember-50 hover:border-slate-900/[0.14] backdrop-blur',
  success: 'bg-emerald-400/90 text-night-950 hover:bg-emerald-300',
  danger: 'bg-rose-500/90 text-ink hover:bg-rose-400 shadow-[0_8px_24px_-8px_rgba(244,63,94,0.7)]',
  ghost: 'text-ink/70 hover:bg-ember-50 hover:text-ink',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', icon, loading, className, children, disabled, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ember-400/30 disabled:pointer-events-none disabled:opacity-50',
        styles[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />
      )}
      {children}
    </button>
  );
}

/** Tombol bulat kaca (seperti panah kiri/kanan di FluxEdit). */
export function IconButton({ icon, label, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/[0.08] bg-white text-ink/80 backdrop-blur transition hover:border-ember-300/50 hover:bg-ember-50 hover:text-ink hover:shadow-soft', className)}
      {...rest}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}
