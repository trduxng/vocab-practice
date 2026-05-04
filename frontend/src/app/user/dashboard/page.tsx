// vocab-practice/frontend/src/app/user/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { userService } from "@/src/services/user.service";
import { authService } from "@/src/services/auth.service";
import type { Flashcard } from "@/src/services/user.service";
import {
  Flame,
  Trophy,
  Brain,
  Target,
  BookOpen,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function StudentDashboard() {
  interface UserInfo {
    id: number;
    fullName: string;
    email: string;
    role: string;
  }

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [flashcardsData, currentUser] = await Promise.all([
          userService.getDueFlashcards(10),
          Promise.resolve(authService.getCurrentUser()),
        ]);
        setFlashcards(flashcardsData || []);
        setUser(currentUser);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "response" in err
              ? (err as { response: { data?: { message?: string } } }).response
                  ?.data?.message
              : "Lỗi tải dữ liệu";
        setError(errorMessage || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const todayLearned = 12; // TODO: Lấy từ API
  const todayGoal = 20;
  const progressPct = Math.round((todayLearned / todayGoal) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080d1a]">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080d1a] text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-600 rounded-xl"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Topbar
        title="Tổng quan học tập"
        subtitle="Chào buổi sáng! Tiếp tục chuỗi streak của bạn nào 🔥"
        role="student"
        userName={user?.fullName || "Người dùng"}
      />

      <main className="flex-1 p-6 space-y-5 overflow-auto">
        {/* Top stats - giữ nguyên */}
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Today's session */}
          <div className="xl:col-span-2 space-y-5">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold">Phiên học hôm nay</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {flashcards.length > 0
                      ? `${flashcards.length} từ cần ôn tập`
                      : "Hoàn thành hết rồi!"}
                  </p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25">
                  <Zap size={14} />
                  Học ngay
                </button>
              </div>

              {flashcards.length > 0 ? (
                <div className="space-y-2">
                  {flashcards.slice(0, 5).map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors group cursor-default"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                        <BookOpen size={14} className="text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-semibold">
                            {w.term}
                          </span>
                          <span className="text-slate-500 text-xs">·</span>
                          <span className="text-slate-400 text-xs">
                            {w.meaning}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-lg font-medium text-blue-400 bg-blue-500/10">
                        {w.memoryStatus === "New" ? "Mới" : "Cần ôn"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  🎉 Bạn đã hoàn thành tất cả từ cần ôn tập hôm nay!
                </p>
              )}
            </div>
          </div>

          {/* Right column - Ôn tập sắp tới */}
          <div className="space-y-5">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Ôn tập sắp tới</h3>
              {flashcards.length > 0 ? (
                <div className="space-y-2.5">
                  {flashcards.slice(0, 4).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 group cursor-default"
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <span className="text-violet-400 text-xs font-bold">
                          {r.memoryStatus === "New" ? "NEW" : "REV"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate group-hover:text-blue-300 transition-colors">
                          {r.term}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {r.memoryStatus === "New" ? "Mới" : "Cần ôn"}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className="text-slate-600 group-hover:text-slate-400 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">
                  Không có từ cần ôn tập
                </p>
              )}
              <button className="w-full mt-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-semibold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2">
                Bắt đầu ôn tập ({flashcards.length} từ)
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
