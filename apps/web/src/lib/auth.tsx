'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, getStoredUser, getToken } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  kyc_status: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser() as User | null;
    const storedToken = getToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const persist = useCallback((auth: { access_token: string; user: User }) => {
    localStorage.setItem('aptrent_token', auth.access_token);
    localStorage.setItem('aptrent_user', JSON.stringify(auth.user));
    setUser(auth.user);
    setToken(auth.access_token);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const auth = await api<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      persist(auth);
      return auth.user;
    },
    [persist],
  );

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone: string; role?: string }) => {
      const auth = await api<{ access_token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: data,
      });
      persist(auth);
      return auth.user;
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('aptrent_token');
    localStorage.removeItem('aptrent_user');
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
