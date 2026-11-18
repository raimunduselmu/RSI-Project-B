import { PageHeader } from './PageHeader';
import { Card } from '@/components/ui';

/** Placeholder halaman yang belum dikerjakan. Ganti dengan implementasi sesuai mockup FSD. */
export function TodoPage({ title, code, fsd }: { title: string; code: string; fsd: string }) {
  return (
    <>
      <PageHeader title={title} code={code} />
      <Card>
        <p className="text-sm text-stone-500">
          Halaman ini belum dikerjakan. Acuan: <b>{code}</b> pada {fsd}.
        </p>
      </Card>
    </>
  );
}
