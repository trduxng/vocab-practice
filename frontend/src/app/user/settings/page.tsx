"use client";

import React, { useEffect, useState } from "react";
import { Bell, Brain, LogOut, Mail, RefreshCw, Save, Shield, Target, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/src/app/context/AuthContext";
import { userService } from "@/src/services/user.service";
import Topbar from "@/src/components/shared/Topbar";
import StudyReminder from "@/src/components/user/StudyReminder";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

export default function UserSettingsPage() {
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);
  const [goalLoading, setGoalLoading] = useState(true);
  const [dailyWordGoal, setDailyWordGoal] = useState(20);
  const [srsReviewLimit, setSrsReviewLimit] = useState(15);
  const [savingGoal, setSavingGoal] = useState(false);
  const [savingSrs, setSavingSrs] = useState(false);

  // Load daily goal and SRS config from backend
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGoalLoading(true);
    userService.getDailyGoalSetting()
      .then((data) => {
        if (data.dailyGoal) setDailyWordGoal(data.dailyGoal);
        if (data.srsReviewLimit) setSrsReviewLimit(data.srsReviewLimit);
      })
      .catch(() => {
        // Fallback to localStorage
        const saved = typeof window !== "undefined" ? localStorage.getItem("dailyWordGoal") : null;
        if (saved) setDailyWordGoal(parseInt(saved, 10));
      })
      .finally(() => setGoalLoading(false));
  }, [user]);

  const handleGoalChange = async (value: number) => {
    const goal = Math.max(5, Math.min(100, value));
    setDailyWordGoal(goal);
    setSavingGoal(true);
    try {
      await userService.updateDailyGoal(goal);
      localStorage.setItem("dailyWordGoal", goal.toString());
    } catch {
      toast.error("Không thể đồng bộ mục tiêu lên máy chủ");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleSRSChange = async (value: number) => {
    const limit = Math.max(5, Math.min(50, value));
    setSrsReviewLimit(limit);
    setSavingSrs(true);
    try {
      await userService.updateSRSConfig(limit);
      toast.success(`Đã cập nhật số thẻ mỗi ngày: ${limit}`);
    } catch {
      toast.error("Không thể đồng bộ cấu hình SRS lên máy chủ");
    } finally {
      setSavingSrs(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await userService.updateProfile({ fullName });
      toast.success(
        "Cập nhật thông tin thành công. Vui lòng đăng nhập lại để làm mới phiên làm việc.",
      );
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Không thể cập nhật thông tin tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
      <Topbar
        title="Cài đặt tài khoản"
        role="student"
        userName={user?.fullName}
      />

      <main className="p-6 space-y-6 overflow-auto max-w-2xl mx-auto w-full">
        <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm">
          <CardHeader className="p-8 border-b border-slate-200 dark:border-white/5 dark:bg-white/[0.02] bg-slate-50">
            <CardTitle className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-widest flex items-center gap-3">
              <User size={20} className="text-blue-600 dark:text-blue-400" />{" "}
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Họ và tên
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    size={16}
                  />
                  <Input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="dark:bg-white/5 bg-white border-slate-200 dark:border-white/10 h-12 pl-10 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-50 cursor-not-allowed">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Email không thể thay đổi
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    size={16}
                  />
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="dark:bg-white/5 bg-slate-100 border-slate-200 dark:border-white/10 h-12 pl-10 rounded-xl text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-50 cursor-not-allowed">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Vai trò
                </label>
                <div className="relative">
                  <Shield
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                    size={16}
                  />
                  <Input
                    value={
                      user?.role === "Learner" ? "Người học" : user?.role || ""
                    }
                    disabled
                    className="dark:bg-white/5 bg-slate-100 border-slate-200 dark:border-white/10 h-12 pl-10 rounded-xl text-slate-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold uppercase text-xs tracking-widest gap-2"
                >
                  <Save size={16} /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm">
          <CardHeader className="p-8 border-b border-slate-200 dark:border-white/5 dark:bg-white/[0.02] bg-slate-50">
            <CardTitle className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-widest flex items-center gap-3">
              <Target
                size={20}
                className="text-emerald-600 dark:text-emerald-400"
              />{" "}
              Mục tiêu học tập
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Mục tiêu từ vựng mỗi ngày
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={dailyWordGoal}
                    onChange={(e) =>
                      handleGoalChange(parseInt(e.target.value, 10))
                    }
                    className="flex-1 h-2 rounded-full appearance-none bg-slate-200 dark:bg-white/10 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-slate-900 dark:text-white font-black text-2xl min-w-[3rem] text-center">
                    {dailyWordGoal}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>5 từ</span>
                  <span>100 từ</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {goalLoading ? (
                  <span className="text-[10px] text-slate-500"><RefreshCw size={12} className="inline animate-spin mr-1" />Đang tải...</span>
                ) : (
                  <span className="text-[10px] text-emerald-500 font-medium">
                    <Save size={10} className="inline mr-1" />
                    {savingGoal ? "Đang đồng bộ..." : "Đã đồng bộ với máy chủ"}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SRS Config Card */}
        <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm">
          <CardHeader className="p-8 border-b border-slate-200 dark:border-white/5 dark:bg-white/[0.02] bg-slate-50">
            <CardTitle className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-widest flex items-center gap-3">
              <Brain
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />{" "}
              Ôn tập thông minh (SRS)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Số thẻ ôn tập mỗi ngày
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={srsReviewLimit}
                    onChange={(e) =>
                      handleSRSChange(parseInt(e.target.value, 10))
                    }
                    className="flex-1 h-2 rounded-full appearance-none bg-slate-200 dark:bg-white/10 accent-purple-500 cursor-pointer"
                  />
                  <span className="text-slate-900 dark:text-white font-black text-2xl min-w-[3rem] text-center">
                    {srsReviewLimit}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>5 thẻ</span>
                  <span>50 thẻ</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {savingSrs ? (
                    <span className="text-[10px] text-purple-500 font-medium"><RefreshCw size={12} className="inline animate-spin mr-1" />Đang lưu...</span>
                  ) : (
                    <span className="text-[10px] text-emerald-500 font-medium">
                      <Save size={10} className="inline mr-1" />Đã đồng bộ
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                Hệ thống SRS sẽ ưu tiên những từ bạn sắp quên. Số thẻ càng cao, bạn càng ôn được nhiều từ mỗi ngày.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm">
          <CardHeader className="p-8 border-b border-slate-200 dark:border-white/5 dark:bg-white/[0.02] bg-slate-50">
            <CardTitle className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-widest flex items-center gap-3">
              <Bell
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />{" "}
              Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <StudyReminder />
          </CardContent>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20 rounded-[32px] overflow-hidden shadow-sm">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <h3 className="text-red-400 font-bold">Đăng xuất</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                Kết thúc phiên làm việc hiện tại của bạn.
              </p>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              className="text-red-500 hover:bg-red-500 hover:text-white rounded-xl px-6 h-12 font-bold uppercase text-[10px] tracking-widest border border-red-500/20 gap-2"
            >
              <LogOut size={16} /> Đăng xuất ngay
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
