import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  /** label kecil di atas judul, mis. "Sarana Prasarana / Aset" */
  eyebrow?: string;
  subtitle?: ReactNode;
  /** kode layar FSD, mis. "SCR-05" */
  code?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, eyebrow, subtitle, code, actions }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {(eyebrow || code) && (
          <div className="mb-2 flex items-center gap-3">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {code && <span className="rounded-full border border-slate-900/[0.08] px-2 py-0.5 font-mono text-[10px] text-ink/35">{code}</span>}
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ink/55">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
