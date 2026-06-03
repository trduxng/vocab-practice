import { Sparkles } from "lucide-react";

type SessionProgressProps = {
  current: number;
  total: number;
  xpEarned: number;
};

export default function SessionProgress({ current, total, xpEarned }: SessionProgressProps) {
  const progress = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Tiến độ phiên học</p>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
            Thẻ {current} <span className="text-slate-400">/ {total}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          +{xpEarned} XP
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-emerald-500 via-lime-400 to-amber-300 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
