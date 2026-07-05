"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import ActivityHeatmap from "@/src/components/user/progress/ActivityHeatmap";
import ProgressHero from "@/src/components/user/progress/ProgressHero";
import ProgressSkeleton from "@/src/components/user/progress/ProgressSkeleton";
import RetentionStats from "@/src/components/user/progress/RetentionStats";
import TopicMastery from "@/src/components/user/progress/TopicMastery";
import VocabularyGrowthChart from "@/src/components/user/progress/VocabularyGrowthChart";
import XPTrendChart from "@/src/components/user/progress/XPTrendChart";
import type { ProgressAnalytics } from "@/src/modules/user/types";
import { userService } from "@/src/services/user.service";

export default function UserProgress() {
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await userService.getProgressAnalytics();
      setAnalytics(data);
    } catch (analyticsError) {
      console.error("Failed to fetch progress analytics", analyticsError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const timeout = window.setTimeout(() => {
      void fetchAnalytics();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchAnalytics, user]);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950" />;
  }

  return (
    <>
      <Topbar
        title="Tiến độ học tập"
        subtitle="Theo dõi hoạt động, XP, vốn từ vựng và khả năng ghi nhớ."
        role="student"
        userName={user?.fullName || "Người dùng"}
      />

      <main className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <ProgressSkeleton />
          ) : error || !analytics ? (
            <ProgressError onRetry={fetchAnalytics} />
          ) : (
            <div className="space-y-6">
              <ProgressHero summary={analytics.summary} />
              <ActivityHeatmap days={analytics.activity} />

              <div className="grid gap-6 xl:grid-cols-2">
                <XPTrendChart activity={analytics.activity} />
                <VocabularyGrowthChart points={analytics.vocabularyGrowth} />
              </div>

              <TopicMastery topics={analytics.topicMastery} />
              <RetentionStats stats={analytics.retention} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ProgressError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-rose-200 bg-white p-8 text-center dark:border-rose-500/20 dark:bg-white/[0.04]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Không thể tải tiến độ học tập</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        Dữ liệu phân tích chưa sẵn sàng. Hãy thử tải lại trang.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        <RefreshCw className="h-4 w-4" />
        Tải lại
      </button>
    </div>
  );
}
