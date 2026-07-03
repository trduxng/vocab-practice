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
    <section className="relative overflow-hidden rounded-[28px] border border-emerald-400/40 bg-linear-to-br from-emerald-500 via-emerald-500 to-teal-600 p-5 text-white shadow-xl shadow-emerald-500/15 sm:p-7 lg:p-8">
      <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-teal-800/15" />
      <Sparkles className="absolute right-8 top-7 h-7 w-7 text-emerald-100/60" />

      <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]">
            <Zap className="h-3.5 w-3.5 fill-current" />
            Lộ trình hôm nay
          </div>
          <h2 className="max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Mỗi ngày một bước, từ vựng sẽ thành phản xạ.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-50/85">
            {nextActionLabel}
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-emerald-700 shadow-lg shadow-emerald-900/15 transition-transform hover:-translate-y-0.5 hover:bg-emerald-50 sm:w-auto"
          >
            Tiếp tục học
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/12 p-4 backdrop-blur-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                Mục tiêu hàng ngày
              </p>
              <p className="mt-1 text-2xl font-black">
                {todayCount}<span className="text-base text-emerald-100">/{dailyGoal}</span>
              </p>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(#ffffff ${dailyProgress}%, rgba(255,255,255,0.2) 0)` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-xs font-black">
                {Math.round(dailyProgress)}%
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <HeroMetric icon={Flame} label="Chuỗi ngày" value={`${streak} ngày`} />
            <HeroMetric icon={Sparkles} label="Hôm nay" value={`${todayXP} XP`} />
            <HeroMetric icon={Star} label="Tổng XP" value={`${totalXP} XP`} />
            <HeroMetric icon={Target} label="Cấp độ" value={`Lv.${currentLevel}`} />
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-emerald-50/80">
              <span>Tiến độ cấp {currentLevel}</span>
              <span>{currentLevelXP}/{xpForNextLevel} XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
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
};

function HeroMetric({ icon: Icon, label, value }: HeroMetricProps) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <Icon className="mb-2 h-4 w-4 text-emerald-100" />
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/80">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}
