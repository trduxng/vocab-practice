'use client';

import React, { useEffect } from "react";
import Sidebar from "@/src/components/shared/Sidebar";
import { useAuth } from "../context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_ACCESS_PERMISSIONS, PERMISSIONS, type PermissionCode } from "@/src/modules/auth/types/permissions";
import { usePermissions } from "@/src/modules/auth/hooks/usePermissions";

const routePermissions: Array<{ prefix: string; anyOf: PermissionCode[] }> = [
  { prefix: "/admin/dashboard", anyOf: [PERMISSIONS.viewDashboard] },
  { prefix: "/admin/words", anyOf: [PERMISSIONS.manageWords] },
  { prefix: "/admin/questions", anyOf: [PERMISSIONS.manageQuestions] },
  { prefix: "/admin/minitests", anyOf: [PERMISSIONS.manageTests] },
  { prefix: "/admin/students", anyOf: [PERMISSIONS.manageUsers] },
  { prefix: "/admin/reports", anyOf: [PERMISSIONS.manageReports, PERMISSIONS.manageSystemSettings] },
  { prefix: "/admin/audit-logs", anyOf: [PERMISSIONS.viewAuditLogs, PERMISSIONS.manageSystemSettings, PERMISSIONS.manageUsers] },
  { prefix: "/admin/notifications", anyOf: [PERMISSIONS.manageNotifications] },
  { prefix: "/admin/analytics", anyOf: [PERMISSIONS.viewAnalytics, PERMISSIONS.viewDashboard] },
  { prefix: "/admin/content-review", anyOf: [PERMISSIONS.reviewContent, PERMISSIONS.publishContent, PERMISSIONS.manageSystemSettings] },
  { prefix: "/admin/courses", anyOf: [PERMISSIONS.manageTopics, PERMISSIONS.manageWords] },
  { prefix: "/admin/topic-categories", anyOf: [PERMISSIONS.manageTopicCategories, PERMISSIONS.manageTopics] },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const canAccessAdmin = hasAnyPermission(ADMIN_ACCESS_PERMISSIONS);
  const currentRoute = routePermissions.find((route) => pathname.startsWith(route.prefix));
  const canAccessRoute = !currentRoute || hasAnyPermission(currentRoute.anyOf);
  const fallbackAdminRoute = routePermissions.find((route) => hasAnyPermission(route.anyOf))?.prefix || "/user/dashboard";

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      } else if (!isAdmin || !canAccessAdmin) {
        router.replace('/user/dashboard');
      } else if (!canAccessRoute) {
        router.replace(fallbackAdminRoute);
      }
    }
  }, [loading, isAuthenticated, isAdmin, canAccessAdmin, canAccessRoute, fallbackAdminRoute, pathname, router]);

  if (loading) {
    return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white font-mono">ĐANG XÁC THỰC QUYỀN QUẢN TRỊ...</div>;
  }

  if (!isAuthenticated || !isAdmin || !canAccessAdmin || !canAccessRoute) return null;

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

export default AdminLayout;
