"use client";
import { Bell, Search } from "lucide-react";

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
  return (
    <header className="h-16 bg-[#0d1526]/80 backdrop-blur-md border-b border-white/8 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-white font-bold text-lg leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-48 hover:border-blue-500/40 transition-all">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 outline-none w-full"
          />
        </div>

        {/* Notification */}
        <button className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-[#0d1526]" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${role === "admin" ? "bg-linear-to-br from-amber-500 to-orange-600" : "bg-linear-to-br from-blue-500 to-cyan-500"}`}
          >
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-white text-sm font-semibold leading-tight">
              {userName}
            </p>
            <p className="text-slate-500 text-xs">
              {role === "admin" ? "Quản trị viên" : "Học viên"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
