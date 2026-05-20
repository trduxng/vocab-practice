'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/src/services/auth.service';

interface User {
  id: string | number;
  fullName: string;
  email: string;
  role: 'Learner' | 'ContentCreator' | 'Admin';
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  permissions: string[];
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parsePermissionsFromToken(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Array.isArray(payload.permissions) ? payload.permissions : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Initial load from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setPermissions(parsePermissionsFromToken(savedToken));
    }
    setLoading(false);
  }, []);

  const login = async (data: any) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setToken(response.token);
      setUser(response.user);
      setPermissions(parsePermissionsFromToken(response.token));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (code: string): boolean => permissions.includes(code);

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setPermissions([]);
    router.replace('/login');
    router.refresh();
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'Admin',
    isCreator: user?.role === 'ContentCreator',
    permissions,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
