// SCR-29 LPJ Kegiatan (FSD-2.31) — Template E
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusFlow } from '@/components/shared/Extras';
import { Split } from '@/components/templates';
import { Badge, Button, Card, FileDrop, StatCard, Textarea } from '@/components/ui';

export default function EventLpj() {
  // TODO: GET/POST /events/:id/lpj; jumlah hadir & realisasi dihitung otomatis oleh backend
  return (
    <>
      <PageHeader code="SCR-29" eyebrow="Kegiatan / Bakti Sosial Oktober" title="LPJ Kegiatan" actions={<Badge status="DIAJUKAN" />} />
      <Split
        main={
          <Card>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <Textarea
                no={1}
                label="Ringkasan Kegiatan"
                required
                maxLength={2000}
                rows={6}
                defaultValue="Bakti sosial di Panti Wreda Dharma Bakti diikuti 42 mahasiswa. Kegiatan meliputi pemeriksaan kesehatan, ibadah bersama, dan penyerahan bantuan sembako."
              />
              <div className="space-y-1.5">
                <p className="field-label">Lampiran</p>
                <FileDrop hint="PDF/JPG/PNG, maks 5 MB" />
              </div>
              <Button type="submit" icon="upload">Ajukan LPJ</Button>
            </form>
          </Card>
        }
        side={
          <>
            <StatCard no={2} label="Peserta Hadir (otomatis)" value="42 orang" sub="Dari presensi" tone="green" />
            <StatCard no={3} label="Realisasi Anggaran (otomatis)" value="Rp 3.870.000" sub="dari Rp 4.000.000" tone="brand" />
            <Card title="Tinjauan PHT">
              <StatusFlow steps={['DIAJUKAN', 'REVISI', 'DISETUJUI']} active="DIAJUKAN" />
            </Card>
          </>
        }
      />
    </>
  );
}
