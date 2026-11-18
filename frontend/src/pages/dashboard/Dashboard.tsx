// SCR-05 Dashboard (FSD-2.40)
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui';
import { PageHeader } from '@/components/shared/PageHeader';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title={`Halo, ${user?.full_name ?? ''}`} subtitle={`Role: ${user?.roles.join(', ')}`} code="SCR-05" />
      <div className="grid gap-4 md:grid-cols-4">
        {['Pengajuan menunggu', 'Aset tersedia', 'Kegiatan bulan ini', 'Iuran belum lunas'].map((t) => (
          <Card key={t}>
            <p className="text-sm text-stone-500">{t}</p>
            <p className="mt-1 text-2xl font-semibold text-brand-700">–</p>
          </Card>
        ))}
      </div>
      {/* TODO: ambil ringkasan dari GET /dashboard sesuai role */}
    </>
  );
}
