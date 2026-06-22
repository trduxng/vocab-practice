'use client';

import React, { useEffect } from "react";
import Sidebar from "@/src/components/shared/Sidebar";
import Topbar from "@/src/components/shared/Topbar";
import { useAuth } from "../context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/src/modules/auth/hooks/usePermissions";
import { PERMISSIONS, type PermissionCode } from "@/src/modules/auth/types/permissions";

const routePermissions: Array<{ prefix: string; anyOf: PermissionCode[] }> = [
  { prefix: "/creator/dashboard", anyOf: [PERMISSIONS.viewDashboard] },
  { prefix: "/creator/topics", anyOf: [PERMISSIONS.manageTopics] },
  { prefix: "/creator/words", anyOf: [PERMISSIONS.manageWords] },
  { prefix: "/creator/questions", anyOf: [PERMISSIONS.manageQuestions] },
  { prefix: "/creator/mini-tests", anyOf: [PERMISSIONS.manageTests] },
  { prefix: "/creator/media", anyOf: [PERMISSIONS.manageWords, PERMISSIONS.manageQuestions] },
  { prefix: "/creator/drafts", anyOf: [PERMISSIONS.submitContentReview] },
  { prefix: "/creator/pending", anyOf: [PERMISSIONS.submitContentReview] },
  { prefix: "/creator/rejected", anyOf: [PERMISSIONS.submitContentReview] },
  { prefix: "/creator/analytics", anyOf: [PERMISSIONS.viewContentAnalytics] },
];

const CreatorLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCreator, isAdmin, loading } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = routePermissions.find((route) => pathname.startsWith(route.prefix));
  const canAccessRoute = !currentRoute || hasAnyPermission(currentRoute.anyOf);
  const fallbackRoute = routePermissions.find((route) => hasAnyPermission(route.anyOf))?.prefix || (isAdmin ? "/admin/dashboard" : "/user/dashboard");

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      } else if (!isCreator && !isAdmin) {
        router.replace('/user/dashboard');
      } else if (!canAccessRoute) {
        router.replace(fallbackRoute);
      }
    }
  }, [loading, isAuthenticated, isCreator, isAdmin, canAccessRoute, fallbackRoute, pathname, router]);

  if (loading) {
    return <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-white font-mono">CREATOR ACCESS AUTHORIZING...</div>;
  }

  if (!isAuthenticated || (!isCreator && !isAdmin) || !canAccessRoute) return null;

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar role="creator" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Creator Studio" subtitle="Soạn nội dung, gửi duyệt và theo dõi trạng thái xuất bản." role="creator" />
        {children}
      </div>
    </div>
  );
};

export default CreatorLayout;
