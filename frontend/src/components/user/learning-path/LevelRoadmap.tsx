import { CheckCircle2, Lock, MapPin } from "lucide-react";
import type { LearningPathLevel } from "@/src/modules/user/types";
import PathStatusBadge from "./PathStatusBadge";

type LevelRoadmapProps = {
  levels: LearningPathLevel[];
  selectedLevelId?: number;
  onSelect: (levelId: number) => void;
};

const levelTones: Record<string, string> = {
  sky: "from-sky-500 to-cyan-400",
  emerald: "from-emerald-500 to-lime-400",
  amber: "from-amber-500 to-orange-400",
  violet: "from-violet-500 to-fuchsia-400",
};

export default function LevelRoadmap({ levels, selectedLevelId, onSelect }: LevelRoadmapProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Lộ trình học tập</p>
      <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">Chọn cột mốc TOEIC của bạn</h2>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-max items-stretch gap-3 lg:grid lg:min-w-0 lg:grid-cols-4">
          {levels.map((level, index) => {
            const selected = level.id === selectedLevelId;
            const tone = levelTones[level.accentKey] || levelTones.sky;
            const StatusIcon = level.status === "completed" ? CheckCircle2 : level.status === "locked" ? Lock : MapPin;

            return (
              <button
                key={level.id}
                type="button"
                onClick={() => onSelect(level.id)}
                className={`relative w-64 overflow-hidden rounded-2xl border p-4 text-left transition-all lg:w-auto ${
                  selected
                    ? "border-blue-300 bg-blue-50 shadow-md dark:border-blue-500/40 dark:bg-blue-500/10"
                    : "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20"
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${tone}`} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Giai đoạn {index + 1}</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{level.title}</h3>
                  </div>
                  <StatusIcon className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">{level.description}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <PathStatusBadge status={level.status} />
                  <span className="text-xs font-black text-slate-500">{level.completionPercentage}%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className={`h-full rounded-full bg-linear-to-r ${tone}`} style={{ width: `${level.completionPercentage}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
