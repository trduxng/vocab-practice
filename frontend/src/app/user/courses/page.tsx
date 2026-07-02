"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import LearningPathHero from "@/src/components/user/learning-path/LearningPathHero";
import LearningPathSkeleton from "@/src/components/user/learning-path/LearningPathSkeleton";
import LevelRoadmap from "@/src/components/user/learning-path/LevelRoadmap";
import TopicRoadmap from "@/src/components/user/learning-path/TopicRoadmap";
import VocabularyPreviewDialog from "@/src/components/user/notebook/VocabularyPreviewDialog";
import type { LearningPathActivity, LearningPathRoadmap, LearningPathTopic } from "@/src/modules/user/types";
import { userService } from "@/src/services/user.service";

export default function UserCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [roadmap, setRoadmap] = useState<LearningPathRoadmap | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewTopic, setPreviewTopic] = useState<LearningPathTopic>();
  const router = useRouter();

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await userService.getLearningPath();
      setRoadmap(data);
      setSelectedLevelId((current) => current || data.levels.find((level) => level.status === "available")?.id || data.levels[0]?.id);
    } catch (roadmapError) {
      console.error("Failed to fetch learning path", roadmapError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const timeout = window.setTimeout(() => {
      void fetchRoadmap();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchRoadmap, user]);

  const selectedLevel = useMemo(
    () => roadmap?.levels.find((level) => level.id === selectedLevelId) || roadmap?.levels[0],
    [roadmap, selectedLevelId],
  );
  const previewTopics = useMemo(() => previewTopic ? [previewTopic] : [], [previewTopic]);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950" />;
  }

  return (
    <>
      <Topbar
        title="Lộ trình học TOEIC"
        subtitle="Học theo trình tự từ bài học, luyện tập đến kiểm tra."
        role="student"
        userName={user?.fullName || "Bạn"}
      />

      <main className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <LearningPathSkeleton />
          ) : error || !roadmap ? (
            <LearningPathError onRetry={fetchRoadmap} />
          ) : (
            <div className="space-y-6">
              <LearningPathHero
                roadmap={roadmap}
                onContinue={() => router.push(roadmap.currentPosition?.activityRoute || "/user/courses")}
              />
              <LevelRoadmap levels={roadmap.levels} selectedLevelId={selectedLevel?.id} onSelect={setSelectedLevelId} />
              <TopicRoadmap
                level={selectedLevel}
                onOpenActivity={(activity: LearningPathActivity) => router.push(activity.route)}
                onPreviewTopic={setPreviewTopic}
              />
            </div>
          )}
        </div>
      </main>

      <VocabularyPreviewDialog
        open={!!previewTopic}
        onOpenChange={(open) => {
          if (!open) setPreviewTopic(undefined);
        }}
        topics={previewTopics}
        initialTopicId={previewTopic?.topicId}
        onStartLearning={(topicId) => router.push(`/user/learn/${topicId}`)}
      />
    </>
  );
}

function LearningPathError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-rose-200 bg-white p-8 text-center dark:border-rose-500/20 dark:bg-white/[0.04]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Không thể tải lộ trình học</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        Lộ trình chưa sẵn sàng. Thử tải lại trang nhé.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        <RefreshCw className="h-4 w-4" />
        Thử lại
      </button>
    </div>
  );
}
