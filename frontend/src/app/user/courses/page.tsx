"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpen, BookOpenCheck, Brain, ClipboardCheck, Eye, Lock, Play, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import LearningPathHero from "@/src/components/user/learning-path/LearningPathHero";
import LearningPathSkeleton from "@/src/components/user/learning-path/LearningPathSkeleton";
import LevelRoadmap from "@/src/components/user/learning-path/LevelRoadmap";
import PathStatusBadge from "@/src/components/user/learning-path/PathStatusBadge";
import VocabularyPreviewDialog from "@/src/components/user/notebook/VocabularyPreviewDialog";
import type { LearningPathActivity, LearningPathRoadmap, LearningPathTopic } from "@/src/modules/user/types";
import { userService } from "@/src/services/user.service";

const activityIcons = {
  lesson: BookOpenCheck,
  practice: Brain,
  miniTest: ClipboardCheck,
};

const levelTones: Record<string, string> = {
  sky: "from-sky-500 to-cyan-400",
  emerald: "from-emerald-500 to-lime-400",
  amber: "from-amber-500 to-orange-400",
  violet: "from-violet-500 to-fuchsia-400",
};

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

  if (authLoading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950" />;
  }

  return (
    <>
      <Topbar
        title="Lộ trình học TOEIC"
        subtitle="Chọn chủ đề, xem tiến độ và bắt đầu học."
        role="student"
        userName={user?.fullName || "Người học"}
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

              {selectedLevel && (
                <section className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
                        Chủ đề {selectedLevel.targetScore} điểm
                      </p>
                      <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                        {selectedLevel.title}
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{selectedLevel.topics.length} chủ đề</span>
                  </div>

                  {selectedLevel.topics.length === 0 ? (
                    <div className="flex min-h-44 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
                      <Lock className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có chủ đề nào ở cấp độ này.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {selectedLevel.topics.map((topic) => (
                        <TopicCard
                          key={topic.pathTopicId}
                          topic={topic}
                          accentKey={selectedLevel.accentKey}
                          onOpenActivity={(route) => router.push(route)}
                          onPreview={() => setPreviewTopic(topic)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <VocabularyPreviewDialog
        open={!!previewTopic}
        onOpenChange={(open) => {
          if (!open) setPreviewTopic(undefined);
        }}
        initialTopicId={previewTopic?.topicId}
        onStartLearning={(topicId) => router.push(`/user/learn/${topicId}`)}
      />
    </>
  );
}

function TopicCard({
  topic,
  accentKey,
  onOpenActivity,
  onPreview,
}: {
  topic: LearningPathTopic;
  accentKey: string;
  onOpenActivity: (route: string) => void;
  onPreview: () => void;
}) {
  const progress = topic.totalWords > 0 ? Math.round((topic.learnedWords / topic.totalWords) * 100) : 0;
  const tone = levelTones[accentKey] || levelTones.sky;

  return (
    <div className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
      <button
        type="button"
        onClick={() => onOpenActivity(`/user/learn/${topic.topicId}`)}
        className="w-full text-left"
      >
        <div className={`bg-linear-to-br ${tone} p-5 text-white`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/15">
              <BookOpen className="h-6 w-6" />
            </div>
            <PathStatusBadge status={topic.status} />
          </div>
          <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">{topic.code || "Từ vựng TOEIC"}</p>
          <h3 className="mt-1 min-h-14 text-lg font-black leading-6">{topic.title}</h3>
        </div>
      </button>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs font-bold">
          <span className="text-emerald-600 dark:text-emerald-300">{topic.learnedWords}/{topic.totalWords} đã học</span>
          <span className="text-slate-400">{topic.masteredWords} thành thạo</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div className={`h-full rounded-full bg-linear-to-r ${tone}`} style={{ width: `${progress}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {topic.activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const disabled = activity.status === "locked" || !activity.configured;
            return (
              <button
                key={activity.type}
                type="button"
                disabled={disabled}
                onClick={() => onOpenActivity(activity.route)}
                className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-center transition-all hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-sky-500/40"
                title={activity.title}
              >
                {disabled ? <Lock className="h-4 w-4 text-slate-400" /> : <Icon className="h-4 w-4 text-sky-600 dark:text-sky-300" />}
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {activity.type === "lesson" ? "Bài học" : activity.type === "practice" ? "Luyện tập" : "Kiểm tra"}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-[10px] font-black uppercase tracking-wide text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-300 dark:hover:border-sky-500/40"
        >
          <Eye className="h-3.5 w-3.5" />
          Xem từ vựng
        </button>
      </div>
    </div>
  );
}

function LearningPathError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-rose-200 bg-white p-8 text-center dark:border-rose-500/20 dark:bg-white/[0.04]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Không thể tải lộ trình học tập</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        Lộ trình chưa sẵn sàng. Hãy thử tải lại trang.
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
