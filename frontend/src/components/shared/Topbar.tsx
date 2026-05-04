// vocab-practice/frontend/src/components/shared/Topbar.tsx
"use client";
import { useState, FormEvent, useRef, useEffect } from "react";
import { Bell, Search, User, Settings, LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth.service";

interface TopbarProps {
  title: string;
  subtitle?: string;
  role: "admin" | "student";
  userName?: string;
}

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    text: "Bạn có 15 từ cần ôn tập hôm nay",
    time: "5 phút trước",
    unread: true,
  },
  {
    id: 2,
    text: "Chuỗi streak 7 ngày! Tiếp tục phát huy 🔥",
    time: "2 giờ trước",
    unread: true,
  },
  {
    id: 3,
    text: "Khóa học mới: IELTS Advanced đã ra mắt",
    time: "1 ngày trước",
    unread: false,
  },
];

export default function Topbar({
  title,
  subtitle,
  role,
  userName = "Admin",
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

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
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-48 hover:border-blue-500/40 transition-all"
        >
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 outline-none w-full"
          />
        </form>

        {/* Notification - ĐÃ THÊM DROPDOWN */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/40 transition-all"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold border border-[#0d1526]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d1526] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <h3 className="text-white font-semibold text-sm">Thông báo</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                        notif.unread ? "bg-blue-500/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-300 text-sm">{notif.text}</p>
                          <p className="text-slate-600 text-xs mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    Không có thông báo nào
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar - ĐÃ THÊM DROPDOWN MENU */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
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
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0d1526] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-white font-semibold text-sm">{userName}</p>
                <p className="text-slate-500 text-xs">
                  {role === "admin" ? "Quản trị viên" : "Học viên"}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push(
                      role === "admin" ? "/admin/settings" : "/user/settings",
                    );
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={16} />
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push(
                      role === "admin" ? "/admin/settings" : "/user/settings",
                    );
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings size={16} />
                  Cài đặt
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-white/8 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
