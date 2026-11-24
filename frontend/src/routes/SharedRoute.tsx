import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Spinner } from '@/components/ui/Spinner';
import type { RoleName } from '@/lib/constants';

/**
 * Satu URL, dua tampilan (FSD v1.2: SCR-25, 27/28, 34, 35).
 * Pengurus dengan role yang sesuai → versi internal di layout pengurus.
 * Umat/tamu (tanpa login) atau pengurus tanpa role itu → versi publik.
 */
export function SharedRoute({ internal, publik, roles }: { internal: ReactNode; publik: ReactNode; roles?: RoleName[] }) {
  const { user, loading, hasRole } = useAuth();
  if (loading) return <Spinner full />;
  if (user && !user.must_change_password && (!roles || hasRole(...roles))) return <DashboardLayout>{internal}</DashboardLayout>;
  return <PublicLayout>{publik}</PublicLayout>;
}
