import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/format';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, hint, className, id, ...rest }, ref) => {
  const inputId = id ?? rest.name;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
          {label} {rest.required && <span className="text-red-600">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn('w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-300', error ? 'border-red-500' : 'border-stone-300', className)}
        {...rest}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';
