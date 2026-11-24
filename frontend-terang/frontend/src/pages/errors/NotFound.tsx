import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="app-bg" />
      <span className="eyebrow">Tidak ditemukan</span>
      <p className="font-display text-8xl text-ink">404</p>
      <p className="text-ink/75">Halaman tidak ditemukan.</p>
      <Link to="/" className="mt-2 rounded-2xl bg-white px-5 py-2 text-sm font-medium text-ink">
        Kembali ke beranda
      </Link>
    </div>
  );
}
