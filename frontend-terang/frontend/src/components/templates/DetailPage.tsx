// Template E — Detail + riwayat. Contoh: SCR-07 Detail Aset.
// Dipakai juga: SCR-20, 22, 24, 29.
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui';

export interface DetailPageProps {
  title: string;
  code: string;
  eyebrow?: string;
  /** teks kecil di bawah judul, mis. kode unik aset */
  subtitle?: ReactNode;
  actions?: ReactNode;
  infoTitle?: string;
  /** gambar/foto di atas info (opsional) */
  media?: ReactNode;
  /** isi kartu kiri, biasanya <InfoGrid> */
  info: ReactNode;
  /** isi kanan: tab Riwayat/Dokumen, timeline, tabel */
  children: ReactNode;
}

export function DetailPage(p: DetailPageProps) {
  return (
    <>
      <PageHeader title={p.title} code={p.code} eyebrow={p.eyebrow} subtitle={p.subtitle} actions={p.actions} />
      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card title={p.infoTitle ?? 'Informasi'} no={1}>
          {p.media && <div className="mb-5">{p.media}</div>}
          {p.info}
        </Card>
        <div className="glass p-5">{p.children}</div>
      </div>
    </>
  );
}

/** Kotak foto/placeholder. */
export function MediaBox({ src, label = 'Foto' }: { src?: string; label?: string }) {
  return src ? (
    <img src={src} alt={label} className="aspect-[4/3] w-full rounded-xl object-cover" />
  ) : (
    <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-slate-900/[0.08] bg-gradient-to-br from-brand-400/10 via-transparent to-ember-400/10 text-sm text-ink/35">{label}</div>
  );
}
