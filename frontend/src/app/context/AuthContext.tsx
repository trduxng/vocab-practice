'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/src/services/auth.service';
import type { PermissionCode } from '@/src/modules/auth/types/permissions';
import { hasPermission as userHasPermission } from '@/src/modules/auth/utils/permissions';

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
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  permissions: PermissionCode[];
  hasPermission: (code: PermissionCode) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parsePermissionsFromToken(token: string): PermissionCode[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Array.isArray(payload.permissions) ? payload.permissions : [];
  } catch {
    return [];
  }
}

function readStoredAuth(): { user: User | null; token: string | null; permissions: PermissionCode[] } {
  if (typeof window === 'undefined') {
    return { user: null, token: null, permissions: [] };
  }

  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!savedToken || !savedUser) {
    return { user: null, token: null, permissions: [] };
  }

  try {
    return {
      user: JSON.parse(savedUser) as User,
      token: savedToken,
      permissions: parsePermissionsFromToken(savedToken),
    };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { user: null, token: null, permissions: [] };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuth] = useState(readStoredAuth);
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionCode[]>(initialAuth.permissions);
  const router = useRouter();

  const login = async (data: { email: string; password: string }) => {
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

  const hasPermission = (code: PermissionCode): boolean => userHasPermission(permissions, code);

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
