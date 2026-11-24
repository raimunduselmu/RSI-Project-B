import { PageHeader } from './PageHeader';
import { Card } from '@/components/ui';

const TEMPLATE_NAME: Record<string, string> = {
  A: 'A — Tabel penuh (TablePage)',
  B: 'B — Tabel + form di samping (TableFormPage)',
  C: 'C — Daftar + panel proses (ProcessPage)',
  D: 'D — Form panjang (FormPage)',
  E: 'E — Detail + riwayat (DetailPage)',
  F: 'F — Dashboard / laporan (DashboardPage)',
  H: 'H — Form publik (PublicFormPage)',
  J: 'J — Info publik (PublicInfoPage)',
};

/** Placeholder halaman yang belum dikerjakan. Ganti dengan template yang tertulis. */
export function TodoPage({ title, code, fsd, template }: { title: string; code: string; fsd: string; template?: keyof typeof TEMPLATE_NAME }) {
  return (
    <>
      <PageHeader title={title} code={code} eyebrow="Belum dikerjakan" />
      <Card>
        <p className="text-sm text-ink/60">
          Acuan: <b className="text-ink">{code}</b> pada {fsd} (FSD v1.2 §3.2).
          {template && (
            <>
              {' '}Pakai template <b className="text-ink">{TEMPLATE_NAME[template]}</b> dari <code className="font-mono text-brand-700">components/templates</code>.
            </>
          )}
        </p>
      </Card>
    </>
  );
}
