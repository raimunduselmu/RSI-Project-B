// SCR-02 Ganti Password (FSD-2.3, BR-05, BR-06)
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Alert, Button, Card, Input } from '@/components/ui';

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
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <Card title="Ganti Password" className="w-full max-w-md">
        {user?.must_change_password && (
          <div className="mb-4"><Alert tone="warning">Anda wajib mengganti password sebelum melanjutkan.</Alert></div>
        )}
        {error && <div className="mb-4"><Alert tone="error">{error.message}</Alert></div>}
        <form onSubmit={submit} className="space-y-4">
          <Input label="Password lama" type="password" value={form.current_password} onChange={set('current_password')} required />
          <Input label="Password baru" type="password" value={form.new_password} onChange={set('new_password')} required hint="Minimal 8 karakter, mengandung huruf dan angka" error={error?.details?.new_password?.[0]} />
          <Input label="Ulangi password baru" type="password" value={form.confirm_password} onChange={set('confirm_password')} required error={error?.details?.confirm_password?.[0]} />
          <Button type="submit" loading={loading} className="w-full">Simpan</Button>
        </form>
      </Card>
    </div>
  );
}
