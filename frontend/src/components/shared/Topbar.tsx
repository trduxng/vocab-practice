"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Moon, Search, Sun } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";

interface TopbarProps {
  title: string;
  subtitle?: string;
  role: "admin" | "student";
  userName?: string;
}

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  channel: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function NotificationSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await userService.getNotifications(50);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Table may not exist yet — silently ignore
    }
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [open, fetchNotifications]);

  // Poll every 30s when open
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [open, fetchNotifications]);

  const handleMarkRead = async (id: number) => {
    try {
      await userService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await userService.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold text-slate-950 dark:text-white">
              Thông báo
            </SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Đã đọc tất cả
                </button>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto h-[calc(100vh-65px)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Chưa có thông báo nào
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Các thông báo từ quản trị viên sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {notifications.map((item) => (                  <button
                    key={item.id}
                    onClick={() => {
                      if (!item.isRead) handleMarkRead(item.id);
                      if (item.actionUrl) window.location.href = item.actionUrl;
                    }}
                    className={`w-full text-left px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03] ${
                    !item.isRead ? "bg-blue-50/50 dark:bg-blue-500/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        item.isRead
                          ? "bg-transparent"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${
                            item.isRead
                              ? "text-slate-600 dark:text-slate-400"
                              : "font-semibold text-slate-950 dark:text-white"
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 line-clamp-2">
                        {item.message}
                      </p>
                      {item.actionUrl && (
                        <span className="mt-1.5 inline-block text-[10px] font-medium text-blue-600 dark:text-blue-400">
                          Xem chi tiết →
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Topbar({
  title,
  subtitle,
  role,
  userName,
}: TopbarProps) {
  const { user } = useAuth();
  const displayName = userName || user?.fullName || (role === "admin" ? "Quản trị viên" : "Người học");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        return stored === "dark";
      }
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await userService.getNotifications(1);
      setUnreadCount(data.unreadCount);
    } catch {
      // Table may not exist yet
    }
  }, []);

  // Initial fetch + poll every 60s
  useEffect(() => {
    if (role !== "student") return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [role, fetchUnreadCount]);

  // Refresh count after sheet closes
  useEffect(() => {
    if (!sheetOpen) {
      fetchUnreadCount();
    }
  }, [sheetOpen, fetchUnreadCount]);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-xl md:px-6 dark:border-white/10 dark:bg-slate-950/75">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search bar (UI placeholder — search functionality to be implemented) */}
        <div className="hidden h-9 w-64 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 lg:flex dark:border-white/10 dark:bg-white/5">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="w-full text-sm text-slate-500 dark:text-slate-500 truncate select-none">
            {role === "admin" ? "Tìm kiếm..." : "Tìm kiếm..."}
          </span>
        </div>

        <button
          onClick={() => setDarkMode((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
          aria-label="Bật hoặc tắt giao diện tối"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {role === "student" && (
          <>
            <button
              onClick={() => setSheetOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
              aria-label="Thông báo"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <NotificationSheet open={sheetOpen} onOpenChange={setSheetOpen} />
          </>
        )}

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-tight text-slate-950 dark:text-white">{displayName}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{role === "admin" ? "Quản trị viên" : "Người học"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
