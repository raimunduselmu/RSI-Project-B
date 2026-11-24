// SCR-35 Pendampingan, Konseling & Kunjungan — versi publik (FSD-2.37) — Template H
import { useState } from 'react';
import { PublicFormPage, TrackingCode } from '@/components/templates';
import { Alert, Button, Input, Segmented, Textarea } from '@/components/ui';

type Kind = 'PENDAMPINGAN' | 'KONSELING' | 'KUNJUNGAN';

export default function FormPastoral() {
  const [kind, setKind] = useState<Kind>('KONSELING');
  const [sent, setSent] = useState(false);
  // TODO: POST /public/pastoral-cares → kode PST
  return (
    <PublicFormPage code="SCR-35" title="Ajukan Pendampingan, Konseling, atau Kunjungan" subtitle="Formulir publik, tanpa login. Pastor akan menghubungi Anda.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <Input no={1} label="Nama Pemohon" required defaultValue="Theresia Putri" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input no={2} label="Telepon" required inputMode="tel" defaultValue="082134567891" />
          <Input no={3} label="Email" type="email" placeholder="Opsional" hint="Email hanya berisi status dan jadwal, tanpa detail permasalahan." />
        </div>
        <Textarea no={4} label="Keperluan Singkat" required maxLength={255} hint="Tidak perlu menuliskan detail yang bersifat rahasia." defaultValue="Ingin berbincang dengan Romo terkait pergumulan studi." />
        <div className="space-y-1.5">
          <p className="field-label">Jenis Layanan <span className="text-rose-600">*</span></p>
          <Segmented value={kind} onChange={setKind} options={[{ value: 'PENDAMPINGAN', label: 'Pendampingan' }, { value: 'KONSELING', label: 'Konseling' }, { value: 'KUNJUNGAN', label: 'Kunjungan' }]} />
        </div>
        <Button type="submit" variant="brand">Kirim Permintaan</Button>
        {sent && (
          <div className="space-y-3">
            <Alert tone="success">Permintaan terkirim. Simpan kode ini untuk Cek Status.</Alert>
            <TrackingCode code="PST-201126-007" />
          </div>
        )}
      </form>
    </PublicFormPage>
  );
}
