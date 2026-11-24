// SCR-42 Pengaturan Sistem (FSD-2.45) — Template D
import { PageHeader } from '@/components/shared/PageHeader';
import { QrPlaceholder } from '@/components/shared/Extras';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('Admin');
  // TODO: GET/PUT /settings — setiap perubahan tercatat di audit log
  return (
    <>
      <PageHeader code="SCR-42" eyebrow="Administrasi" title="Pengaturan Sistem" subtitle="Parameter dibaca saat runtime — tidak ada nilai hardcode. Setiap perubahan tercatat di audit log." />
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Card title="Pembayaran">
            <p className="-mt-2 mb-4 text-xs text-ink/55">Admin dan Bendahara</p>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <p className="field-label">Gambar QRIS KMK <span className="text-rose-600">*</span></p>
                <div className="flex items-center gap-4">
                  <QrPlaceholder seed="QRIS-KMK" size={96} />
                  <label className="flex h-24 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-900/[0.08] text-center text-sm text-ink/80 hover:border-brand-300/50">
                    Ganti gambar QRIS
                    <span className="text-xs text-ink/50">JPG/PNG, maks 5 MB</span>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" />
                  </label>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input no={2} label="Tarif Kas Bulanan (Rp)" required inputMode="numeric" defaultValue="25.000" />
                <Input no={3} label="Tarif Fasilitas Peminjaman (Rp)" required inputMode="numeric" defaultValue="150.000" />
              </div>
            </div>
          </Card>
          <Card title="Kontak & Templat WhatsApp" className={isAdmin ? '' : 'opacity-60'}>
            <p className="-mt-2 mb-4 text-xs text-ink/55">Hanya Admin</p>
            <fieldset disabled={!isAdmin} className="space-y-5">
              <div className="space-y-1.5">
                <p className="field-label">Nomor WhatsApp Admin / Bendahara / Sarpras <span className="text-rose-600">*</span></p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input className="field" defaultValue="6281234500001" />
                  <input className="field" defaultValue="6281234500011" />
                  <input className="field" defaultValue="6281234500021" />
                </div>
              </div>
              <Select no={5} label="Templat Pesan wa.me" required options={['WA_TEMPLATE_KAS_CASH', 'WA_TEMPLATE_LOAN_CONFIRM', 'WA_TEMPLATE_LITURGY_DUTY']} />
              <Textarea rows={3} maxLength={500} defaultValue="Halo Bendahara KMK, saya {nama} ingin membayar iuran kas secara tunai untuk pengajuan {kode}. Kapan bisa bertemu?" hint="Placeholder: {nama}, {kode}, {tanggal} · maks 500 karakter" />
            </fieldset>
          </Card>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" icon="arrowUpRight">Uji Tautan</Button>
          <Button type="submit" variant="brand">Simpan Perubahan</Button>
        </div>
      </form>
    </>
  );
}
