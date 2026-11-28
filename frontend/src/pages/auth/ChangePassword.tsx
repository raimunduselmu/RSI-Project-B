
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

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [error, setError] = useState<ApiError | null>(null);
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [key]: event.target.value,
      }));
      setValidationError('');
      setError(null);
    };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setError(null);
    setValidationError('');

    if (
      !form.current_password ||
      !form.new_password ||
      !form.confirm_password
    ) {
      setValidationError('Semua kolom wajib diisi.');
      return;
    }

    if (form.new_password.length < 8) {
      setValidationError(
        'Password minimal 8 karakter dengan 1 huruf kapital dan 1 angka.',
      );
      return;
    }

    if (!/[A-Z]/.test(form.new_password)) {
      setValidationError(
        'Password baru harus memiliki minimal 1 huruf kapital.',
      );
      return;
    }

    if (!/[0-9]/.test(form.new_password)) {
      setValidationError(
        'Password baru harus memiliki minimal 1 angka.',
      );
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setValidationError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      await api.patch('/auth/password', form);

      // Muat ulang data pengguna setelah password berhasil diganti.
      await refresh();

      // FSD v1.2: pengguna diarahkan ke Dashboard.
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Ganti Password"
      subtitle="Gunakan password baru minimal 8 karakter, mengandung 1 huruf kapital dan 1 angka."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Akun yang sedang digunakan
          </p>

          <p className="font-semibold text-stone-900">
            {user?.full_name ?? 'Pengguna'}
          </p>

          <p className="text-sm text-stone-600">
            Username: {user?.username ?? '-'}
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {user?.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-700"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {user?.must_change_password && (
          <Alert tone="warning">
            Password Anda telah direset oleh Admin. Silakan ganti password
            sementara sebelum mengakses fitur lainnya.
          </Alert>
        )}

        {validationError && (
          <Alert tone="error">
            {validationError}
          </Alert>
        )}

        {error && (
          <Alert tone="error">
            {error.message}
          </Alert>
        )}

        <form onSubmit={submit} className="space-y-4">
          <Input
            no={1}
            label="Password Saat Ini / Sementara"
            type="password"
            value={form.current_password}
            onChange={set('current_password')}
            required
            placeholder="Masukkan password saat ini"
          />

          <Input
            no={2}
            label="Password Baru"
            type="password"
            value={form.new_password}
            onChange={set('new_password')}
            required
            placeholder="Masukkan password baru"
            hint="Minimal 8 karakter, 1 huruf kapital, dan 1 angka."
            error={error?.details?.new_password?.[0]}
          />

          <Input
            no={3}
            label="Konfirmasi Password Baru"
            type="password"
            value={form.confirm_password}
            onChange={set('confirm_password')}
            required
            placeholder="Ulangi password baru"
            error={error?.details?.confirm_password?.[0]}
          />

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            Simpan Password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
