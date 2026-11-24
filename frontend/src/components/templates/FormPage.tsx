// Template D — Form panjang. Contoh: SCR-06 Form Aset (Tambah/Ubah).
// Dipakai juga: SCR-11, 32, 40, 42.
import type { FormEvent, ReactNode } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui';

export interface FormPageProps {
  title: string;
  code: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  /** field-field form; pakai <FormGrid> untuk 2 kolom */
  children: ReactNode;
  /** panel kanan opsional, mis. "Pratinjau Kode" */
  aside?: ReactNode;
  submitLabel?: string;
  onSubmit?: (e: FormEvent) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function FormPage(p: FormPageProps) {
  return (
    <>
      <PageHeader title={p.title} code={p.code} eyebrow={p.eyebrow} subtitle={p.subtitle} />
      <div className={p.aside ? 'grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]' : 'max-w-4xl'}>
        <form
          className="glass space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            p.onSubmit?.(e);
          }}
        >
          {p.children}
          <div className="flex justify-end gap-2 border-t border-slate-900/[0.08] pt-5">
            {p.onCancel && (
              <Button variant="secondary" onClick={p.onCancel}>
                Batal
              </Button>
            )}
            <Button type="submit" variant="brand" loading={p.loading}>
              {p.submitLabel ?? 'Simpan'}
            </Button>
          </div>
        </form>
        {p.aside && <aside className="glass p-6 xl:sticky xl:top-24">{p.aside}</aside>}
      </div>
    </>
  );
}

/** Dua kolom untuk field berpasangan. */
export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

/** Judul pemisah bagian di dalam form, mis. "Penanggung Jawab". */
export function FormSection({ title }: { title: string }) {
  return <p className="eyebrow pt-2">{title}</p>;
}
