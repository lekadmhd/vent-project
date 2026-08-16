'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  createContext,
  useCallback,
  useContext,
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

const ADMIN_ROLES = ['support_admin', 'finance_admin', 'super_admin'];

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getStoredUser() as User | null;
    const storedToken = getToken();
    if (storedUser && storedToken && isAdminRole(storedUser.role)) {
      setUser(storedUser);
      setToken(storedToken);
    } else if (storedUser && storedToken && !isAdminRole(storedUser.role)) {
      // Regular user hitting admin panel -> clear and redirect
      localStorage.removeItem('aptrent_token');
      localStorage.removeItem('aptrent_user');
      router.replace('/login');
    }
    setLoading(false);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    const auth = await api<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (!isAdminRole(auth.user.role)) {
      throw new Error('Akses ditolak: akun ini bukan admin');
    }
    localStorage.setItem('aptrent_token', auth.access_token);
    localStorage.setItem('aptrent_user', JSON.stringify(auth.user));
    setUser(auth.user);
    setToken(auth.access_token);
    return auth.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aptrent_token');
    localStorage.removeItem('aptrent_user');
    setUser(null);
    setToken(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout],
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
