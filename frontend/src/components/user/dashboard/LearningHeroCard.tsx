import { ArrowRight, Flame, Sparkles, Star, Target, Zap } from "lucide-react";

type LearningHeroCardProps = {
  streak: number;
  todayCount: number;
  dailyGoal: number;
  todayXP: number;
  currentLevel: number;
  totalXP: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  levelProgress: number;
  nextActionLabel: string;
  onContinue: () => void;
};

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value));

export default function LearningHeroCard({
  streak,
  todayCount,
  dailyGoal,
  todayXP,
  currentLevel,
  totalXP,
  currentLevelXP,
  xpForNextLevel,
  levelProgress,
  nextActionLabel,
  onContinue,
}: LearningHeroCardProps) {
  const dailyProgress = dailyGoal > 0 ? clampPercentage((todayCount / dailyGoal) * 100) : 0;
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-emerald-400/40 bg-linear-to-br from-emerald-500 via-emerald-500 to-teal-600 px-3 py-3 text-white shadow-xl shadow-emerald-500/15 sm:px-4 sm:py-4">
      <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-teal-800/15" />
      <Sparkles className="absolute right-6 top-5 h-5 w-5 text-emerald-100/60" />

      <div className="relative grid gap-3 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]">
            <Zap className="h-3 w-3 fill-current" />
            Lộ trình hôm nay
          </div>
          <h2 className="max-w-xl text-xl font-black leading-tight tracking-tight sm:text-2xl">
            Mỗi ngày một bước, từ vựng sẽ thành phản xạ.
          </h2>
          <p className="mt-1 max-w-sm text-xs leading-5 text-emerald-50/85">
            {nextActionLabel}
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-1.5 text-xs font-black text-emerald-700 shadow-lg shadow-emerald-900/15 transition-transform hover:-translate-y-0.5 hover:bg-emerald-50 sm:w-auto"
          >
            Tiếp tục học
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/12 p-2 backdrop-blur-sm sm:p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">
                Mục tiêu hàng ngày
              </p>
              <p className="mt-1 text-xl font-black">
                {todayCount}<span className="text-sm text-emerald-100">/{dailyGoal}</span>
              </p>
            </div>
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full shrink-0"
              style={{ background: `conic-gradient(#ffffff ${dailyProgress}%, rgba(255,255,255,0.2) 0)` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black">
                {Math.round(dailyProgress)}%
              </div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            <HeroMetric icon={Flame} label="Chuỗi ngày" value={`${streak} ngày`} tone="rose" />
            <HeroMetric icon={Sparkles} label="Hôm nay" value={`${todayXP} XP`} tone="amber" />
            <HeroMetric icon={Star} label="Tổng XP" value={`${totalXP} XP`} tone="violet" />
            <HeroMetric icon={Target} label="Cấp độ" value={`Lv.${currentLevel}`} tone="blue" />
          </div>

          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-emerald-50/80">
              <span>Tiến độ cấp {currentLevel}</span>
              <span>{currentLevelXP}/{xpForNextLevel} XP</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-amber-300 transition-all duration-700"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type HeroMetricProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "rose" | "amber" | "violet" | "blue";
};

const heroMetricGradients = {
  rose: "from-rose-400/80 to-red-500/80",
  amber: "from-amber-400/80 to-orange-500/80",
  violet: "from-violet-400/80 to-purple-500/80",
  blue: "from-sky-400/80 to-blue-500/80",
};

function HeroMetric({ icon: Icon, label, value, tone = "blue" }: HeroMetricProps) {
  return (
    <div className="group rounded-xl bg-white/10 p-1.5 backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20">
      <div className={`mb-1 flex h-5 w-5 items-center justify-center rounded-lg bg-linear-to-br text-white shadow-xs transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm ${heroMetricGradients[tone]}`}>
        <Icon className="h-2.5 w-2.5" />
      </div>
      <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-100/80">{label}</p>
      <p className="mt-0.5 text-[11px] font-black">{value}</p>
    </div>
  );
}
