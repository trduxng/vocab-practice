// vocab-practice/frontend/src/components/user/UserProfilePage.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Award,
  BarChart4,
  BookOpenCheck,
  Flame,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  Trophy,
  User,
} from "lucide-react";
import Topbar from "@/src/components/shared/Topbar";
import AchievementPreview, {
  type Achievement,
} from "@/src/components/user/dashboard/AchievementPreview";
import BadgeCard from "@/src/components/user/gamification/BadgeCard";
import LevelProgressBar from "@/src/components/user/gamification/LevelProgressBar";
import DashboardLearningPath from "@/src/components/user/dashboard/DashboardLearningPath";
import DashboardSkeleton from "@/src/components/user/dashboard/DashboardSkeleton";
import LearningHeroCard from "@/src/components/user/dashboard/LearningHeroCard";
import TodaysLearning, {
  learningActionIcons,
  type LearningAction,
} from "@/src/components/user/dashboard/TodaysLearning";
import WeeklyActivity, {
  type WeeklyActivityDay,
} from "@/src/components/user/dashboard/WeeklyActivity";
import XPTrendChart from "@/src/components/user/progress/XPTrendChart";
import VocabularyGrowthChart from "@/src/components/user/progress/VocabularyGrowthChart";
import TopicMastery from "@/src/components/user/progress/TopicMastery";
import RetentionStats from "@/src/components/user/progress/RetentionStats";
import ActivityHeatmap from "@/src/components/user/progress/ActivityHeatmap";
import ProgressHero from "@/src/components/user/progress/ProgressHero";
import UserSettings from "@/src/components/user/UserSettings";
import { useAuth } from "@/src/app/context/AuthContext";
import { userService } from "@/src/services/user.service";
import type {
  GamificationProfile,
  LearningPathRoadmap,
  ProgressAnalytics,
} from "@/src/modules/user/types";

// ─── Types ────────────────────────────────────────────────────────────

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

type TabId = "dashboard" | "progress" | "achievements" | "settings";

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

// ─── Page Component ───────────────────────────────────────────────────

export default function UserProfilePage({
  defaultTab = "dashboard",
}: {
  defaultTab?: TabId;
}) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [gamification, setGamification] = useState<GamificationProfile | null>(
    null,
  );
  const [gamificationLoading, setGamificationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const router = useRouter();

  // ── Data fetching ──

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const a = await userService.getProgressAnalytics();
      setAnalytics(a);
    } catch {
      // Non-critical
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const [
        flashcards,
        stats,
        heatmap,
        progress,
        goal,
        summary,
        smartQueue,
        miniTests,
        learningPath,
      ] = await Promise.all([
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

  const fetchGamification = useCallback(async () => {
    setGamificationLoading(true);
    try {
      const data = await userService.getGamificationProfile();
      setGamification(data);
    } catch {
      // Non-critical
    } finally {
      setGamificationLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "progress" && !analytics) {
      void fetchAnalytics();
    }
  }, [activeTab, analytics, fetchAnalytics]);

  useEffect(() => {
    if (activeTab === "achievements" && !gamification) {
      void fetchGamification();
    }
  }, [activeTab, gamification, fetchGamification]);

  useEffect(() => {
    if (!user) return;
    const timeout = window.setTimeout(() => void fetchDashboard(), 0);
    return () => window.clearTimeout(timeout);
  }, [fetchDashboard, user]);

  // ── Derived data ──

  const newWords = data.flashcards.length;
  const reviewWords = data.smartQueueCount;
  const practiceSessions =
    data.smartQueueCount > 0 ? Math.ceil(data.smartQueueCount / 15) : 0;
  const weeklyDays = useMemo(
    () => buildWeeklyDays(data.heatmap),
    [data.heatmap],
  );
  const hasCards = data.flashcards.length > 0;
  const hasPractice = data.smartQueueCount > 0;

  const continueRoute = hasCards
    ? data.learningPath?.currentLesson?.route || "/user/learn"
    : hasPractice
      ? "/user/practice?mode=smart"
      : "/user/minitests";

  const nextActionLabel = hasCards
    ? `${data.flashcards.length} từ mới đang chờ bạn. Chọn chủ đề và bắt đầu học ngay.`
    : hasPractice
      ? "Hết thẻ từ hôm nay rồi! Làm một phiên luyện tập nho nhỏ nhé."
      : "Xong hết việc hôm nay rồi! Làm thử một bài kiểm tra ngắn xem sao.";

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

  const displayName = user?.fullName || "Người dùng";
  const initials = displayName.slice(0, 2).toUpperCase();

  const titles: Record<TabId, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Tổng quan",
      subtitle: "Theo dõi tiến trình học tập và các hoạt động hàng ngày.",
    },
    progress: {
      title: "Tiến độ học tập",
      subtitle: "Phân tích XP, từ vựng, chủ đề và khả năng ghi nhớ.",
    },
    achievements: {
      title: "Thành tích",
      subtitle: "Bộ sưu tập huy hiệu và các cột mốc học tập.",
    },
    settings: {
      title: "Cài đặt tài khoản",
      subtitle: "Quản lý thông tin cá nhân, mục tiêu và cấu hình học tập.",
    },
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950" />;
  }

  return (
    <>
      <Topbar
        title={titles[activeTab].title}
        subtitle={titles[activeTab].subtitle}
        role="student"
        userName={displayName}
      />

      <main className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="p-4 sm:p-6">
              <DashboardSkeleton />
            </div>
          ) : error ? (
            <div className="p-4 sm:p-6">
              <DashboardError onRetry={fetchDashboard} />
            </div>
          ) : (
            <>
              {/* ── Profile Header ── */}
              <ProfileHeader
                initials={initials}
                displayName={displayName}
                email={user?.email || ""}
                currentLevel={data.stats.currentLevel || 1}
                totalXP={data.stats.totalXP || 0}
                streak={data.stats.streak || 0}
                totalLearned={data.stats.totalLearned || 0}
              />

              {/* ── Tab Navigation ── */}
              <div className="sticky top-16 z-28 -mt-px border-b border-slate-200 bg-slate-100/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
                <div className="mx-auto flex max-w-7xl px-4 sm:px-6">
                  <TabButton
                    id="dashboard"
                    label="Tổng quan"
                    icon={LayoutDashboard}
                    active={activeTab === "dashboard"}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id="progress"
                    label="Tiến độ"
                    icon={BarChart4}
                    active={activeTab === "progress"}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id="achievements"
                    label="Thành tích"
                    icon={Award}
                    active={activeTab === "achievements"}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id="settings"
                    label="Cài đặt"
                    icon={Settings}
                    active={activeTab === "settings"}
                    onClick={setActiveTab}
                  />
                </div>
              </div>

              {/* ── Tab Content ── */}
              <div className="p-4 sm:p-6">
                {activeTab === "dashboard" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
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

                    <TodaysLearning actions={actions} />

                    {data.learningPath && (
                      <DashboardLearningPath
                        roadmap={data.learningPath}
                        onContinue={() =>
                          router.push(
                            data.learningPath?.currentPosition?.activityRoute ||
                              "/user/courses",
                          )
                        }
                        onViewRoadmap={() => router.push("/user/courses")}
                      />
                    )}

                    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                      <WeeklyActivity
                        days={weeklyDays}
                        dailyGoal={data.dailyGoal}
                      />
                      <AchievementPreview
                        achievements={data.stats.achievements || []}
                        totalLearned={data.stats.totalLearned || 0}
                        correct={data.stats.correct || 0}
                        accuracy={data.stats.accuracy || 0}
                        streak={data.stats.streak || 0}
                        currentLevel={data.stats.currentLevel || 1}
                        onViewAll={() => router.push("/user/achievements")}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "progress" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {analyticsLoading && !analytics ? (
                      <div className="flex items-center justify-center py-32 text-sm text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang tải dữ liệu phân tích...
                      </div>
                    ) : analytics ? (
                      <>
                        <ProgressHero summary={analytics.summary} />
                        <ActivityHeatmap days={analytics.activity} />

                        <div className="grid gap-6 xl:grid-cols-2">
                          <XPTrendChart activity={analytics.activity} />
                          <VocabularyGrowthChart
                            points={analytics.vocabularyGrowth}
                          />
                        </div>

                        <TopicMastery topics={analytics.topicMastery} />
                        <RetentionStats stats={analytics.retention} />
                      </>
                    ) : (
                      <div className="flex min-h-105 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/4">
                        <BarChart4 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        <p className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                          Không thể tải dữ liệu tiến độ
                        </p>
                        <button
                          type="button"
                          onClick={fetchAnalytics}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Thử lại
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "achievements" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {gamificationLoading && !gamification ? (
                      <div className="flex items-center justify-center py-32 text-sm text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang tải thành tích...
                      </div>
                    ) : gamification ? (
                      <>
                        {/* Hero Section */}
                        <section className="rounded-[28px] border border-amber-200 bg-linear-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm dark:border-amber-500/20 dark:from-amber-500/10 dark:via-white/4 dark:to-orange-500/10 sm:p-7">
                          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                            <div>
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                                <Award className="h-7 w-7" />
                              </div>
                              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                                Bảng thành tích
                              </h2>
                              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Học từ mới, luyện tập mỗi ngày và làm bài kiểm
                                tra để nhận XP, mở khóa huy hiệu.
                              </p>
                            </div>
                            <LevelProgressBar
                              currentLevel={gamification.currentLevel}
                              currentLevelXP={gamification.currentLevelXP}
                              xpForNextLevel={gamification.xpForNextLevel}
                              totalXP={gamification.totalXP}
                              levelProgress={gamification.levelProgress}
                            />
                          </div>
                        </section>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <AchievementMetric
                            icon={Sparkles}
                            label="Tổng XP"
                            value={gamification.totalXP.toLocaleString("vi-VN")}
                            tone="amber"
                          />
                          <AchievementMetric
                            icon={Flame}
                            label="Streak"
                            value={`${gamification.streak} ngày`}
                            tone="rose"
                          />
                          <AchievementMetric
                            icon={Target}
                            label="Huy hiệu"
                            value={`${gamification.achievements.filter((a) => a.unlocked).length}/${gamification.achievements.length}`}
                            tone="emerald"
                          />
                        </div>

                        {/* Badge Grid */}
                        <section>
                          <div className="mb-4">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
                              Bộ sưu tập huy hiệu
                            </p>
                            <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                              Các cột mốc của bạn
                            </h3>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {gamification.achievements.map((achievement) => (
                              <BadgeCard
                                key={achievement.id}
                                achievement={achievement}
                              />
                            ))}
                          </div>
                        </section>
                      </>
                    ) : (
                      <div className="flex min-h-105 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/4">
                        <Trophy className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        <p className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                          Không thể tải dữ liệu thành tích
                        </p>
                        <button
                          type="button"
                          onClick={fetchGamification}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Thử lại
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
                    <UserSettings compact />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

function ProfileHeader({
  initials,
  displayName,
  email,
  currentLevel,
  totalXP,
  streak,
  totalLearned,
}: {
  initials: string;
  displayName: string;
  email: string;
  currentLevel: number;
  totalXP: number;
  streak: number;
  totalLearned: number;
}) {
  return (
    <div className="relative overflow-hidden bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Decorative blobs */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-pink-400/15" />
      <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-indigo-300/10" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:py-10 sm:px-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-3xl font-black text-white shadow-2xl ring-4 ring-white/10 backdrop-blur-sm sm:h-28 sm:w-28 sm:text-4xl">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
            Lv.{currentLevel}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-white/70">{email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90">
            <User className="h-3 w-3" />
            Người học
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <HeaderStat icon={Trophy} value={totalXP} label="Tổng XP" />
          <HeaderStat icon={Flame} value={streak} label="Streak" />
          <HeaderStat
            icon={BookOpenCheck}
            value={totalLearned}
            label="Đã học"
          />
        </div>
      </div>
    </div>
  );
}

function HeaderStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm">
      <Icon className="mx-auto h-4 w-4 text-white/80" />
      <p className="mt-1.5 text-lg font-black text-white">
        {value.toLocaleString("vi-VN")}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">
        {label}
      </p>
    </div>
  );
}

function TabButton({
  id,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: (id: TabId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`relative flex items-center gap-2 px-4 py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-colors ${
        active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
      )}
    </button>
  );
}

function AchievementMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone: "amber" | "rose" | "emerald";
}) {
  const styles = {
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/4 sm:p-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xl font-black text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-105 flex-col items-center justify-center rounded-[28px] border border-dashed border-rose-200 bg-white p-8 text-center dark:border-rose-500/20 dark:bg-white/4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
        Không thể tải trang học tập
      </h2>
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

// ─── Helpers ──────────────────────────────────────────────────────────

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
