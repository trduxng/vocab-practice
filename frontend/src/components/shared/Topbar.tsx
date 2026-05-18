"use client";

import { useEffect, useState } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  role: "admin" | "student";
  userName?: string;
}

export default function Topbar({
  title,
  subtitle,
  role,
  userName = "Admin",
}: TopbarProps) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-xl md:px-6 dark:border-white/10 dark:bg-slate-950/75">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden h-9 w-64 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 lg:flex dark:border-white/10 dark:bg-white/5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={role === "admin" ? "Tìm người dùng, bài kiểm tra, báo cáo" : "Tìm bài học, từ vựng, bài kiểm tra"}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>

        <button
          onClick={() => setDarkMode((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
          aria-label="Bật hoặc tắt giao diện tối"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-tight text-slate-950 dark:text-white">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{role === "admin" ? "Quản trị viên" : "Người học"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
