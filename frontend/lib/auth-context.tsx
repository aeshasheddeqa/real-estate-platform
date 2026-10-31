'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { API_URL, parseError } from './api';

export type User = { id: string; name: string; email: string; phone?: string | null };

type RegisterData = { name: string; email: string; phone?: string; password: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null); // access token lives in memory only

  const refresh = useCallback(async (): Promise<string | null> => {
    const res = await fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) {
      tokenRef.current = null;
      return null;
    }
    const data = await res.json();
    tokenRef.current = data.accessToken;
    return data.accessToken;
  }, []);

  // fetch with the Bearer token; on 401 refresh once and retry
  const authFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const send = (token: string | null) =>
        fetch(`${API_URL}${path}`, {
          ...init,
          credentials: 'include',
          headers: {
            ...(init.headers as Record<string, string>),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      let res = await send(tokenRef.current);
      if (res.status === 401) {
        const fresh = await refresh();
        if (fresh) res = await send(fresh);
      }
      return res;
    },
    [refresh]
  );

  // on page load: restore the session from the refresh cookie
  useEffect(() => {
    (async () => {
      const token = await refresh();
      if (token) {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setUser(await res.json());
      }
      setLoading(false);
    })();
  }, [refresh]);

  const sendAuth = async (path: string, body: object) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await parseError(res));
    const data = await res.json();
    tokenRef.current = data.accessToken;
    setUser(data.user);
  };

  const login = (email: string, password: string) => sendAuth('/api/auth/login', { email, password });
  const register = (data: RegisterData) => sendAuth('/api/auth/register', data);

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    tokenRef.current = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}