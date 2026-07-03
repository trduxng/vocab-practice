import { ArrowRight, Award, LockKeyhole, Trophy } from "lucide-react";

export type Achievement = {
  id: number;
  icon: string;
  label: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  progressPercentage?: number;
};

type AchievementPreviewProps = {
  achievements: Achievement[];
  totalLearned: number;
  correct: number;
  accuracy: number;
  streak: number;
  currentLevel: number;
  onViewAll: () => void;
};

type ProgressResult = {
  value: number;
  target: number;
  detail: string;
};

export default function AchievementPreview({
  achievements,
  totalLearned,
  correct,
  accuracy,
  streak,
  currentLevel,
  onViewAll,
}: AchievementPreviewProps) {
  const unlocked = achievements.filter((achievement) => achievement.unlocked).slice(-3).reverse();
  const nextAchievement = achievements.find((achievement) => !achievement.unlocked);
  const nextProgress = nextAchievement
    ? getAchievementProgress(nextAchievement.id, { totalLearned, correct, accuracy, streak, currentLevel })
    : null;
  const percentage = nextAchievement?.progressPercentage ?? (nextProgress
    ? Math.min(100, Math.round((nextProgress.value / nextProgress.target) * 100))
    : 100);
  const progressDetail = nextAchievement?.target
    ? `${nextAchievement.progress || 0}/${nextAchievement.target}`
    : nextProgress?.detail;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            Thành tích
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
            Huy hiệu gần đây
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <Trophy className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6">
        {unlocked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <Award className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Huy hiệu đầu tiên đang chờ bạn</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bắt đầu một bài học để mở khóa thành tích.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {unlocked.map((achievement) => (
              <div key={achievement.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 text-center dark:border-amber-500/15 dark:bg-amber-500/[0.06]">
                <div className="text-2xl" aria-hidden="true">{achievement.icon}</div>
                <p className="mt-2 truncate text-[11px] font-black text-slate-800 dark:text-slate-100" title={achievement.label}>
                  {achievement.label}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Đã mở khóa</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.025]">
        {nextAchievement && nextProgress ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Thành tích tiếp theo</p>
                <p className="truncate text-sm font-black text-slate-800 dark:text-slate-100">{nextAchievement.label}</p>
              </div>
              <span className="text-xs font-black text-slate-600 dark:text-slate-300">{percentage}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-400" style={{ width: `${percentage}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{progressDetail}</p>
          </>
        ) : (
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Bạn đã mở khóa toàn bộ huy hiệu hiện có.</p>
        )}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 transition-colors hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-300"
      >
        Xem tất cả thành tích
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}

function getAchievementProgress(
  id: number,
  stats: { totalLearned: number; correct: number; accuracy: number; streak: number; currentLevel: number },
): ProgressResult {
  switch (id) {
    case 1:
      return { value: stats.totalLearned, target: 1, detail: `${stats.totalLearned}/1 từ đã học` };
    case 2:
      return { value: stats.correct, target: 100, detail: `${stats.correct}/100 câu trả lời đúng` };
    case 3:
      return { value: Math.round(stats.accuracy), target: 90, detail: `${Math.round(stats.accuracy)}/90% độ chính xác` };
    case 4:
      return { value: stats.totalLearned, target: 50, detail: `${stats.totalLearned}/50 từ đã thành thạo` };
    case 5:
      return { value: stats.streak, target: 7, detail: `${stats.streak}/7 ngày học liên tiếp` };
    case 6:
      return { value: stats.correct, target: 10, detail: `${stats.correct}/10 câu trả lời đúng` };
    case 7:
      return { value: stats.totalLearned, target: 20, detail: `${stats.totalLearned}/20 từ đã học` };
    default:
      return { value: stats.currentLevel, target: 10, detail: `Cấp ${stats.currentLevel}/10` };
  }
}
