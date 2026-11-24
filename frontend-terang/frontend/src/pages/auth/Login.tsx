// SCR-01 Login Page (FSD-2.1) — Template K
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { AuthLayout } from '@/components/templates';
import { Alert, Button, Input } from '@/components/ui';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(username, password);
      nav(u.must_change_password ? '/password/change' : loc.state?.from ?? '/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Masuk Pengurus" subtitle="Gunakan username dan password dari Admin.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <Input no={1} label="Username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus autoComplete="username" />
        <Input no={2} label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Masuk
        </Button>
        <p className="text-center text-sm text-ink/65">
          Lupa password? Hubungi Admin{' '}
          {/* TODO: ganti nomor dari pengaturan sistem (SCR-42) */}
          <a href="https://wa.me/" target="_blank" rel="noreferrer" className="rounded-md bg-emerald-400/15 px-1.5 py-0.5 font-mono text-[11px] text-emerald-600">
            wa.me
          </a>
        </p>
        <div className="border-t border-slate-900/[0.08] pt-4 text-center">
          <Link to="/" className="font-mono text-xs text-ink/60 hover:text-ink">
            ← Kembali ke Beranda
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
