// SCR-34 Permohonan Misa/Intensi — versi publik (FSD-2.36) — Template H
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusFlow } from '@/components/shared/Extras';
import { PublicFormPage, TrackingCode } from '@/components/templates';
import { Button, Input, Select, Textarea } from '@/components/ui';

export default function FormIntensi() {
  const [sent, setSent] = useState(false);
  // TODO: POST /public/intentions → kode INT
  return (
    <PublicFormPage
      code="SCR-34"
      title="Permohonan Misa / Intensi"
      subtitle="Formulir publik, tanpa login."
      aside={
        <>
          <div className="glass p-5">
            <h2>Setelah dikirim</h2>
            <p className="mb-3 mt-2 text-sm text-ink/65">Simpan kode ini untuk Cek Status:</p>
            {sent ? <TrackingCode code="INT-201126-012" /> : <p className="rounded-xl border border-dashed border-slate-900/[0.08] py-3 text-center font-mono text-sm text-ink/40">INT-xxxxxx-xxx</p>}
          </div>
          <div className="glass p-5">
            <h2 className="mb-3">Status permohonan</h2>
            <StatusFlow steps={['DIAJUKAN', 'DIKONFIRMASI', 'DITOLAK', 'DILAKSANAKAN']} active={sent ? 'DIAJUKAN' : undefined} />
            <p className="mt-3 text-xs text-ink/55">Status diubah oleh Pastor dan dapat dipantau lewat Cek Status atau email bila diisi.</p>
          </div>
          <Link to="/pastoral/care" className="block px-1 font-mono text-xs text-ink/60 hover:text-ink">Butuh pendampingan / konseling? →</Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <Input no={1} label="Nama Pemohon" required maxLength={100} defaultValue="Yohanes Kurniawan" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input no={2} label="Telepon" required inputMode="tel" defaultValue="081398765432" />
          <Input no={3} label="Email" type="email" placeholder="Opsional" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select no={4} label="Jenis Intensi" required options={['Syukur', 'Arwah', 'Ujian/Studi', 'Kesehatan', 'Lainnya']} />
          <Select no={5} label="Jadwal Misa" required hint="Hanya jadwal TERBIT" options={['Min, 29 Nov 2026 08.00 — Misa Adven I', 'Sel, 24 Nov 2026 07.00 — Misa Kampus']} />
        </div>
        <Textarea no={6} label="Keterangan Intensi" required maxLength={255} defaultValue="Syukur atas kelulusan sidang skripsi dan ujud keluarga." />
        <Button type="submit" variant="brand">Ajukan Intensi</Button>
      </form>
    </PublicFormPage>
  );
}
