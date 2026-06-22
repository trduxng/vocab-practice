'use client';

import React, { useEffect } from "react";
import Sidebar from "@/src/components/shared/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { ADMIN_ACCESS_PERMISSIONS } from "@/src/modules/auth/types/permissions";
import { usePermissions } from "@/src/modules/auth/hooks/usePermissions";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const router = useRouter();
  const canAccessAdmin = hasAnyPermission(ADMIN_ACCESS_PERMISSIONS);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!canAccessAdmin) {
        router.push('/user/dashboard');
      }
    }
  }, [loading, isAuthenticated, canAccessAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 font-mono text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950 dark:border-white/20 dark:border-t-white" />
          <p className="mt-4 text-sm font-bold">ADMIN ACCESS AUTHORIZING...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !canAccessAdmin) {
    return null;
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default AdminLayout;
