import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h1>404</h1>
      <p className="text-stone-500">Halaman tidak ditemukan.</p>
      <Link to="/" className="text-brand-600">Kembali ke beranda</Link>
    </div>
  );
}
