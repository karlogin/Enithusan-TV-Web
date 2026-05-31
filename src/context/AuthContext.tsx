import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, loginUser, logoutUser, registerUser, setAuthToken } from '../api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(({ user: u }) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await loginUser(email, password);
    setAuthToken(token);
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { token, user: u } = await registerUser(email, password, name);
    setAuthToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      /* ignore */
    }
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
