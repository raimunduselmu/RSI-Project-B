// SCR-43 Cek Status Pengajuan (FSD-2.46) — Template H
import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { Alert, Badge, Button, Input } from '@/components/ui';
import { PublicFormPage } from '@/components/templates';

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
    <PublicFormPage code="SCR-43" title="Cek Status Pengajuan" subtitle="Peminjaman, intensi, pendampingan, atau pendaftaran kegiatan">
      <form onSubmit={submit} className="space-y-4">
        <Input no={1} label="Kode lacak" placeholder="PJM-201126-004" value={code} onChange={(e) => setCode(e.target.value)} required className="font-mono" />
        <Input no={2} label="Nomor telepon" placeholder="08xxxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <Button type="submit" variant="brand" loading={loading} className="w-full" icon="search">
          Cek Status
        </Button>
      </form>
      {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
      {result && (
        <div className="mt-5 rounded-xl border border-slate-900/[0.08] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-brand-700">{result.code}</span>
            <Badge status={result.status} />
          </div>
          {result.reject_reason && <p className="mt-3 text-sm text-rose-600">Alasan: {result.reject_reason}</p>}
          {result.pic_wa_link && (
            <a href={result.pic_wa_link} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-xs text-emerald-600 hover:text-ink">
              Hubungi penanggung jawab via WhatsApp →
            </a>
          )}
        </div>
      )}
    </PublicFormPage>
  );
}
