import { BookOpenCheck, Brain, ClipboardCheck, Eye, Lock, Play } from "lucide-react";
import type { LearningPathActivity, LearningPathLevel, LearningPathTopic } from "@/src/modules/user/types";
import PathStatusBadge from "./PathStatusBadge";

type TopicRoadmapProps = {
  level?: LearningPathLevel;
  onOpenActivity: (activity: LearningPathActivity) => void;
  onPreviewTopic: (topic: LearningPathTopic) => void;
};

const activityIcons = {
  lesson: BookOpenCheck,
  practice: Brain,
  miniTest: ClipboardCheck,
};

export default function TopicRoadmap({ level, onOpenActivity, onPreviewTopic }: TopicRoadmapProps) {
  if (!level) return null;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Lộ trình chi tiết</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">Chủ đề {level.title}</h2>
        </div>
        <PathStatusBadge status={level.status} />
      </div>

      {level.topics.length === 0 ? (
        <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <Lock className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Chủ đề sẽ sớm được cập nhật cho cấp độ này.</p>
        </div>
      ) : (
        <div className="relative mt-6 space-y-5 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-slate-200 dark:before:bg-white/10 sm:before:left-6">
          {level.topics.map((topic, index) => (
            <article key={topic.pathTopicId} className="relative pl-12 sm:pl-15">
              <div className={`absolute left-0 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-xs font-black shadow-sm dark:border-slate-950 sm:h-12 sm:w-12 ${
                topic.status === "completed"
                  ? "bg-emerald-500 text-white"
                  : topic.status === "available"
                    ? "bg-sky-500 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {index + 1}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.025] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{topic.code || `Bài ${index + 1}`}</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{topic.title}</h3>
                    <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {topic.description || "Học từ vựng theo chủ đề, luyện tập và kiểm tra lại."}
                    </p>
                  </div>
                  <PathStatusBadge status={topic.status} />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {topic.activities.map((activity) => (
                    <ActivityCard key={activity.type} activity={activity} onOpen={() => onOpenActivity(activity)} />
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-slate-400">
                    {topic.learnedWords}/{topic.totalWords} đã học - {topic.masteredWords} nắm vững
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onPreviewTopic(topic)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-sky-300 dark:hover:border-sky-500/40"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Xem từ vựng
                    </button>
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300">{topic.completionPercentage}% hoàn thành</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-linear-to-r from-sky-500 to-emerald-400" style={{ width: `${topic.completionPercentage}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityCard({ activity, onOpen }: { activity: LearningPathActivity; onOpen: () => void }) {
  const Icon = activityIcons[activity.type];
  const disabled = activity.status === "locked" || !activity.configured;

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-sky-300 disabled:cursor-not-allowed disabled:opacity-55 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-sky-500/40"
    >
      <div className="flex items-center justify-between gap-2">
        <Icon className="h-4 w-4 text-sky-600 dark:text-sky-300" />
        {disabled ? <Lock className="h-3.5 w-3.5 text-slate-400" /> : <Play className="h-3.5 w-3.5 text-slate-400" />}
      </div>
      <p className="mt-3 text-xs font-black text-slate-800 dark:text-slate-100">{activity.title}</p>
      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400">{activity.description}</p>
      <div className="mt-3">
        <PathStatusBadge status={activity.status} />
      </div>
    </button>
  );
}
