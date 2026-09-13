import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../services/api';

interface AuthContextValue {
  authenticated: boolean;
  checking: boolean;
  login: (password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api
      .verifyAuth()
      .then((r) => setAuthenticated(r.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (password: string) => {
    try {
      const r = await api.login(password);
      setAuthenticated(r.authenticated);
      return { ok: r.authenticated };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Login failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setAuthenticated(false);
    }
  }, []);

  const value = useMemo(() => ({ authenticated, checking, login, logout }), [authenticated, checking, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
