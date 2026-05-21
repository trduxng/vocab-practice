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
    return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white font-mono">ADMIN ACCESS AUTHORIZING...</div>;
  }

  if (!isAuthenticated || !canAccessAdmin) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default AdminLayout;
