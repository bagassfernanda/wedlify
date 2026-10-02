import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/src/lib/api';
import type { PublicUser } from '@/src/lib/models';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  setUser: (user: PublicUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Saat aplikasi dibuka, tanyakan ke server siapa pemilik cookie sesi ini.
  useEffect(() => {
    api<{ user: PublicUser | null }>('GET', '/auth/me').then((result) => {
      setUser(result.ok ? result.data.user : null);
      setLoading(false);
    });
  }, []);

  const logout = useCallback(async () => {
    await api('POST', '/auth/logout');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, setUser, logout }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }

  return context;
}
