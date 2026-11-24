import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/format';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  /** nomor penanda seperti di mockup FSD (opsional) */
  no?: number;
}

/** Bungkus label + pesan error/hint untuk semua jenis field. */
export function Field({ label, error, hint, no, required, htmlFor, children }: FieldProps & { required?: boolean; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {no !== undefined && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900/[0.05] font-mono text-[10px] text-ink/70">{no}</span>}
          {label}
          {required && <span className="text-ember-400">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="text-xs text-ember-600">{error}</p> : hint && <p className="text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, no, className, id, ...rest }, ref) => {
  const inputId = id ?? rest.name;
  return (
    <Field label={label} error={error} hint={hint} no={no} required={rest.required} htmlFor={inputId}>
      <input ref={ref} id={inputId} className={cn('field', error && 'field-error', className)} {...rest} />
    </Field>
  );
});
Input.displayName = 'Input';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldProps & { options?: (string | { value: string; label: string })[] };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, hint, no, className, id, options, children, ...rest }, ref) => {
  const inputId = id ?? rest.name;
  return (
    <Field label={label} error={error} hint={hint} no={no} required={rest.required} htmlFor={inputId}>
      <select ref={ref} id={inputId} className={cn('field', error && 'field-error', className)} {...rest}>
        {options?.map((o) =>
          typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>,
        )}
        {children}
      </select>
    </Field>
  );
});
Select.displayName = 'Select';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, hint, no, className, id, rows = 3, ...rest }, ref) => {
  const inputId = id ?? rest.name;
  return (
    <Field label={label} error={error} hint={hint} no={no} required={rest.required} htmlFor={inputId}>
      <textarea ref={ref} id={inputId} rows={rows} className={cn('field resize-y', error && 'field-error', className)} {...rest} />
    </Field>
  );
});
Textarea.displayName = 'Textarea';

/** Saklar ya/tidak. */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-ink/80">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 rounded-full border transition', checked ? 'border-ember-300/60 bg-ember-500 shadow-ember' : 'border-slate-900/[0.08] bg-slate-900/[0.05]')}
      >
        <span className={cn('absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
      {label}
    </label>
  );
}

/** Pilihan berbentuk pil (radio). */
export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-full border border-slate-900/[0.08] bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn('rounded-full px-4 py-1.5 text-sm transition', value === o.value ? 'bg-white text-night-900' : 'text-ink/65 hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Area unggah berkas (seret & lepas). */
export function FileDrop({ hint = 'JPG/PNG, maks 5 MB', accept, onFile }: { hint?: string; accept?: string; onFile?: (f: File) => void }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-900/[0.14] bg-white px-4 py-8 text-center transition hover:border-ember-300/50 hover:bg-ember-50">
      <span className="text-sm text-ink/80">Seret berkas ke sini atau klik untuk memilih</span>
      <span className="text-xs text-ink/40">{hint}</span>
      <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onFile?.(e.target.files[0])} />
    </label>
  );
}
