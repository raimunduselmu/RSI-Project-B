import { Link } from 'react-router-dom';
export default function Forbidden() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h1>403</h1>
      <p className="text-stone-500">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <Link to="/app" className="text-brand-600">Kembali ke dashboard</Link>
    </div>
  );
}
