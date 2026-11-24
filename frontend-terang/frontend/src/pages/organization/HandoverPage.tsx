// SCR-24 Serah Terima Jabatan (FSD-2.26) — Template E
import { PageHeader } from '@/components/shared/PageHeader';
import { DecisionBox, Split } from '@/components/templates';
import { Alert, Badge, Card, InfoGrid, Select, Textarea } from '@/components/ui';

const CHECKLIST = [
  { label: '214 aset dan dokumen aset (laporan inventaris terlampir)', done: true },
  { label: '3 program kerja: Stock Opname, Perawatan AC, Pengadaan Kursi', done: true },
  { label: 'Dokumen: SOP Peminjaman v2, Kontrak Teknisi', done: true },
  { label: 'Kunci gudang dan ruang sound (serah terima fisik)', done: false },
];

export default function HandoverPage() {
  // TODO: POST /handovers, PATCH /handovers/:id/decision (hanya PHT)
  return (
    <>
      <PageHeader code="SCR-24" eyebrow="Kepengurusan" title="Serah Terima Jabatan" />
      <Split
        sideWidth={360}
        main={
          <Card title="Divisi Sarana Prasarana · 2025/2026 → 2026/2027">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 md:grid-cols-2">
                <Select no={1} label="Periode Asal / Tujuan" required options={['2025/2026 → 2026/2027']} hint="Periode tujuan tidak boleh ARSIP" />
                <Select no={2} label="Divisi" required options={['Sarana Prasarana', 'Keuangan', 'Liturgi', 'PHT']} />
              </div>
              <div className="space-y-2">
                <p className="field-label">
                  Daftar Serah Terima <span className="text-rose-600">*</span>
                </p>
                <div className="space-y-2 rounded-xl border border-slate-900/[0.08] bg-white p-4">
                  {CHECKLIST.map((c) => (
                    <label key={c.label} className="flex items-start gap-3 text-sm text-ink/90">
                      <input type="checkbox" className="check mt-0.5" defaultChecked={c.done} />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
              <Textarea no={4} label="Catatan" maxLength={255} rows={2} defaultValue="Kunci diserahkan langsung pada rapat pleno 25/11." />
            </form>
          </Card>
        }
        side={
          <Card title="Persetujuan PHT">
            <InfoGrid
              items={[
                { label: 'Diajukan oleh', value: 'Stefanus Raka (Sarpras 2025/2026)' },
                { label: 'Penerima', value: 'Fransiskus Adi' },
                { label: 'Status', value: <Badge status="MENUNGGU" /> },
              ]}
            />
            <div className="mt-5">
              <DecisionBox />
            </div>
            <div className="mt-4">
              <Alert tone="info">Setelah semua divisi selesai, periode 2025/2026 menjadi ARSIP (read-only) dan role pengurus lama dicabut.</Alert>
            </div>
          </Card>
        }
      />
    </>
  );
}
