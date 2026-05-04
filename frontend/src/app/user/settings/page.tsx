// vocab-practice/frontend/src/app/user/settings/page.tsx
"use client";
import React, { useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { User, Bell, Shield, Palette, Save } from "lucide-react";

export default function UserSettings() {
  const [name, setName] = useState("Người dùng");
  const [email, setEmail] = useState("user@example.com");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Topbar title="Cài đặt" role="student" userName={name} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-brand-400" />
              <h2 className="text-white font-bold text-lg">Hồ sơ cá nhân</h2>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-all"
              >
                <Save size={16} />
                {saved ? "Đã lưu!" : "Lưu thay đổi"}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={20} className="text-brand-400" />
              <h2 className="text-white font-bold text-lg">Thông báo</h2>
            </div>
            <p className="text-slate-500 text-sm">
              Tính năng đang được phát triển.
            </p>
          </div>

          {/* Security */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-brand-400" />
              <h2 className="text-white font-bold text-lg">Bảo mật</h2>
            </div>
            <p className="text-slate-500 text-sm">
              Đổi mật khẩu và các cài đặt bảo mật khác.
            </p>
          </div>

          {/* Theme */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette size={20} className="text-brand-400" />
              <h2 className="text-white font-bold text-lg">Giao diện</h2>
            </div>
            <p className="text-slate-500 text-sm">
              Tùy chỉnh theme và màu sắc.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
