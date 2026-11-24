// SCR-32 Pembayaran Peminjaman (FSD-2.34) — Template D
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormPage } from '@/components/templates';
import { FileDrop, Input, Segmented, Select } from '@/components/ui';

export default function LoanPayments() {
  const nav = useNavigate();
  const [kind, setKind] = useState<'BAYAR' | 'REFUND'>('BAYAR');
  // TODO: POST /loan-payments
  return (
    <FormPage code="SCR-32" eyebrow="Keuangan" title="Pembayaran Peminjaman" subtitle="Pembayaran dilakukan di luar sistem; sistem hanya mencatat." onCancel={() => nav('/finance/cash')}>
      <Select no={1} label="Pengajuan Peminjaman" required hint="Hanya pengajuan dengan pemakaian fasilitas" options={['PJM-201126-004 — Budi Santoso · Aula + fasilitas', 'PJM-181126-003 — BEM FMIPA · Kursi Lipat (30)']} />
      <div className="space-y-1.5">
        <p className="field-label">Jenis Catatan <span className="text-rose-600">*</span></p>
        <Segmented value={kind} onChange={setKind} options={[{ value: 'BAYAR', label: 'Bayar' }, { value: 'REFUND', label: 'Refund' }]} />
      </div>
      <Input no={3} label="Nominal (Rp)" required inputMode="numeric" defaultValue="150.000" hint="Terisi otomatis dari tarif fasilitas (Pengaturan Sistem)" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input no={4} label="Tanggal" type="date" required defaultValue="2026-11-19" />
        <Input label="Metode" required defaultValue="Transfer BRI" />
      </div>
      <div className="space-y-1.5">
        <p className="field-label">Bukti</p>
        <FileDrop hint="PDF/JPG/PNG, maks 5 MB" />
      </div>
    </FormPage>
  );
}
