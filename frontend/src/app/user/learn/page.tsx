"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Layers3, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import type { LearningPathRoadmap, LearningPathTopic } from "@/src/modules/user/types";
import { userService } from "@/src/services/user.service";

export default function VocabularyTopicsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<LearningPathRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      setRoadmap(await userService.getLearningPath());
    } catch (topicsError) {
      console.error("Failed to load vocabulary topics", topicsError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const timeout = window.setTimeout(() => {
      void fetchTopics();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchTopics, user]);

  const topics = useMemo(
    () => roadmap?.levels.flatMap((level) => level.topics).filter((topic) => topic.totalWords > 0) || [],
    [roadmap],
  );
  const totalWords = topics.reduce((sum, topic) => sum + topic.totalWords, 0);
  const learnedWords = topics.reduce((sum, topic) => sum + topic.learnedWords, 0);
  const masteredWords = topics.reduce((sum, topic) => sum + topic.masteredWords, 0);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950" />;
  }

  return (
    <>
      <Topbar
        title="Học từ theo chủ đề"
        subtitle="Chọn chủ đề, xem danh sách từ và bắt đầu học flashcard."
        role="student"
        userName={user?.fullName || "Người học"}
      />

      <main className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <TopicsSkeleton />
          ) : error || !roadmap ? (
            <TopicsError onRetry={fetchTopics} />
          ) : topics.length === 0 ? (
            <EmptyTopics />
          ) : (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[30px] bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 p-5 text-white shadow-xl shadow-emerald-900/15 sm:p-7">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Lộ trình từ vựng</p>
                    <h1 className="mt-2 max-w-2xl text-2xl font-black tracking-tight sm:text-4xl">
                      Chọn chủ đề bạn muốn học hôm nay.
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90">
                      Mỗi chủ đề có bộ từ riêng. Xem trước nội dung, lưu từ quan trọng và học bằng flashcard.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(roadmap.currentLesson?.route || `/user/learn/${topics[0].topicId}`)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-emerald-700 shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    <Sparkles className="h-4 w-4" />
                    Tiếp tục học
                  </button>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <HeroMetric icon={Layers3} value={`${topics.length}`} label="Chủ đề" />
                  <HeroMetric icon={BookOpen} value={`${learnedWords}/${totalWords}`} label="Từ đã học" />
                  <HeroMetric icon={CheckCircle2} value={`${masteredWords}`} label="Đã thành thạo" />
                  <HeroMetric icon={Trophy} value={`${roadmap.completionPercentage}%`} label="Tiến độ lộ trình" />
                </div>
              </section>

              {roadmap.levels.map((level) => {
                const levelTopics = level.topics.filter((topic) => topic.totalWords > 0);
                if (levelTopics.length === 0) return null;

                return (
                  <section key={level.id}>
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                          Mục tiêu {level.targetScore} điểm
                        </p>
                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">{level.title}</h2>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{levelTopics.length} chủ đề</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {levelTopics.map((topic) => (
                        <TopicCard key={topic.pathTopicId} topic={topic} onOpen={() => router.push(`/user/learn/${topic.topicId}`)} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function TopicCard({ topic, onOpen }: { topic: LearningPathTopic; onOpen: () => void }) {
  const progress = topic.totalWords > 0 ? Math.round((topic.learnedWords / topic.totalWords) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-emerald-500/40"
    >
      <div className="bg-linear-to-br from-emerald-500 via-teal-600 to-cyan-700 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/15">
            <BookOpen className="h-6 w-6" />
          </div>
          <ArrowRight className="h-5 w-5 text-white/70 transition-transform group-hover:translate-x-1" />
        </div>
        <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">{topic.code || "Từ vựng TOEIC"}</p>
        <h3 className="mt-1 min-h-14 text-lg font-black leading-6">{topic.title}</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 text-xs font-bold">
          <span className="text-emerald-600 dark:text-emerald-300">{topic.learnedWords}/{topic.totalWords} đã học</span>
          <span className="text-slate-400">{topic.masteredWords} thành thạo</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </button>
  );
}

function HeroMetric({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:p-4">
      <Icon className="h-4 w-4 text-emerald-100" />
      <p className="mt-3 text-lg font-black sm:text-xl">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-emerald-100/75">{label}</p>
    </div>
  );
}

function TopicsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-72 rounded-[30px] bg-slate-200 dark:bg-white/10" />
      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section}>
          <div className="mb-3 h-7 w-40 rounded-lg bg-slate-200 dark:bg-white/10" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((__, index) => (
              <div key={index} className="h-64 rounded-[24px] bg-slate-200 dark:bg-white/10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-rose-200 bg-white p-8 text-center dark:border-rose-500/20 dark:bg-white/[0.04]">
      <AlertCircle className="h-10 w-10 text-rose-500" />
      <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Không thể tải danh sách chủ đề</h2>
      <button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white dark:bg-white dark:text-slate-950">
        <RefreshCw className="h-4 w-4" />
        Thử lại
      </button>
    </div>
  );
}

function EmptyTopics() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <BookOpen className="h-10 w-10 text-slate-300" />
      <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Chưa có chủ đề để học</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">Chủ đề đã xuất bản sẽ hiển thị ở đây.</p>
    </div>
  );
}
