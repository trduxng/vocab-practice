"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useIsDesktop, useIsMobile } from "@/src/hooks/useMediaQuery";
import { X } from "lucide-react";
import { useAuth } from "@/src/app/context/AuthContext";
import { usePermissions } from "@/src/modules/auth/hooks/usePermissions";
import { PERMISSIONS, type PermissionCode } from "@/src/modules/auth/types/permissions";
import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit3,
  FileQuestion,
  FileText,
  Flag,
  Heart,
  History,
  Home,
  Image,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

type NavLink = {
  icon: ElementType;
  label: string;
  href: string;
  anyOf?: PermissionCode[];
};

const adminLinks: NavLink[] = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/admin/dashboard", anyOf: [PERMISSIONS.viewDashboard] },
  { icon: Users, label: "Người dùng", href: "/admin/students", anyOf: [PERMISSIONS.manageUsers] },
  { icon: ClipboardList, label: "Nội dung", href: "/admin/courses", anyOf: [PERMISSIONS.manageTopics, PERMISSIONS.manageWords] },
  { icon: ShieldCheck, label: "Duyệt nội dung", href: "/admin/content-review", anyOf: [PERMISSIONS.reviewContent, PERMISSIONS.publishContent, PERMISSIONS.manageSystemSettings] },
  { icon: Flag, label: "Báo cáo", href: "/admin/reports", anyOf: [PERMISSIONS.manageReports, PERMISSIONS.manageSystemSettings] },
  { icon: BookOpen, label: "Danh mục chủ đề", href: "/admin/topic-categories", anyOf: [PERMISSIONS.manageTopicCategories, PERMISSIONS.manageTopics] },
  { icon: BarChart3, label: "Phân tích", href: "/admin/analytics", anyOf: [PERMISSIONS.viewAnalytics, PERMISSIONS.viewDashboard] },
  { icon: History, label: "Nhật ký hệ thống", href: "/admin/audit-logs", anyOf: [PERMISSIONS.viewAuditLogs, PERMISSIONS.manageSystemSettings, PERMISSIONS.manageUsers] },
  { icon: Bell, label: "Thông báo", href: "/admin/notifications", anyOf: [PERMISSIONS.manageNotifications] },
  { icon: BookOpen, label: "Từ vựng", href: "/admin/words", anyOf: [PERMISSIONS.manageWords] },
  { icon: FileQuestion, label: "Câu hỏi", href: "/admin/questions", anyOf: [PERMISSIONS.manageQuestions] },
  { icon: ListChecks, label: "Bài kiểm tra", href: "/admin/minitests", anyOf: [PERMISSIONS.manageTests] },
];

const creatorLinks: NavLink[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/creator/dashboard", anyOf: [PERMISSIONS.viewDashboard] },
  { icon: BookOpen, label: "Chủ đề", href: "/creator/topics", anyOf: [PERMISSIONS.manageTopics] },
  { icon: FileText, label: "Từ vựng", href: "/creator/words", anyOf: [PERMISSIONS.manageWords] },
  { icon: FileQuestion, label: "Câu hỏi", href: "/creator/questions", anyOf: [PERMISSIONS.manageQuestions] },
  { icon: ListChecks, label: "Bài test", href: "/creator/mini-tests", anyOf: [PERMISSIONS.manageTests] },
  { icon: Image, label: "Media", href: "/creator/media" },
  { icon: Edit3, label: "Bản nháp", href: "/creator/drafts" },
  { icon: Clock, label: "Chờ duyệt", href: "/creator/pending" },
  { icon: XCircle, label: "Bị từ chối", href: "/creator/rejected" },
  { icon: BarChart3, label: "Phân tích", href: "/creator/analytics", anyOf: [PERMISSIONS.viewAnalytics, PERMISSIONS.viewDashboard] },
];

const studentLinks: NavLink[] = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/user/dashboard" },
  { icon: BookOpen, label: "Lộ trình", href: "/user/courses" },
  { icon: Brain, label: "Học theo chủ đề", href: "/user/learn" },
  { icon: Target, label: "Luyện tập", href: "/user/practice" },
  { icon: FileText, label: "Bài kiểm tra", href: "/user/minitests" },
  { icon: Heart, label: "Sổ tay", href: "/user/notebook" },
  { icon: Trophy, label: "Thành tích", href: "/user/achievements" },
  { icon: BarChart3, label: "Tiến độ", href: "/user/progress" },
  { icon: Settings, label: "Cài đặt", href: "/user/settings" },
];

function NavLinks({ links, collapsed, onLinkClick }: { links: NavLink[]; collapsed: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={`group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            } ${collapsed ? "justify-center" : "md:justify-start"} ${onLinkClick ? "justify-start" : "justify-center"}`}
            title={collapsed ? link.label : undefined}
          >
            <link.icon className="h-4 w-4 shrink-0" />
            <span className={`${collapsed ? "hidden" : "hidden md:inline"}`}>{link.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar({ role }: { role: "admin" | "creator" | "student" }) {
  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse based on viewport
  useEffect(() => {
    if (isDesktop) {
      setCollapsed(false);
      setMobileOpen(false);
    } else if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(true);
    }
  }, [isDesktop, isMobile]);
  const { logout } = useAuth();
  const router = useRouter();
  const { hasAnyPermission } = usePermissions();
  const goHome = useCallback(() => {
    router.push('/');
  }, [router]);
  const baseLinks = role === "admin" ? adminLinks : role === "creator" ? creatorLinks : studentLinks;
  const links = baseLinks.filter((link) => !link.anyOf?.length || hasAnyPermission(link.anyOf));

  const sidebarContent = (
    <>
      <div
        className={`flex h-16 items-center gap-3 border-b border-slate-200 px-4 dark:border-white/10 ${
          collapsed ? "justify-center" : "justify-center md:justify-start"
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <BookOpen className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="hidden md:block">
            <p className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">VocaBoost</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Học từ vựng TOEIC</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="mx-3 mt-3 hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 md:flex dark:border-white/10 dark:bg-white/5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {role === "admin" ? "Khu vực quản trị" : role === "creator" ? "Khu vực tạo nội dung" : "Khu vực học tập"}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Truy cập theo quyền hạn</p>
          </div>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
        <Suspense
          fallback={
            <div className="space-y-2">
              {links.map((link) => (
                <div key={link.href} className="h-10 rounded-md bg-slate-100 dark:bg-white/5" />
              ))}
            </div>
          }
        >
          <NavLinks links={links} collapsed={collapsed} />
        </Suspense>
      </nav>

      <div className="border-t border-slate-200 p-2 dark:border-white/10 space-y-1">
        <button
          type="button"
          onClick={goHome}
          className="flex h-10 w-full items-center justify-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 md:justify-start dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          title="Về trang chủ"
        >
          <Home className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="hidden md:inline">Về trang chủ</span>}
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex h-10 w-full items-center justify-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 md:justify-start dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
          title="Đăng xuất"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="hidden md:inline">Đăng xuất</span>}
        </button>
      </div>
    </>
  );

  // Mobile: render as floating overlay sidebar
  if (isMobile) {
    return (
      <>
        {/* Sidebar toggle button for mobile */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900"
          aria-label="Mở menu"
        >
          <BookOpen className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar panel */}
        <aside
          className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 dark:border-white/10">
            <div className="flex h-16 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">VocaBoost</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Học từ vựng TOEIC</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {role === "admin" ? "Khu vực quản trị" : role === "creator" ? "Khu vực tạo nội dung" : "Khu vực học tập"}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Truy cập theo quyền hạn</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
            <Suspense
              fallback={
                <div className="space-y-2">
                  {links.map((link) => (
                    <div key={link.href} className="h-10 rounded-md bg-slate-100 dark:bg-white/5" />
                  ))}
                </div>
              }
            >
              <NavLinks links={links} collapsed={false} onLinkClick={() => setMobileOpen(false)} />
            </Suspense>
          </nav>

          <div className="border-t border-slate-200 p-2 dark:border-white/10 space-y-1">
            <button
              type="button"
              onClick={() => { goHome(); setMobileOpen(false); }}
              className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Về trang chủ</span>
            </button>
            <button
              type="button"
              onClick={() => { logout(); setMobileOpen(false); }}
              className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>
      </>
    );
  }

  // Desktop / Tablet: render inline sidebar with auto-collapse
  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white/95 backdrop-blur transition-all duration-300 dark:border-white/10 dark:bg-slate-950/90 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {sidebarContent}

      {/* Toggle collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-slate-950 md:flex dark:border-white/10 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white"
        aria-label={collapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
