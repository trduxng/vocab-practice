import { ArrowRight, BookOpenCheck, MapPinned } from "lucide-react";
import type { LearningPathRoadmap } from "@/src/modules/user/types";

type DashboardLearningPathProps = {
  roadmap: LearningPathRoadmap;
  onContinue: () => void;
  onViewRoadmap: () => void;
};

export default function DashboardLearningPath({ roadmap, onContinue, onViewRoadmap }: DashboardLearningPathProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Lộ trình học tập</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">Mốc TOEIC tiếp theo của bạn</h2>
        </div>
        <button type="button" onClick={onViewRoadmap} className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
          Xem lộ trình <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-stretch">
        <LessonPreview icon={MapPinned} label="Bài học hiện tại" lesson={roadmap.currentLesson} />
        <LessonPreview icon={BookOpenCheck} label="Bài học tiếp theo" lesson={roadmap.nextLesson} />
        <button
          type="button"
          onClick={onContinue}
          disabled={!roadmap.currentPosition}
          className="inline-flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-xs font-black uppercase tracking-wide text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tiếp tục <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wide text-slate-400">
          <span>Tiến độ lộ trình</span>
          <span>{roadmap.completionPercentage}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-linear-to-r from-indigo-500 to-sky-400" style={{ width: `${roadmap.completionPercentage}%` }} />
        </div>
      </div>
    </section>
  );
}

function LessonPreview({ icon: Icon, label, lesson }: { icon: React.ElementType; label: string; lesson: LearningPathRoadmap["currentLesson"] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.025]">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-3 truncate text-sm font-black text-slate-800 dark:text-slate-100">{lesson?.title || "Đã hoàn thành lộ trình"}</p>
      <p className="mt-1 text-[11px] text-slate-400">{lesson ? `${lesson.completionPercentage}% hoàn thành` : "Không có bài học thêm"}</p>
    </div>
  );
}
