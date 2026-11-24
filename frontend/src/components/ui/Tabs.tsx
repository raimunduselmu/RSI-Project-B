import { cn } from '@/lib/format';

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string }[] }) {
  return (
    <div className="flex gap-1 border-b border-slate-900/[0.08]">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            '-mb-px border-b-2 px-3 py-2.5 text-sm transition',
            value === t.value ? 'border-ember-400 text-ink' : 'border-transparent text-ink/50 hover:text-ink/80',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
