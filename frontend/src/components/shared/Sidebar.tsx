"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Target,
  Trophy,
  Brain,
  Home,
  FileText,
  HelpCircle,
} from "lucide-react";

const adminLinks = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/admin/dashboard" },
  { icon: BookOpen, label: "Từ vựng", href: "/admin/words" },
  { icon: HelpCircle, label: "Câu hỏi", href: "/admin/questions" },
  { icon: Users, label: "Học viên", href: "/admin/students" },
  { icon: BookOpen, label: "Khóa học", href: "/admin/courses" },
  { icon: BarChart3, label: "Thống kê", href: "/admin/analytics" },
  { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
];

const studentLinks = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/user/dashboard" },
  { icon: Brain, label: "Học từ vựng", href: "/user/learn" },
  { icon: Target, label: "Luyện tập", href: "/user/practice" },
  { icon: FileText, label: "Mini Tests", href: "/user/minitests" },
  { icon: Trophy, label: "Thành tích", href: "/user/achievements" },
  { icon: BarChart3, label: "Tiến độ", href: "/user/progress" },
  { icon: Settings, label: "Cài đặt", href: "/user/settings" },
];

interface NavLinksProps {
  links: typeof adminLinks;
  collapsed: boolean;
}

// Tách riêng phần dùng usePathname vào component con + wrap Suspense
function NavLinks({ links, collapsed }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
              ${
                active
                  ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/6"
              }
              ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? link.label : undefined}
          >
            <link.icon
              size={18}
              className={`shrink-0 ${active ? "text-blue-400" : "group-hover:text-white"}`}
            />
            {!collapsed && <span>{link.label}</span>}
            {!collapsed && active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </Link>
        );
      })}
    </>
  );
}

interface SidebarProps {
  role: "admin" | "student";
}

export default function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <aside
      className={`relative flex flex-col bg-[#0d1526] border-r border-white/8 transition-all duration-300 ${collapsed ? "w-16" : "w-60"} min-h-screen shrink-0`}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 h-16 border-b border-white/8 ${collapsed ? "justify-center" : ""}`}
      >
        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
          <BookOpen size={15} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base text-white tracking-tight whitespace-nowrap">
            Voca<span className="text-blue-400">Boost</span>
          </span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${role === "admin" ? "bg-amber-400" : "bg-green-400"}`}
          />
          <span className="text-xs font-medium text-slate-400">
            {role === "admin" ? "Quản trị viên" : "Học viên"}
          </span>
        </div>
      )}

      {/* Nav links — wrap Suspense để tránh reload liên tục */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        <Suspense
          fallback={
            <div className="space-y-1 px-1">
              {links.map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-white/4 animate-pulse"
                />
              ))}
            </div>
          }
        >
          <NavLinks links={links} collapsed={collapsed} />
        </Suspense>
      </nav>

      {/* Back to site */}
      {!collapsed && (
        <div className="px-2 pb-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
          >
            <Home size={16} />
            Về trang chủ
          </Link>
        </div>
      )}

      {/* Logout */}
      <div
        className={`px-2 pb-4 border-t border-white/8 pt-3 ${collapsed ? "flex justify-center" : ""}`}
      >
        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all w-full ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={16} />
          {!collapsed && "Đăng xuất"}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#0d1526] border border-white/15 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
