// SCR-01 Login (FSD-2.1)
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
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
      nav(u.must_change_password ? '/ganti-password' : loc.state?.from ?? '/app', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <div>
          <h1>Masuk</h1>
          <p className="text-sm text-stone-500">Khusus Admin, pengurus, dan Pastor</p>
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <Input label="Username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <Input label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" loading={loading} className="w-full">Masuk</Button>
        <p className="text-center text-xs text-stone-500">
          Lupa password? Hubungi Admin. · <Link to="/" className="text-brand-600">Kembali ke beranda</Link>
        </p>
      </form>
    </div>
  );
}
