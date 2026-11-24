// SCR-38 Dokumen & Arsip (FSD-2.40) — Template B (form di kiri)
import { TableFormPage } from '@/components/templates';
import { Badge, FileDrop, Input, Select } from '@/components/ui';

interface Doc {
  id: string;
  title: string;
  cat: string;
  number: string;
  cls: string;
  ver: string;
}

// TODO: ganti dengan useFetch<Doc[]>('/documents?q=') dan POST multipart
const DUMMY: Doc[] = [
  { id: '1', title: 'SK Kepengurusan 2026/2027', cat: 'SK', number: '012/SK/KMK/VIII/2026', cls: 'INTERNAL', ver: 'v1' },
  { id: '2', title: 'Proposal Retret Mahasiswa', cat: 'Proposal', number: '031/PRP/KMK/X/2026', cls: 'INTERNAL', ver: 'v3' },
  { id: '3', title: 'Notulen Rapat Pleno Okt', cat: 'Notulen', number: '—', cls: 'INTERNAL', ver: 'v1' },
  { id: '4', title: 'Akta Hibah Lahan Parkir', cat: 'Legal', number: '04/HBH/2019', cls: 'RAHASIA', ver: 'v1' },
];

export default function DocumentList() {
  return (
    <TableFormPage<Doc>
      code="SCR-38"
      eyebrow="Dokumen"
      title="Dokumen & Arsip"
      actions={<input className="field !w-72" placeholder="Cari judul, nomor, kata kunci…" />}
      formSide="left"
      formTitle="Unggah Dokumen"
      submitLabel="Unggah"
      form={
        <>
          <Input no={1} label="Judul Dokumen" required maxLength={150} defaultValue="SK Kepengurusan KMK UNS 2026/2027" />
          <Select no={2} label="Kategori" required options={['SK', 'Surat', 'Proposal', 'Notulen', 'Legal']} />
          <div className="grid grid-cols-[1.3fr_1fr] gap-3">
            <Input no={3} label="Nomor Dokumen" defaultValue="012/SK/KMK/VIII/2026" />
            <Input label="Tanggal" type="date" defaultValue="2026-08-01" />
          </div>
          <Select no={4} label="Kegiatan / Periode Terkait" options={['Periode 2026/2027', 'Retret Mahasiswa 2026', '—']} />
          <Select no={5} label="Klasifikasi" required options={['UMUM', 'INTERNAL', 'RAHASIA']} defaultValue="INTERNAL" />
          <div className="space-y-1.5">
            <p className="field-label">File <span className="text-rose-600">*</span></p>
            <FileDrop hint="PDF/JPG/PNG/DOCX, maks 10 MB" />
          </div>
        </>
      }
      listTitle="Arsip"
      rows={DUMMY}
      rowKey={(d) => d.id}
      columns={[
        { header: 'Judul', cell: (d) => <span className="font-medium text-ink">{d.title}</span> },
        { header: 'Kategori', cell: (d) => d.cat },
        { header: 'Nomor', cell: (d) => <span className="whitespace-nowrap font-mono text-[12px]">{d.number}</span> },
        { header: 'Klasifikasi', cell: (d) => <Badge status={d.cls} /> },
        { header: 'Versi', cell: (d) => d.ver },
        { header: '', align: 'right', cell: () => <button className="whitespace-nowrap font-mono text-xs text-ink/70 hover:text-ink">Unduh ↓</button> },
      ]}
    />
  );
}
