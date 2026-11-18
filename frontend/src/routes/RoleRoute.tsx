import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { RoleName } from '@/lib/constants';

/** Batasi halaman untuk role tertentu (Admin selalu boleh). */
export function RoleRoute({ roles }: { roles: RoleName[] }) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? <Outlet /> : <Navigate to="/403" replace />;
}
