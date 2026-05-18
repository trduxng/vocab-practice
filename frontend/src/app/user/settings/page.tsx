"use client";

import React, { useState } from "react";
import { LogOut, Mail, Save, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/src/app/context/AuthContext";
import { userService } from "@/src/services/user.service";
import Topbar from "@/src/components/shared/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

export default function UserSettingsPage() {
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await userService.updateProfile({ fullName });
      toast.success("Cập nhật thông tin thành công. Vui lòng đăng nhập lại để làm mới phiên làm việc.");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Không thể cập nhật thông tin tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1e]">
      <Topbar title="Cài đặt tài khoản" role="student" userName={user?.fullName} />

      <main className="p-6 space-y-6 overflow-auto max-w-2xl mx-auto w-full">
        <Card className="bg-white/5 border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-white text-lg font-black uppercase tracking-widest flex items-center gap-3">
              <User size={20} className="text-blue-400" /> Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl text-white" required />
                </div>
              </div>

              <div className="space-y-2 opacity-50 cursor-not-allowed">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email không thể thay đổi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <Input value={user?.email || ""} disabled className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2 opacity-50 cursor-not-allowed">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vai trò</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <Input value={user?.role === "Learner" ? "Người học" : user?.role || ""} disabled className="bg-white/5 border-white/10 h-12 pl-10 rounded-xl" />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold uppercase text-xs tracking-widest gap-2">
                  <Save size={16} /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20 rounded-[32px] overflow-hidden shadow-xl">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <h3 className="text-red-400 font-bold">Đăng xuất</h3>
              <p className="text-slate-500 text-xs mt-1">Kết thúc phiên làm việc hiện tại của bạn.</p>
            </div>
            <Button onClick={logout} variant="ghost" className="text-red-500 hover:bg-red-500 hover:text-white rounded-xl px-6 h-12 font-bold uppercase text-[10px] tracking-widest border border-red-500/20 gap-2">
              <LogOut size={16} /> Đăng xuất ngay
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
