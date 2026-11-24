// SCR-00 Beranda (FSD-2.0) — desain G (unik)
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';
import { Icon, type IconName } from '@/components/ui';

const SERVICES: { no: number; to: string; icon: IconName; title: string; desc: string; glow: string }[] = [
  { no: 3, to: '/calendar', icon: 'calendar', title: 'Cek Kalender', desc: 'Lihat ketersediaan ruangan dan aset Gereja Kampus.', glow: 'from-ember-400/50' },
  { no: 4, to: '/borrow', icon: 'clipboard', title: 'Ajukan Peminjaman', desc: 'Pinjam ruangan atau barang untuk kegiatan Anda.', glow: 'from-ember-400/40' },
  { no: 5, to: '/transparansi', icon: 'handHeart', title: 'Transparansi Donatur', desc: 'Ringkasan donasi dan aset hasil sumbangan.', glow: 'from-pink-400/40' },
  { no: 6, to: '/liturgy/schedule', icon: 'book', title: 'Jadwal Ibadah & Kegiatan', desc: 'Jadwal misa, ibadah, dan pendaftaran kegiatan.', glow: 'from-violet-400/40' },
  { no: 7, to: '/pastoral/intentions', icon: 'church', title: 'Ajukan Intensi / Pendampingan', desc: 'Permohonan misa intensi, konseling, atau kunjungan.', glow: 'from-brand-300/40' },
  { no: 8, to: '/status', icon: 'search', title: 'Cek Status', desc: 'Pantau pengajuan dengan kode lacak dan nomor HP.', glow: 'from-ember-300/40' },
];

export default function Home() {
  const servicesRef = useReveal<HTMLDivElement>();
  return (
    <div className="-mt-10">
      {/* hero */}
      <section className="relative flex min-h-[560px] flex-col items-center justify-center py-16 text-center">
        <div className="hero-glow anim-glow" />
        <span className="eyebrow anim-fade-up">Gereja Kampus Universitas Sebelas Maret</span>
        <h1 className="anim-fade-up mt-6 max-w-4xl [animation-delay:120ms] font-display text-5xl leading-[1.02] sm:text-7xl">
          Layanan Gereja Kampus,
          <br />
          dalam <em className="text-flux pr-2">satu tempat.</em>
        </h1>
        <p className="anim-fade-up mt-6 max-w-xl font-mono [animation-delay:240ms] text-[13px] leading-relaxed text-ink/70">
          Semua layanan di bawah ini dapat digunakan umat dan tamu tanpa login. Simpan kode pengajuan untuk mengecek status kapan saja.
        </p>


        {/* tombol bulat bercahaya */}
        <Link
          to="/borrow"
          className="anim-fade-up anim-float group relative mt-12 flex h-28 w-28 [animation-delay:360ms] flex-col items-center justify-center rounded-full border border-slate-900/[0.14] bg-white font-mono text-xs text-ink/90 backdrop-blur-xl transition hover:scale-105"
        >
          <span className="absolute inset-0 -z-10 rounded-full bg-ember-500/60 blur-2xl transition group-hover:bg-ember-400/80" />
          <span className="anim-ping-slow absolute inset-0 rounded-full border border-ember-300/60" />
          <span className="absolute -inset-3 rounded-full border border-slate-900/[0.08]" />
          <Icon name="sparkles" size={20} className="mb-1" />
          Ajukan
        </Link>
      </section>

      {/* layanan */}
      <section ref={servicesRef}>
        <p className="reveal eyebrow mb-5">Layanan Publik</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Link key={s.to} to={s.to} style={{ transitionDelay: `${i * 90}ms` }} className="reveal group relative rounded-[22px] bg-gradient-to-b from-transparent via-transparent to-ember-400/30 p-px">
              <div className={`absolute inset-0 -z-10 rounded-[22px] bg-gradient-to-b ${s.glow} to-transparent opacity-0 blur-xl transition group-hover:opacity-100`} />
              <div className="flex h-full flex-col rounded-[21px] bg-white/80 p-6 backdrop-blur-xl transition group-hover:bg-white/80">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-900/[0.08] bg-white text-ink transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:border-ember-300/50 group-hover:bg-ember-500/20 group-hover:text-ember-700 group-hover:shadow-soft">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <span className="font-mono text-[11px] text-ink/40">0{s.no - 2}</span>
                </div>
                <h2 className="mt-6 font-display text-2xl font-normal">{s.title}</h2>
                <p className="mt-1.5 text-sm text-ink/65">{s.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] text-ink/55 transition group-hover:text-ink">
                  Buka layanan <Icon name="arrowUpRight" size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
