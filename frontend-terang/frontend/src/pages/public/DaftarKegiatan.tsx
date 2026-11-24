// SCR-28 Pendaftaran Kegiatan — versi publik (FSD-2.30) — Template H
// /events            → daftar kegiatan terbuka
// /events/:id/participants → detail kegiatan + form pendaftaran
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PublicFormPage, TrackingCode } from '@/components/templates';
import { Alert, Badge, Button, Icon, InfoGrid, Input } from '@/components/ui';

// TODO: ganti dengan useFetch('/public/events') dan POST /public/events/:id/registrations
const EVENTS = [
  { id: '1', kind: 'Kegiatan Rohani', name: 'Retret Mahasiswa 2026', tagline: '"Berakar dan Bertumbuh" — dua hari retret bagi mahasiswa Katolik UNS, didampingi Pastor Kampus.', date: 'Sabtu–Minggu, 5–6 Des 2026', place: 'Rumah Retret Sangkal Putung, Klaten', quota: '80 peserta · sisa 23', deadline: '1 Desember 2026' },
  { id: '4', kind: 'Kegiatan Sosial', name: 'Natal Bersama KMK UNS 2026', tagline: 'Perayaan Natal bersama umat kampus, alumni, dan keluarga.', date: 'Sabtu, 19 Des 2026', place: 'Aula Gereja Kampus', quota: '200 peserta · sisa 112', deadline: '15 Desember 2026' },
];

export default function DaftarKegiatan() {
  const { id } = useParams();
  const [done, setDone] = useState(false);
  const ev = EVENTS.find((e) => e.id === id);

  if (!ev) {
    return (
      <div>
        <div className="mb-8">
          <span className="eyebrow">Layanan publik</span>
          <h1 className="mt-2">Kegiatan</h1>
          <p className="mt-1.5 text-sm text-ink/75">Daftar tanpa login. Kode REG dikirim untuk Cek Status atau pembatalan.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {EVENTS.map((e) => (
            <Link key={e.id} to={`/events/${e.id}/participants`} className="glass group block p-6 transition hover:-translate-y-0.5 hover:border-slate-900/[0.08]">
              <Badge status="TERBIT" label={e.kind} tone="blue" />
              <h2 className="mt-4 font-display text-3xl font-normal">{e.name}</h2>
              <p className="mt-2 text-sm text-ink/65">{e.tagline}</p>
              <div className="mt-5 flex flex-wrap gap-4 font-mono text-[11.5px] text-ink/60">
                <span className="flex items-center gap-1.5"><Icon name="calendar" size={14} /> {e.date}</span>
                <span className="flex items-center gap-1.5"><Icon name="users" size={14} /> {e.quota}</span>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-ink/70 group-hover:text-ink">
                Daftar <Icon name="arrowRight" size={13} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <PublicFormPage
      code="SCR-28"
      title={ev.name}
      subtitle={ev.tagline}
      aside={
        <div className="glass p-5">
          <span className="rounded-full border border-slate-900/[0.08] px-2 py-0.5 font-mono text-[10px] text-ink/55">PUBLIK · TANPA LOGIN</span>
          <h2 className="mt-3">Daftar Kegiatan</h2>
          {done ? (
            <div className="mt-4 space-y-3">
              <Alert tone="success" title="Pendaftaran berhasil">Simpan kode ini untuk Cek Status atau pembatalan.</Alert>
              <TrackingCode code="REG-201126-031" />
              <Link to="/status" className="inline-block font-mono text-xs text-brand-700 hover:text-ink">Cek Status →</Link>
            </div>
          ) : (
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
            >
              <Input no={1} label="Nama Peserta" required maxLength={100} defaultValue="Maria Anindita" />
              <Input no={2} label="Telepon" required inputMode="tel" defaultValue="085712345678" />
              <Input no={3} label="Email" type="email" hint="Opsional — untuk konfirmasi dan pengingat H-1" defaultValue="anindita@student.uns.ac.id" />
              <Button type="submit" variant="brand" className="w-full">Daftar</Button>
            </form>
          )}
        </div>
      }
    >
      <Badge status="TERBIT" label={ev.kind} tone="blue" />
      <div className="mt-5">
        <InfoGrid
          items={[
            { label: 'Tanggal', value: ev.date },
            { label: 'Tempat', value: ev.place },
            { label: 'Kuota', value: ev.quota },
            { label: 'Batas Pendaftaran', value: ev.deadline },
          ]}
        />
      </div>
      <div className="mt-6 border-t border-slate-900/[0.08] pt-5">
        <Link to="/events" className="font-mono text-xs text-ink/60 hover:text-ink">← Semua kegiatan</Link>
      </div>
    </PublicFormPage>
  );
}
