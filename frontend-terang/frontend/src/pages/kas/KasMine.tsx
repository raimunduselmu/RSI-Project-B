// SCR-40 Pembayaran Iuran Kas (FSD-2.43) — Template D
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { QrPlaceholder, WaLink } from '@/components/shared/Extras';
import { Split } from '@/components/templates';
import { Badge, Button, Card, FileDrop, Segmented, StatCard, Textarea } from '@/components/ui';
import { cn, rupiah } from '@/lib/format';

// TODO: status bulan dari GET /kas/mine; tarif & QRIS & nomor dari /settings
const TARIF = 25000;
const MONTHS = [
  { m: 'Agustus 2026', s: 'LUNAS' },
  { m: 'September 2026', s: 'LUNAS' },
  { m: 'Oktober 2026', s: 'BELUM_LUNAS' },
  { m: 'November 2026', s: 'BELUM_LUNAS' },
  { m: 'Desember 2026', s: 'BELUM_LUNAS' },
];

export default function KasMine() {
  const [picked, setPicked] = useState<string[]>(['Oktober 2026', 'November 2026']);
  const [method, setMethod] = useState<'QRIS' | 'CASH'>('QRIS');
  const toggle = (m: string) => setPicked((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));

  return (
    <>
      <PageHeader code="SCR-40" eyebrow="Keuangan" title="Pembayaran Iuran Kas" subtitle="Wajib bagi pengurus aktif periode 2026/2027. Tanpa cicilan." />
      <Split
        sideFirst
        sideWidth={320}
        side={
          <Card title="Status Bulan" no={1}>
            <ul className="space-y-3">
              {MONTHS.map((x) => (
                <li key={x.m} className="flex items-center justify-between text-sm">
                  <span className="text-ink/90">{x.m}</span>
                  <Badge status={x.s} />
                </li>
              ))}
            </ul>
          </Card>
        }
        main={
          <Card title="Bayar Iuran">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <p className="field-label">Pilih Bulan <span className="text-rose-600">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {MONTHS.filter((x) => x.s === 'BELUM_LUNAS').map((x) => (
                    <button
                      key={x.m}
                      type="button"
                      onClick={() => toggle(x.m)}
                      className={cn('rounded-full border px-4 py-1.5 text-sm transition', picked.includes(x.m) ? 'border-brand-300/60 bg-brand-400/20 text-ink' : 'border-slate-900/[0.08] text-ink/70 hover:text-ink')}
                    >
                      {picked.includes(x.m) ? '✓ ' : ''}
                      {x.m}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink/55">Hanya bulan BELUM_LUNAS pada periode aktif, termasuk tunggakan</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard no={3} label="Tarif per Bulan" value={rupiah(TARIF)} />
                <StatCard no={4} label="Total Bayar" value={rupiah(TARIF * picked.length)} sub={`${picked.length} bulan × ${rupiah(TARIF)}`} tone="brand" />
              </div>
              <div className="space-y-1.5">
                <p className="field-label">Metode Pembayaran <span className="text-rose-600">*</span></p>
                <Segmented value={method} onChange={setMethod} options={[{ value: 'QRIS', label: 'QRIS' }, { value: 'CASH', label: 'Cash' }]} />
              </div>
              {method === 'QRIS' ? (
                <div className="flex items-center gap-5 rounded-xl border border-slate-900/[0.08] bg-white p-4">
                  <QrPlaceholder seed="QRIS-KMK" size={130} />
                  <div>
                    <p className="font-medium text-ink">QRIS KMK UNS</p>
                    <p className="mt-1 text-sm text-ink/65">Scan, bayar {rupiah(TARIF * picked.length)}, lalu unggah bukti transfer.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-900/[0.08] bg-white p-4">
                  <p className="mb-3 text-sm text-ink/80">Buat janji temu dengan Bendahara untuk membayar tunai:</p>
                  <WaLink phone="6281234500011" label="Buat janji temu Bendahara" text="Halo Bendahara KMK, saya ingin membayar iuran kas secara tunai." />
                  <p className="mt-2 text-xs text-ink/55">Unggah foto bukti pertemuan setelah membayar.</p>
                </div>
              )}
              <div className="space-y-1.5">
                <p className="field-label">Bukti Pembayaran <span className="text-rose-600">*</span></p>
                <FileDrop hint={method === 'QRIS' ? 'Bukti transfer QRIS — PDF/JPG/PNG, maks 5 MB' : 'Foto pertemuan — PDF/JPG/PNG, maks 5 MB'} />
              </div>
              <Textarea no={9} label="Catatan" placeholder="Opsional" maxLength={255} rows={2} />
              <Button type="submit" variant="brand" disabled={!picked.length}>
                Kirim Pengajuan
              </Button>
            </form>
          </Card>
        }
      />
    </>
  );
}
