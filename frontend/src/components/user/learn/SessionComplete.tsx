import { ArrowRight, Check, RotateCcw, Sparkles, Target } from "lucide-react";
import LevelProgressBar from "@/src/components/user/gamification/LevelProgressBar";

type SessionCompleteProps = {
  totalCards: number;
  xpEarned: number;
  remembered: number;
  again: number;
  totalXP: number;
  currentLevel: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  levelProgress: number;
  onRestart: () => void;
  onFinish: () => void;
};

export default function SessionComplete({
  totalCards,
  xpEarned,
  remembered,
  again,
  totalXP,
  currentLevel,
  currentLevelXP,
  xpForNextLevel,
  levelProgress,
  onRestart,
  onFinish,
}: SessionCompleteProps) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
        <Check className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Hoàn thành phiên học</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Bạn đã học {totalCards} thẻ. Những từ chưa nhớ sẽ được ôn lại vào hôm khác.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Metric icon={Sparkles} label="XP" value={`+${xpEarned}`} tone="amber" />
        <Metric icon={Target} label="Đã nhớ" value={remembered} tone="emerald" />
        <Metric icon={RotateCcw} label="Học lại" value={again} tone="rose" />
      </div>

      <div className="mt-5 text-left">
        <LevelProgressBar
          totalXP={totalXP}
          currentLevel={currentLevel}
          currentLevelXP={currentLevelXP}
          xpForNextLevel={xpForNextLevel}
          levelProgress={levelProgress}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onRestart} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
          Học thêm
        </button>
        <button type="button" onClick={onFinish} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-emerald-500">
          Về trang học tập
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone: "amber" | "emerald" | "rose";
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  };

  return (
    <div className={`rounded-2xl p-3 ${tones[tone]}`}>
      <Icon className="mx-auto h-4 w-4" />
      <p className="mt-2 text-xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider opacity-75">{label}</p>
    </div>
  );
}
