import { ArrowRight, BookOpenCheck, MapPinned } from "lucide-react";
import type { LearningPathRoadmap } from "@/src/modules/user/types";

type DashboardLearningPathProps = {
  roadmap: LearningPathRoadmap;
  onContinue: () => void;
  onViewRoadmap: () => void;
};

export default function DashboardLearningPath({ roadmap, onContinue, onViewRoadmap }: DashboardLearningPathProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Lộ trình</p>
          <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-950 dark:text-white">Mục tiêu TOEIC tiếp theo</h2>
        </div>
        <button type="button" onClick={onViewRoadmap} className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
          Xem lộ trình <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-stretch">
        <LessonPreview icon={MapPinned} label="Bài học hiện tại" lesson={roadmap.currentLesson} />
        <LessonPreview icon={BookOpenCheck} label="Bài học tiếp theo" lesson={roadmap.nextLesson} />
        <button
          type="button"
          onClick={onContinue}
          disabled={!roadmap.currentPosition}
          className="inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-[10px] font-black uppercase tracking-wide text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tiếp tục <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[9px] font-black uppercase tracking-wide text-slate-400">
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
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-white/5 dark:bg-white/[0.025]">
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-2 truncate text-xs font-black text-slate-800 dark:text-slate-100">{lesson?.title || "Hoàn thành lộ trình"}</p>
      <p className="mt-0.5 text-[10px] text-slate-400">{lesson ? `${lesson.completionPercentage}% hoàn thành` : "Không có bài học thêm"}</p>
    </div>
  );
}
