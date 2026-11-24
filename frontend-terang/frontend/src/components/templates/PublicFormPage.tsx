// Template H — Form publik (tanpa login). Contoh: SCR-09 Form Pengajuan Peminjaman.
// Dipakai juga: SCR-28 (publik), 34 (publik), 35 (publik), 43.
import type { ReactNode } from 'react';

export interface PublicFormPageProps {
  title: ReactNode;
  code: string;
  subtitle?: ReactNode;
  /** kartu form kiri */
  children: ReactNode;
  /** panel kanan: ringkasan, konfirmasi, kode lacak */
  aside?: ReactNode;
}

export function PublicFormPage(p: PublicFormPageProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="eyebrow">Layanan publik</span>
          <span className="rounded-full border border-slate-900/[0.08] px-2 py-0.5 font-mono text-[10px] text-ink/35">{p.code}</span>
        </div>
        <h1>{p.title}</h1>
        {p.subtitle && <p className="mt-1.5 text-sm text-ink/55">{p.subtitle}</p>}
      </div>
      <div className={p.aside ? 'grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]' : 'max-w-2xl'}>
        <div className="glass p-6">{p.children}</div>
        {p.aside && <aside className="space-y-4 lg:sticky lg:top-24">{p.aside}</aside>}
      </div>
    </div>
  );
}

/** Kotak kode lacak dengan tombol salin. */
export function TrackingCode({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-xl border border-dashed border-brand-300/40 bg-brand-400/[0.08] px-4 py-3 text-center font-mono text-lg tracking-wider text-brand-700">{code}</div>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(code).catch(() => undefined)}
        className="rounded-xl border border-slate-900/[0.08] px-3 py-3 font-mono text-xs text-ink/70 hover:bg-ember-50"
      >
        Salin
      </button>
    </div>
  );
}
