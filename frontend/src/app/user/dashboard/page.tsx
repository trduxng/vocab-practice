"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  Brain,
  Bell,
  Clock,
  Flame,
  Flag,
  RotateCcw,
  Settings,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Topbar from "@/src/components/shared/Topbar";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Button } from "@/src/components/ui/button";
import CalendarHeatmap from "@/src/components/user/CalendarHeatmap";
import { Input } from "@/src/components/ui/input";

type FlashcardPreview = {
  term: string;
  meaning: string;
};

type Achievement = {
  id: number;
  icon: string;
  label: string;
  unlocked: boolean;
};

type MasteryTimeline = {
  totalWords?: number;
  masteredWords?: number;
  completionPercentage?: number | string;
  estimatedDaysToMastery?: number | null;
  projectedCompletionDate?: string | null;
};

type DashboardStats = {
  streak?: number;
  totalLearned?: number;
  accuracy?: number;
  correct?: number;
  dailyTrends?: Array<{ day: string; count: number }>;
  achievements?: Achievement[];
  masteryTimeline?: MasteryTimeline;
};

const fallbackTrend = [
  { day: "T2", count: 0 },
  { day: "T3", count: 0 },
  { day: "T4", count: 0 },
  { day: "T5", count: 0 },
  { day: "T6", count: 0 },
  { day: "T7", count: 0 },
  { day: "CN", count: 0 },
];

const StudentDashboard = () => {
  const [flashcards, setFlashcards] = useState<FlashcardPreview[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<
    { date: string; count: number }[]
  >([]);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [todayCount, setTodayCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flashcardsData, statsData, heatmap, progress, goalData] =
          await Promise.all([
            userService.getDueFlashcards(),
            userService.getStats(),
            userService.getActivityHeatmap(),
            userService.getDailyProgress(),
            userService.getDailyGoalSetting().catch(() => ({ dailyGoal: 20 })),
          ]);
        setFlashcards(flashcardsData);
        setStats(statsData);
        setHeatmapData(heatmap || []);
        setTodayCount(progress?.todayCount || 0);
        if (goalData?.dailyGoal) setDailyGoal(goalData.dailyGoal);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-[#0a0f1e] font-mono">
        Đang xác thực...
      </div>
    );
  }

  const masteryTimeline = stats?.masteryTimeline;
  const progressPct = masteryTimeline
    ? Math.min(
        100,
        Math.round(Number(masteryTimeline.completionPercentage || 0)),
      )
    : stats
      ? Math.min(100, Math.round(((stats.totalLearned || 0) / 50) * 100))
      : 0;

  return (
    <>
      <Topbar
        title="Tổng quan học tập"
        subtitle="Theo dõi từ cần ôn, tiến độ và thành tích của bạn."
        role="student"
        userName={user?.fullName || "Người dùng"}
      />

      <main className="flex-1 p-6 space-y-5 overflow-auto bg-slate-100 dark:bg-slate-950">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white/3 dark:bg-white/3 bg-white/80 border border-white/5 dark:border-white/5 border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5"
              >
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                icon={Flame}
                label="Chuỗi học"
                value={`${stats?.streak || 0} ngày`}
                tone="orange"
              />
              <StatCard
                icon={Brain}
                label="Đã học"
                value={stats?.totalLearned || 0}
                tone="violet"
              />
              <StatCard
                icon={Target}
                label="Chính xác"
                value={`${stats?.accuracy || 0}%`}
                tone="blue"
              />
              <StatCard
                icon={Trophy}
                label="Kinh nghiệm"
                value={`${(stats?.correct || 0) * 10} XP`}
                tone="amber"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <div className="bg-white/3 dark:bg-white/3 bg-white border border-white/8 dark:border-white/8 border-slate-200 rounded-[32px] p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap size={120} />
              </div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-black text-2xl uppercase tracking-tighter">
                    Học tập ngay
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-sm mt-1">
                    Hệ thống đã chuẩn bị {loading ? "..." : flashcards.length}{" "}
                    từ cần học hoặc ôn hôm nay.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/user/learn")}
                  className="px-8 py-4 bg-white text-black hover:bg-blue-600 hover:text-white text-xs font-black rounded-2xl transition-all hover:-translate-y-1 shadow-2xl uppercase tracking-[0.2em] flex items-center gap-2"
                >
                  <Zap size={14} fill="currentColor" /> Bắt đầu
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 dark:text-slate-400 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    Mục tiêu tuần
                  </span>
                  <span className="text-slate-900 dark:text-white font-black text-xs">
                    {loading ? "..." : stats?.totalLearned || 0}/50 từ
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-600 to-indigo-400 transition-all duration-1000 shadow-glow"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10">
                {loading
                  ? [...Array(3)].map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-14 rounded-2xl dark:bg-white/2 bg-slate-100"
                      />
                    ))
                  : flashcards.slice(0, 3).map((word, index) => (
                      <div
                        key={`${word.term}-${index}`}
                        className="flex items-center gap-3 p-4 rounded-2xl dark:bg-white/2 bg-white border border-white/5 dark:border-white/5 border-slate-200 hover:dark:bg-white/5 hover:bg-slate-50 transition-colors group cursor-default"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 border border-blue-500/20">
                          <BookOpen size={14} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 dark:text-white text-xs font-black truncate">
                            {word.term}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-[9px] truncate">
                            {word.meaning}
                          </p>
                        </div>
                      </div>
                    ))}
                {!loading && flashcards.length === 0 && (
                  <div className="col-span-3 py-6 text-center text-slate-600 dark:text-slate-600 text-slate-400 text-sm italic border border-dashed border-white/5 dark:border-white/5 border-slate-200 rounded-2xl">
                    Tuyệt vời! Bạn đã hoàn thành toàn bộ từ cần ôn hôm nay.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/3 dark:bg-white/3 bg-white border border-white/8 dark:border-white/8 border-slate-200 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest mb-2">
                    Hoạt động trong năm
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Theo dõi số lượng câu hỏi bạn đã trả lời mỗi ngày trong năm.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    Mục tiêu hôm nay
                  </p>
                  <p className="text-slate-900 dark:text-white font-black text-2xl">
                    {loading ? "..." : `${todayCount}/${dailyGoal}`}
                  </p>
                  <div className="mt-2 h-1.5 w-28 bg-white/5 rounded-full overflow-hidden ml-auto">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-1000"
                      style={{
                        width: `${dailyGoal > 0 ? Math.min(100, (todayCount / dailyGoal) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-[120px] w-full rounded-2xl" />
              ) : (
                <CalendarHeatmap data={heatmapData} />
              )}
            </div>

            <div className="bg-white/3 dark:bg-white/3 bg-white border border-white/8 dark:border-white/8 border-slate-200 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest mb-2">
                Hoạt động 7 ngày qua
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-xs mb-8">
                Theo dõi số lượng câu hỏi bạn đã trả lời mỗi ngày.
              </p>

              <div className="h-[280px] w-full">
                {loading ? (
                  <Skeleton className="w-full h-full rounded-2xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        stats?.dailyTrends?.length
                          ? stats.dailyTrends
                          : fallbackTrend
                      }
                    >
                      <defs>
                        <linearGradient
                          id="colorCount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#ffffff05"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#3b82f6" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white/3 dark:bg-white/3 bg-white border border-white/8 dark:border-white/8 border-slate-200 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">
                  Huy hiệu
                </h3>
                <Trophy size={16} className="text-amber-500" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {loading
                  ? [...Array(8)].map((_, index) => (
                      <Skeleton
                        key={index}
                        className="aspect-square rounded-xl"
                      />
                    ))
                  : stats?.achievements?.slice(0, 8).map((achievement) => (
                      <div
                        key={achievement.id}
                        className="group relative"
                        title={achievement.label}
                      >
                        <div
                          className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all border-2 ${achievement.unlocked ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-900/10" : "bg-white/2 border-white/5 grayscale opacity-20"}`}
                        >
                          {achievement.icon}
                        </div>
                      </div>
                    ))}
              </div>
              <div className="mt-10 pt-6 border-t border-white/5 dark:border-white/5 border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 dark:text-slate-400 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    Tiến độ cấp độ
                  </span>
                  <span className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest">
                    Cấp{" "}
                    {loading
                      ? "..."
                      : Math.floor((stats?.correct || 0) / 10) + 1}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                  <div
                    className="h-full rounded-full bg-amber-500 shadow-glow"
                    style={{
                      width: `${loading ? 0 : ((stats?.correct || 0) % 10) * 10}%`,
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => router.push("/user/achievements")}
                className="w-full mt-8 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Xem tất cả thành tích
              </button>
            </div>

            <div className="bg-linear-to-br from-violet-600/20 to-purple-600/20 dark:from-violet-600/20 dark:to-purple-600/20 from-violet-100 to-purple-100 border border-violet-500/20 dark:border-violet-500/20 border-violet-200 rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-violet-300 dark:text-violet-300 text-violet-700 font-black text-sm uppercase tracking-widest">
                  Ôn tập ngắt quãng
                </h3>
                <Clock size={16} className="text-violet-400" />
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                    Cần ôn ngay
                  </p>
                  <p className="text-white font-black text-3xl">
                    {loading ? "..." : flashcards.length}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-slate-500 leading-relaxed italic">
                  Hệ thống nhắc bạn ôn đúng thời điểm để ghi nhớ từ vựng lâu
                  hơn.
                </p>
              </div>
              <button
                onClick={() => router.push("/user/practice")}
                className="w-full mt-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-900/20"
              >
                Luyện tập trắc nghiệm
              </button>
            </div>

            <div className="bg-white/3 dark:bg-white/3 bg-white border border-white/8 dark:border-white/8 border-slate-200 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">
                  Dự báo thành thạo
                </h3>
                <RotateCcw size={16} className="text-blue-400" />
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-500 dark:text-slate-400 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      Hoàn thành
                    </span>
                    <span className="text-slate-900 dark:text-white text-xs font-black">
                      {loading ? "..." : `${progressPct}%`}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${loading ? 0 : progressPct}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                      Đã thành thạo
                    </p>
                    <p className="mt-2 text-slate-900 dark:text-white text-2xl font-black">
                      {loading
                        ? "..."
                        : `${masteryTimeline?.masteredWords || 0}/${masteryTimeline?.totalWords || 0}`}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                      Ngày còn lại
                    </p>
                    <p className="mt-2 text-slate-900 dark:text-white text-2xl font-black">
                      {loading
                        ? "..."
                        : (masteryTimeline?.estimatedDaysToMastery ?? "-")}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-slate-500">
                  {masteryTimeline?.projectedCompletionDate
                    ? `Dự kiến hoàn thành: ${new Date(masteryTimeline.projectedCompletionDate).toLocaleDateString("vi-VN")}`
                    : "Hãy tiếp tục luyện tập để hệ thống dự báo chính xác hơn."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone: "orange" | "violet" | "blue" | "amber";
};

const StatCard = ({ icon: Icon, label, value, tone }: StatCardProps) => {
  const toneStyles = {
    orange: {
      card: "bg-orange-500/10 border-orange-500/20",
      cardDark: "dark:bg-orange-500/10 dark:border-orange-500/20",
      icon: "from-orange-500 to-red-500",
    },
    violet: {
      card: "bg-violet-500/10 border-violet-500/20",
      cardDark: "dark:bg-violet-500/10 dark:border-violet-500/20",
      icon: "from-violet-500 to-purple-600",
    },
    blue: {
      card: "bg-blue-500/10 border-blue-500/20",
      cardDark: "dark:bg-blue-500/10 dark:border-blue-500/20",
      icon: "from-blue-500 to-cyan-500",
    },
    amber: {
      card: "bg-amber-500/10 border-amber-500/20",
      cardDark: "dark:bg-amber-500/10 dark:border-amber-500/20",
      icon: "from-amber-500 to-yellow-500",
    },
  }[tone];

  return (
    <div
      className={`${toneStyles.card} ${toneStyles.cardDark} border dark:border-white/10 border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5`}
    >
      <div
        className={`w-9 h-9 rounded-xl bg-linear-to-br ${toneStyles.icon} flex items-center justify-center shadow-lg`}
      >
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
          {label}
        </p>
        <p className="text-white font-black text-2xl">{value}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
