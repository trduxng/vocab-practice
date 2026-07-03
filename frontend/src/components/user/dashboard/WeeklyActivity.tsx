import { BarChart3, BookCheck, CalendarCheck2, Sparkles } from "lucide-react";

export type WeeklyActivityDay = {
  date: string;
  label: string;
  count: number;
  xpEarned: number;
};

type WeeklyActivityProps = {
  days: WeeklyActivityDay[];
  dailyGoal: number;
};

export default function WeeklyActivity({ days, dailyGoal }: WeeklyActivityProps) {
  const maxActivity = Math.max(...days.map((day) => day.count), 1);
  const totalActivity = days.reduce((sum, day) => sum + day.count, 0);
  const xpEarned = days.reduce((sum, day) => sum + day.xpEarned, 0);
  const completedLessons = days.filter((day) => day.count >= dailyGoal).length;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:px-4 sm:py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
            Hoạt động tuần này
          </p>
          <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-950 dark:text-white">
            Nhịp học trong 7 ngày qua
          </h2>
        </div>
        <div className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          {totalActivity} lượt học
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <WeeklyMetric icon={BarChart3} label="Hoạt động" value={totalActivity} detail="lượt trả lời" tone="sky" />
        <WeeklyMetric icon={Sparkles} label="XP nhận được" value={xpEarned} detail="trong 7 ngày" tone="amber" />
        <WeeklyMetric icon={BookCheck} label="Bài học hoàn tất" value={completedLessons} detail="ngày đạt mục tiêu" tone="emerald" />
      </div>

      <div className="mt-3">
        {totalActivity === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <CalendarCheck2 className="h-6 w-6 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">Chưa có hoạt động trong tuần này</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              Hoàn thành một hoạt động để bắt đầu biểu đồ tiến độ.
            </p>
          </div>
        ) : (
          <div className="flex h-32 items-end gap-1.5 sm:gap-3">
            {days.map((day) => {
              const height = day.count > 0 ? Math.max(12, (day.count / maxActivity) * 100) : 3;
              const reachedGoal = day.count >= dailyGoal;

              return (
                <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[9px] font-bold text-slate-400">{day.count || ""}</span>
                  <div className="flex h-20 w-full max-w-8 items-end rounded-full bg-slate-100 p-1 dark:bg-white/[0.05]">
                    <div
                      className={`w-full rounded-full transition-all duration-700 ${
                        reachedGoal
                          ? "bg-linear-to-t from-emerald-500 to-lime-400"
                          : "bg-linear-to-t from-sky-500 to-cyan-300"
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${day.count} lượt học, ${day.xpEarned} XP`}
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{day.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

type WeeklyMetricProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  detail: string;
  tone: "sky" | "amber" | "emerald";
};

const metricTones = {
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
};

function WeeklyMetric({ icon: Icon, label, value, detail, tone }: WeeklyMetricProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-2 dark:border-white/5 dark:bg-white/[0.025]">
      <div className={`mb-1.5 flex h-6 w-6 items-center justify-center rounded-xl ${metricTones[tone]}`}>
        <Icon className="h-3 w-3" />
      </div>
      <p className="text-base font-black text-slate-950 dark:text-white sm:text-lg">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 hidden text-[9px] text-slate-400 sm:block dark:text-slate-500">{detail}</p>
    </div>
  );
}
