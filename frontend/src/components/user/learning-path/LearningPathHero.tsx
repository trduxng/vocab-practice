import { BookOpenCheck, Flag, MapPinned, Trophy } from "lucide-react";
import type { LearningPathRoadmap } from "@/src/modules/user/types";

type LearningPathHeroProps = {
  roadmap: LearningPathRoadmap;
  onContinue: () => void;
};

export default function LearningPathHero({ roadmap, onContinue }: LearningPathHeroProps) {
  const current = roadmap.currentPosition;

  return (
    <section className="overflow-hidden rounded-[30px] bg-linear-to-br from-indigo-700 via-blue-700 to-sky-600 p-5 text-white shadow-xl shadow-blue-900/15 sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-100">TOEIC learning path</p>
          <h1 className="mt-2 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
            Build your score one focused lesson at a time.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-100/90">
            Move from TOEIC 300 to TOEIC 900 through lessons, practice sessions, and mini tests.
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={!current}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-blue-700 shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Flag className="h-4 w-4" />
          {current ? "Continue path" : "Path completed"}
        </button>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HeroMetric icon={MapPinned} value={`${roadmap.completionPercentage}%`} label="Roadmap complete" />
        <HeroMetric icon={BookOpenCheck} value={`${roadmap.completedTopics}/${roadmap.totalTopics}`} label="Topics complete" />
        <HeroMetric icon={Trophy} value={current?.levelTitle || "TOEIC 900"} label="Current level" />
        <HeroMetric icon={Flag} value={current?.activityTitle || "Complete"} label="Current position" />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-[11px] font-black uppercase tracking-wide text-sky-100/85">
          <span>Overall progress</span>
          <span>{roadmap.completionPercentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${roadmap.completionPercentage}%` }} />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:p-4">
      <Icon className="h-4 w-4 text-sky-100" />
      <p className="mt-3 truncate text-lg font-black sm:text-xl">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-sky-100/75">{label}</p>
    </div>
  );
}
