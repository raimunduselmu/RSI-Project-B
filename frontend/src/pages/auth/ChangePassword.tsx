// SCR-02 Ganti Password (FSD-2.3, BR-05, BR-06) — Template K
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/templates';
import { Alert, Button, Input } from '@/components/ui';

export default function ChangePassword() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.patch('/auth/password', form);
      await refresh();
      nav('/login', { replace: true });
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Ganti Password" subtitle="Password baru minimal 8 karakter, mengandung huruf dan angka.">
      <form onSubmit={submit} className="space-y-4">
        {user?.must_change_password && <Alert tone="warning">Anda wajib mengganti password sebelum melanjutkan.</Alert>}
        {error && <Alert tone="error">{error.message}</Alert>}
        <Input no={1} label="Password lama" type="password" value={form.current_password} onChange={set('current_password')} required />
        <Input no={2} label="Password baru" type="password" value={form.new_password} onChange={set('new_password')} required error={error?.details?.new_password?.[0]} />
        <Input no={3} label="Ulangi password baru" type="password" value={form.confirm_password} onChange={set('confirm_password')} required error={error?.details?.confirm_password?.[0]} />
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Simpan
        </Button>
      </form>
    </AuthLayout>
  );
}
