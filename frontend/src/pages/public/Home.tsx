// SCR-30 Beranda publik
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';

const LINKS = [
  { to: '/peminjaman', title: 'Peminjaman Ruang & Aset', desc: 'Ajukan peminjaman tanpa akun. Kode lacak dikirim ke email.' },
  { to: '/kegiatan', title: 'Daftar Kegiatan', desc: 'Lihat dan daftar kegiatan KMK yang sedang dibuka.' },
  { to: '/intensi', title: 'Intensi Misa', desc: 'Ajukan intensi untuk misa kampus.' },
  { to: '/pastoral', title: 'Pendampingan Pastoral', desc: 'Minta jadwal pendampingan atau konseling.' },
  { to: '/cek-status', title: 'Cek Status Pengajuan', desc: 'Masukkan kode lacak dan nomor telepon.' },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-brand-500 px-8 py-12 text-white">
        <h1 className="text-3xl text-white">Keluarga Mahasiswa Katolik UNS</h1>
        <p className="mt-2 max-w-xl text-brand-50">Layanan peminjaman, kegiatan, dan pelayanan umat dalam satu tempat.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to}>
            <Card className="h-full transition hover:border-brand-300">
              <h2>{l.title}</h2>
              <p className="mt-1 text-sm text-stone-500">{l.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
