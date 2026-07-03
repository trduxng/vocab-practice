"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import Topbar from "@/src/components/shared/Topbar";
import AchievementPreview, { type Achievement } from "@/src/components/user/dashboard/AchievementPreview";
import DashboardLearningPath from "@/src/components/user/dashboard/DashboardLearningPath";
import DashboardSkeleton from "@/src/components/user/dashboard/DashboardSkeleton";
import LearningHeroCard from "@/src/components/user/dashboard/LearningHeroCard";
import TodaysLearning, { learningActionIcons, type LearningAction } from "@/src/components/user/dashboard/TodaysLearning";
import WeeklyActivity, { type WeeklyActivityDay } from "@/src/components/user/dashboard/WeeklyActivity";
import XpTrendMini from "@/src/components/user/dashboard/XpTrendMini";
import { useAuth } from "@/src/app/context/AuthContext";
import { userService } from "@/src/services/user.service";
import type { LearningPathRoadmap } from "@/src/modules/user/types";

type FlashcardPreview = {
  term: string;
  meaning: string;
  memoryStatus?: string;
};

type DashboardStats = {
  streak?: number;
  totalLearned?: number;
  accuracy?: number;
  correct?: number;
  totalXP?: number;
  currentLevel?: number;
  currentLevelXP?: number;
  xpForNextLevel?: number;
  levelProgress?: number;
  achievements?: Achievement[];
};

type HeatmapEntry = {
  date: string;
  count: number;
  xpEarned?: number;
};

type DashboardData = {
  flashcards: FlashcardPreview[];
  stats: DashboardStats;
  heatmap: HeatmapEntry[];
  todayCount: number;
  dailyGoal: number;
  todayXP: number;
  smartQueueCount: number;
  miniTestCount: number;
  learningPath: LearningPathRoadmap | null;
};

const initialData: DashboardData = {
  flashcards: [],
  stats: {},
  heatmap: [],
  todayCount: 0,
  dailyGoal: 20,
  todayXP: 0,
  smartQueueCount: 0,
  miniTestCount: 0,
  learningPath: null,
};

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const [flashcards, stats, heatmap, progress, goal, summary, smartQueue, miniTests, learningPath] = await Promise.all([
        userService.getDueFlashcards({ mode: "new" }),
        userService.getStats(),
        userService.getActivityHeatmap(),
        userService.getDailyProgress(),
        userService.getDailyGoalSetting().catch(() => ({ dailyGoal: 20 })),
        userService.getSessionSummary().catch(() => ({ xpEarned: 0 })),
        userService.getSmartReviewQueue(50).catch(() => []),
        userService.getMiniTests(1, 1).catch(() => ({ total: 0 })),
        userService.getLearningPath().catch(() => null),
      ]);

      setData({
        flashcards: Array.isArray(flashcards) ? flashcards : [],
        stats: stats || {},
        heatmap: Array.isArray(heatmap) ? heatmap : [],
        todayCount: Number(progress?.todayCount || 0),
        dailyGoal: Number(goal?.dailyGoal || 20),
        todayXP: Number(summary?.xpEarned || 0),
        smartQueueCount: Array.isArray(smartQueue) ? smartQueue.length : 0,
        miniTestCount: Number(miniTests?.total || 0),
        learningPath,
      });
    } catch (dashboardError) {
      console.error("Failed to fetch dashboard data", dashboardError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const timeout = window.setTimeout(() => {
      void fetchDashboard();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchDashboard, user]);

  const newWords = data.flashcards.length;
  const reviewWords = data.smartQueueCount;
  const practiceSessions = data.smartQueueCount > 0 ? Math.ceil(data.smartQueueCount / 15) : 0;
  const weeklyDays = useMemo(() => buildWeeklyDays(data.heatmap), [data.heatmap]);
  const hasCards = data.flashcards.length > 0;
  const hasPractice = data.smartQueueCount > 0;

  const continueRoute = hasCards
    ? data.learningPath?.currentLesson?.route || "/user/learn"
    : hasPractice
      ? "/user/practice?mode=smart"
      : "/user/minitests";

  const nextActionLabel = hasCards
    ? `${data.flashcards.length} từ mới đã sẵn sàng. Chọn chủ đề để xem trước danh sách và bắt đầu flashcard.`
    : hasPractice
      ? "Bạn đã hoàn thành thẻ từ hôm nay. Tiếp tục với một phiên luyện tập ngắn."
      : "Kế hoạch hôm nay đã hoàn tất. Thử một bài kiểm tra ngắn để củng cố kiến thức.";

  const actions: LearningAction[] = [
    {
      title: "Từ mới sẵn sàng",
      description: "Mở rộng vốn từ theo lộ trình.",
      count: newWords,
      unit: "từ",
      icon: learningActionIcons.newWords,
      tone: "blue",
      onClick: () => router.push("/user/learn"),
    },
    {
      title: "Đến hạn ôn tập",
      description: "Ôn đúng thời điểm để ghi nhớ lâu hơn.",
      count: reviewWords,
      unit: "từ",
      icon: learningActionIcons.review,
      tone: "violet",
      onClick: () => router.push("/user/practice?mode=smart"),
    },
    {
      title: "Phiên luyện tập",
      description: "Củng cố phản xạ bằng bài tập ngắn.",
      count: practiceSessions,
      unit: "phiên",
      icon: learningActionIcons.practice,
      tone: "amber",
      onClick: () => router.push("/user/practice"),
    },
    {
      title: "Bài kiểm tra ngắn",
      description: "Đo mức độ tiến bộ sau mỗi chủ đề.",
      count: data.miniTestCount,
      unit: "bài",
      icon: learningActionIcons.tests,
      tone: "rose",
      onClick: () => router.push("/user/minitests"),
    },
  ];

  if (authLoading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950" />;
  }

  return (
    <>
      <Topbar
        title="Trang học tập"
        subtitle="Tiếp tục lộ trình và giữ nhịp học mỗi ngày."
        role="student"
        userName={user?.fullName || "Người dùng"}
      />

      <main className="flex-1 overflow-auto bg-slate-100 p-3 dark:bg-slate-950 sm:p-4">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <DashboardSkeleton />
          ) : error ? (
            <DashboardError onRetry={fetchDashboard} />
          ) : (
            <div className="space-y-4">
              <LearningHeroCard
                streak={data.stats.streak || 0}
                todayCount={data.todayCount}
                dailyGoal={data.dailyGoal}
                todayXP={data.todayXP}
                currentLevel={data.stats.currentLevel || 1}
                totalXP={data.stats.totalXP || 0}
                currentLevelXP={data.stats.currentLevelXP || 0}
                xpForNextLevel={data.stats.xpForNextLevel || 100}
                levelProgress={data.stats.levelProgress || 0}
                nextActionLabel={nextActionLabel}
                onContinue={() => router.push(continueRoute)}
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <TodaysLearning actions={actions} />
                {data.learningPath && (
                  <DashboardLearningPath
                    roadmap={data.learningPath}
                    onContinue={() => router.push(data.learningPath?.currentPosition?.activityRoute || "/user/courses")}
                    onViewRoadmap={() => router.push("/user/courses")}
                  />
                )}
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <WeeklyActivity days={weeklyDays} dailyGoal={data.dailyGoal} />
                <AchievementPreview
                  achievements={data.stats.achievements || []}
                  totalLearned={data.stats.totalLearned || 0}
                  correct={data.stats.correct || 0}
                  accuracy={data.stats.accuracy || 0}
                  streak={data.stats.streak || 0}
                  currentLevel={data.stats.currentLevel || 1}
                  onViewAll={() => router.push("/user/achievements")}
                />
                <XpTrendMini data={data.heatmap} />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-rose-200 bg-white p-8 text-center dark:border-rose-500/20 dark:bg-white/[0.04]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Không thể tải trang học tập</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        Dữ liệu học tập chưa sẵn sàng. Hãy thử tải lại trang.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Thử lại
      </button>
    </div>
  );
}

function buildWeeklyDays(entries: HeatmapEntry[]): WeeklyActivityDay[] {
  const activityByDate = new Map(
    entries.map((entry) => [
      String(entry.date).slice(0, 10),
      {
        count: Number(entry.count || 0),
        xpEarned: Number(entry.xpEarned || 0),
      },
    ]),
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = toDateKey(date);
    const activity = activityByDate.get(key);

    return {
      date: key,
      label: date.toLocaleDateString("vi-VN", { weekday: "short" }),
      count: activity?.count || 0,
      xpEarned: activity?.xpEarned || 0,
    };
  });
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
