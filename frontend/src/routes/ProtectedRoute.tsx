import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

/** Wajib login. Akun yang wajib ganti password diarahkan ke /ganti-password (BR-06). */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (user.must_change_password && loc.pathname !== '/ganti-password') return <Navigate to="/ganti-password" replace />;
  return <Outlet />;
}
