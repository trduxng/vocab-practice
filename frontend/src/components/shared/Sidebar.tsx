"use client";

import { Suspense, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { icon: LayoutDashboard, label: "Overview", href: "/admin/dashboard", anyOf: [PERMISSIONS.viewDashboard] },
  { icon: Users, label: "Users", href: "/admin/students", anyOf: [PERMISSIONS.manageUsers] },
  { icon: ClipboardList, label: "Content", href: "/admin/courses", anyOf: [PERMISSIONS.manageTopics, PERMISSIONS.manageWords] },
  { icon: ShieldCheck, label: "Duyệt nội dung", href: "/admin/content-review", anyOf: [PERMISSIONS.reviewContent] },
  { icon: Flag, label: "Reports", href: "/admin/reports", anyOf: [PERMISSIONS.manageReports, PERMISSIONS.manageSystemSettings] },
  { icon: BookOpen, label: "Danh mục chủ đề", href: "/admin/topic-categories", anyOf: [PERMISSIONS.manageTopicCategories, PERMISSIONS.manageTopics, PERMISSIONS.manageWords] },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics", anyOf: [PERMISSIONS.viewAnalytics, PERMISSIONS.viewDashboard] },
  { icon: History, label: "Audit logs", href: "/admin/audit-logs", anyOf: [PERMISSIONS.viewAuditLogs, PERMISSIONS.manageSystemSettings, PERMISSIONS.manageUsers] },
  { icon: Bell, label: "Notifications", href: "/admin/notifications", anyOf: [PERMISSIONS.manageNotifications] },
  { icon: BookOpen, label: "Vocabulary", href: "/admin/words", anyOf: [PERMISSIONS.manageWords] },
  { icon: FileQuestion, label: "Questions", href: "/admin/questions", anyOf: [PERMISSIONS.manageQuestions] },
  { icon: ListChecks, label: "Mini tests", href: "/admin/minitests", anyOf: [PERMISSIONS.manageTests] },
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
  { icon: Brain, label: "Học từ", href: "/user/learn" },
  { icon: Target, label: "Luyện tập", href: "/user/practice" },
  { icon: FileText, label: "Bài kiểm tra", href: "/user/minitests" },
  { icon: Trophy, label: "Thành tích", href: "/user/achievements" },
  { icon: BarChart3, label: "Tiến độ", href: "/user/progress" },
  { icon: Settings, label: "Cài đặt", href: "/user/settings" },
];

function NavLinks({ links, collapsed }: { links: NavLink[]; collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            } ${collapsed ? "justify-center" : "md:justify-start"} justify-center`}
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
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const baseLinks = role === "admin" ? adminLinks : role === "creator" ? creatorLinks : studentLinks;
  const links = baseLinks.filter((link) => !link.anyOf?.length || hasAnyPermission(link.anyOf));

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white/95 backdrop-blur transition-all duration-300 dark:border-white/10 dark:bg-slate-950/90 ${
        collapsed ? "w-16" : "w-16 md:w-64"
      }`}
    >
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
            <p className="text-xs text-slate-500 dark:text-slate-400">Học từ vựng TOEIC</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="mx-3 mt-3 hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 md:flex dark:border-white/10 dark:bg-white/5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {role === "admin" ? "Khu vực quản trị" : role === "creator" ? "Khu vực tạo nội dung" : "Khu vực học tập"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Permission based access</p>
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

      <div className="border-t border-slate-200 p-2 dark:border-white/10">
        <Link
          href="/"
          className="flex h-10 items-center justify-center gap-3 rounded-md px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-950 md:justify-start dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Home className="h-4 w-4" />
          {!collapsed && <span className="hidden md:inline">Về trang chủ</span>}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex h-10 w-full items-center justify-center gap-3 rounded-md px-3 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 md:justify-start dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="hidden md:inline">Đăng xuất</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-950 md:flex dark:border-white/10 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white"
        aria-label={collapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
