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
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
            Hoạt động tuần này
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
            Nhịp học trong 7 ngày qua
          </h2>
        </div>
        <div className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          {totalActivity} lượt học
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <WeeklyMetric icon={BarChart3} label="Hoạt động" value={totalActivity} detail="lượt trả lời" tone="sky" />
        <WeeklyMetric icon={Sparkles} label="XP nhận được" value={xpEarned} detail="trong 7 ngày" tone="amber" />
        <WeeklyMetric icon={BookCheck} label="Bài học hoàn tất" value={completedLessons} detail="ngày đạt mục tiêu" tone="emerald" />
      </div>

      <div className="mt-7">
        {totalActivity === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <CalendarCheck2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có hoạt động trong tuần này</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Hoàn thành một hoạt động để bắt đầu biểu đồ tiến độ.
            </p>
          </div>
        ) : (
          <div className="flex h-52 items-end gap-2 sm:gap-4">
            {days.map((day) => {
              const height = day.count > 0 ? Math.max(12, (day.count / maxActivity) * 100) : 3;
              const reachedGoal = day.count >= dailyGoal;

              return (
                <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{day.count || ""}</span>
                  <div className="flex h-36 w-full max-w-10 items-end rounded-full bg-slate-100 p-1 dark:bg-white/[0.05]">
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
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{day.label}</span>
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
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-white/[0.025] sm:p-4">
      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl ${metricTones[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 hidden text-[11px] text-slate-400 sm:block dark:text-slate-500">{detail}</p>
    </div>
  );
}
