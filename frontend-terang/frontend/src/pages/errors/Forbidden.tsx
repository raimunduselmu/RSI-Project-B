import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="app-bg" />
      <span className="eyebrow">ERR-AUTH-03</span>
      <p className="font-display text-8xl text-ink">403</p>
      <p className="text-ink/75">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <Link to="/dashboard" className="mt-2 rounded-2xl bg-white px-5 py-2 text-sm font-medium text-ink">
        Kembali ke dashboard
      </Link>
    </div>
  );
}
