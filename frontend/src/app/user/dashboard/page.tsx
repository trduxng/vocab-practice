"use client";

import React, { useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { userService } from "@/src/services/user.service";
import { authService } from "@/src/services/auth.service";
import {
  Flame,
  Trophy,
  Brain,
  Target,
  BookOpen,
  ChevronRight,
  Star,
  Zap,
  TrendingUp,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

const achievements = [
  { icon: "🔥", label: "7-ngày streak", unlocked: true },
  { icon: "💯", label: "100 từ học", unlocked: true },
  { icon: "🏆", label: "Top 10%", unlocked: true },
  { icon: "⚡", label: "500 từ học", unlocked: false },
  { icon: "🌟", label: "Perfect week", unlocked: false },
];

const weekData = [
  { day: "T2", words: 22, goal: 20 },
  { day: "T3", words: 18, goal: 20 },
  { day: "T4", words: 25, goal: 20 },
  { day: "T5", words: 20, goal: 20 },
  { day: "T6", words: 30, goal: 20 },
  { day: "T7", words: 28, goal: 20 },
  { day: "CN", words: 12, goal: 20 },
];

const StudentDashboard = () => {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flashcardsData, currentUser] = await Promise.all([
          userService.getDueFlashcards(),
          authService.getCurrentUser()
        ]);
        setFlashcards(flashcardsData);
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const todayLearned = 12;
  const todayGoal = 20;
  const progressPct = Math.round((todayLearned / todayGoal) * 100);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Đang tải dữ liệu...</div>;
  }

  return (
    <>
      <Topbar
        title="Tổng quan học tập"
        subtitle="Chào buổi sáng! Tiếp tục chuỗi streak của bạn nào 🔥"
        role="student"
        userName={user?.username || "Người dùng"}
      />

      <main className="flex-1 p-6 space-y-5 overflow-auto">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Flame,
              label: "Streak hiện tại",
              value: "14 ngày",
              sub: "Kỷ lục: 21 ngày",
              color: "from-orange-500 to-red-500",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20",
            },
            {
              icon: Brain,
              label: "Từ đã học",
              value: "1,284",
              sub: "+25 hôm nay",
              color: "from-violet-500 to-purple-600",
              bg: "bg-violet-500/10",
              border: "border-violet-500/20",
            },
            {
              icon: Target,
              label: "Mục tiêu hôm nay",
              value: `${todayLearned}/${todayGoal}`,
              sub: `${progressPct}% hoàn thành`,
              color: "from-blue-500 to-cyan-500",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              icon: Trophy,
              label: "Điểm kinh nghiệm",
              value: "8,420 XP",
              sub: "Cấp độ 12 · Nâng cao",
              color: "from-amber-500 to-yellow-500",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.bg} border ${s.border} rounded-2xl p-4 flex flex-col gap-2.5 hover:scale-[1.01] transition-transform cursor-default`}
            >
              <div
                className={`w-9 h-9 rounded-xl bg-linear-to-br ${s.color} flex items-center justify-center shadow-lg`}
              >
                <s.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{s.label}</p>
                <p className="text-white font-bold text-xl">{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main content row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Today's session + quick actions */}
          <div className="xl:col-span-2 space-y-5">
            {/* Today progress */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold">Phiên học hôm nay</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    IELTS Vocabulary Master – Bộ 5/12
                  </p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25">
                  <Zap size={14} />
                  Học ngay
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs">
                    Tiến độ hôm nay
                  </span>
                  <span className="text-white font-bold text-sm">
                    {todayLearned}/{todayGoal} từ
                  </span>
                </div>
                <div className="h-3 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-1000 relative"
                    style={{ width: `${progressPct}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-600 text-xs">
                    {progressPct}% hoàn thành
                  </span>
                  <span className="text-slate-600 text-xs">
                    {todayGoal - todayLearned} từ còn lại
                  </span>
                </div>
              </div>

              {/* Word list */}
              <div className="space-y-2">
                {flashcards.slice(0, 5).map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors group cursor-default"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/5 border border-white/10`}
                    >
                      <BookOpen size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">
                          {w.Term}
                        </span>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="text-slate-400 text-xs">{w.Meaning}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg font-medium text-blue-400 bg-blue-500/10">
                      Cần học
                    </span>
                  </div>
                ))}
                {flashcards.length === 0 && <p className="text-slate-500 text-center py-4">Hôm nay bạn không có từ nào cần học!</p>}
              </div>
            </div>

            {/* Weekly chart */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold">Hoạt động tuần này</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Số từ học mỗi ngày so với mục tiêu
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                    <span className="text-slate-400">Đã học</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-white/15 border border-dashed border-white/20" />
                    <span className="text-slate-400">Mục tiêu</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2 h-28">
                {weekData.map((d, i) => {
                  const maxVal = Math.max(
                    ...weekData.map((x) => Math.max(x.words, x.goal)),
                  );
                  const wordH = (d.words / maxVal) * 100;
                  const goalH = (d.goal / maxVal) * 100;
                  const isToday = i === 6;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className="w-full relative flex items-end justify-center gap-1"
                        style={{ height: "96px" }}
                      >
                        {/* Goal line marker */}
                        <div
                          className="absolute w-full flex items-end"
                          style={{ height: `${goalH}%` }}
                        >
                          <div className="w-full border-t border-dashed border-white/20" />
                        </div>
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isToday
                              ? "bg-linear-to-t from-blue-600 to-cyan-400"
                              : d.words >= d.goal
                                ? "bg-linear-to-t from-green-600 to-green-400"
                                : "bg-linear-to-t from-slate-600 to-slate-500"
                          } group-hover:opacity-80`}
                          style={{ height: `${wordH}%`, minHeight: "4px" }}
                        />
                      </div>
                      <span
                        className={`text-xs ${isToday ? "text-blue-400 font-bold" : "text-slate-500"}`}
                      >
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* SRS upcoming reviews */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Ôn tập sắp tới</h3>
                <Clock size={15} className="text-slate-500" />
              </div>
              <div className="space-y-2.5">
                {flashcards.slice(0, 4).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 group cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <span className="text-violet-400 text-xs font-bold">
                        NEW
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-blue-300 transition-colors">
                        {r.Term}
                      </p>
                      <p className="text-slate-500 text-xs">Mới</p>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-slate-600 group-hover:text-slate-400 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-semibold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2">
                <RotateCcw size={13} />
                Bắt đầu ôn tập ({flashcards.length} từ)
              </button>
            </div>

            {/* Achievements */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Thành tích</h3>
                <button className="text-blue-400 text-xs font-semibold hover:text-blue-300">
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {achievements.map((a, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 group cursor-default"
                    title={a.label}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${
                        a.unlocked
                          ? "bg-amber-500/15 border border-amber-500/30 group-hover:scale-110"
                          : "bg-white/4 border border-white/8 grayscale opacity-40"
                      }`}
                    >
                      {a.icon}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-xs">
                    Cấp độ hiện tại
                  </span>
                  <span className="text-white text-xs font-bold">
                    Lv.12 · 8,420 XP
                  </span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full">
                  <div className="h-full w-[68%] bg-linear-to-r from-amber-500 to-yellow-400 rounded-full" />
                </div>
                <p className="text-slate-600 text-xs mt-1">
                  3,580 XP để lên Lv.13
                </p>
              </div>
            </div>

            {/* Course progress */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Khóa học của tôi</h3>
                <TrendingUp size={15} className="text-slate-500" />
              </div>
              {[
                {
                  name: "IELTS Vocabulary Master",
                  progress: 42,
                  total: "5,000 từ",
                  color: "from-blue-500 to-indigo-500",
                },
                {
                  name: "Giao Tiếp Hàng Ngày",
                  progress: 78,
                  total: "2,000 từ",
                  color: "from-green-500 to-emerald-500",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`${i > 0 ? "mt-4 pt-4 border-t border-white/6" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-300 text-sm font-medium truncate pr-2">
                      {c.name}
                    </p>
                    <span className="text-white text-sm font-bold shrink-0">
                      {c.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-linear-to-r ${c.color}`}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-slate-600 text-xs">{c.total}</span>
                    <button className="text-blue-400 text-xs flex items-center gap-1 hover:text-blue-300">
                      Tiếp tục <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default StudentDashboard;
