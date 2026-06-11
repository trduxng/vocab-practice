import { Crown, Sparkles } from "lucide-react";

type LevelProgressBarProps = {
  currentLevel: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  totalXP: number;
  levelProgress: number;
  compact?: boolean;
};

export default function LevelProgressBar({
  currentLevel,
  currentLevelXP,
  xpForNextLevel,
  totalXP,
  levelProgress,
  compact = false,
}: LevelProgressBarProps) {
  return (
    <div className={compact ? "" : "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <Crown className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Cấp độ hiện tại</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">Level {currentLevel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          {totalXP} XP
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, levelProgress))}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
        <span>{currentLevelXP}/{xpForNextLevel} XP</span>
        <span>Level {currentLevel + 1}</span>
      </div>
    </div>
  );
}
