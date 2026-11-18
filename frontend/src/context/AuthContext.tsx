import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { RoleName } from '@/lib/constants';

export interface User {
  id: string;
  username: string;
  full_name: string;
  roles: RoleName[];
  must_change_password: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasRole: (...roles: RoleName[]) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await api.get<User>('/auth/me'));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (username: string, password: string) => {
    const { user } = await api.post<{ user: User }>('/auth/login', { username, password });
    setUser(user);
    return user;
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => undefined);
    setUser(null);
  };

  const hasRole = (...roles: RoleName[]) =>
    !!user && (user.roles.includes('Admin') || roles.some((r) => user.roles.includes(r)));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, hasRole }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
