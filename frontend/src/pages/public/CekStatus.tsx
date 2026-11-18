// SCR-43 Cek Status Pengajuan (FSD-2.46)
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { Alert, Badge, Button, Card, Input } from '@/components/ui';
import { PageHeader } from '@/components/shared/PageHeader';

interface StatusResult {
  type: string;
  code: string;
  status: string;
  reject_reason: string | null;
  pic_wa_link?: string;
}

export default function CekStatus() {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const q = new URLSearchParams({ code: code.trim().toUpperCase(), phone: phone.trim() });
      setResult(await api.get<StatusResult>(`/public/status?${q}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Cek Status Pengajuan" code="SCR-43" subtitle="Peminjaman, intensi, pendampingan, atau pendaftaran kegiatan" />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Kode lacak" placeholder="PJM-201126-004" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Input label="Nomor telepon" placeholder="08xxxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Cek Status</Button>
        </form>
      </Card>
      {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
      {result && (
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{result.code}</span>
            <Badge status={result.status} />
          </div>
          {result.reject_reason && <p className="mt-3 text-sm text-red-700">Alasan: {result.reject_reason}</p>}
          {result.pic_wa_link && (
            <a href={result.pic_wa_link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-brand-600">
              Hubungi penanggung jawab via WhatsApp →
            </a>
          )}
        </Card>
      )}
    </div>
  );
}
