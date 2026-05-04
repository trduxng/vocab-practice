// vocab-practice/frontend/src/app/admin/settings/page.tsx
"use client";
import React, { useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { Settings, Bell, Shield, Database, Save } from "lucide-react";

export default function AdminSettings() {
  const [siteName, setSiteName] = useState("VocaBoost");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Topbar title="Cài đặt hệ thống" role="admin" userName="Admin" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* General */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings size={20} className="text-amber-400" />
              <h2 className="text-white font-bold text-lg">Cài đặt chung</h2>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Tên trang web
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
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

          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={20} className="text-amber-400" />
              <h2 className="text-white font-bold text-lg">
                Thông báo hệ thống
              </h2>
            </div>
            <p className="text-slate-500 text-sm">Đang phát triển.</p>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-amber-400" />
              <h2 className="text-white font-bold text-lg">Bảo mật</h2>
            </div>
            <p className="text-slate-500 text-sm">Đang phát triển.</p>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database size={20} className="text-amber-400" />
              <h2 className="text-white font-bold text-lg">Sao lưu dữ liệu</h2>
            </div>
            <p className="text-slate-500 text-sm">Đang phát triển.</p>
          </div>
        </div>
      </main>
    </>
  );
}
