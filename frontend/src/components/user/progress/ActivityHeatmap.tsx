import { CalendarDays } from "lucide-react";
import type { ProgressActivityDay } from "@/src/modules/user/types";

type ActivityHeatmapProps = {
  days: ProgressActivityDay[];
};

const weekdayLabels = ["Sun", "", "Tue", "", "Thu", "", "Sat"];

function parseDate(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

function getIntensity(value: number, maxValue: number) {
  if (value <= 0) return 0;
  const ratio = value / Math.max(maxValue, 1);
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const cellTones = [
  "bg-slate-100 dark:bg-white/[0.06]",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-400 dark:bg-emerald-700",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-700 dark:bg-emerald-300",
];

export default function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const firstDay = days[0] ? parseDate(days[0].date).getUTCDay() : 0;
  const paddedDays: Array<ProgressActivityDay | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...days,
  ];

  while (paddedDays.length % 7 !== 0) paddedDays.push(null);

  const weeks = Array.from({ length: paddedDays.length / 7 }, (_, index) =>
    paddedDays.slice(index * 7, index * 7 + 7),
  );
  const maxActivity = Math.max(...days.map((day) => day.activityCount), 1);
  const totalActivity = days.reduce((sum, day) => sum + day.activityCount, 0);
  const activeDays = days.filter((day) => day.activityCount > 0).length;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Learning heatmap
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
            Hoat dong trong 365 ngay qua
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Moi o dai dien cho mot ngay co hoat dong hoc tap.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CalendarDays className="h-4 w-4" />
          {activeDays} ngay hoat dong
        </div>
      </div>

      {totalActivity === 0 ? (
        <div className="mt-6 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <CalendarDays className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Chua co hoat dong hoc tap</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Hoan thanh mot bai hoc de bat dau xay dung chuoi hoat dong.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            <div className="ml-9 grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
              {weeks.map((week, index) => {
                const labelDay = week.find((day) => day && parseDate(day.date).getUTCDate() <= 7);
                return (
                  <span key={index} className="h-4 text-[10px] font-bold text-slate-400">
                    {labelDay
                      ? parseDate(labelDay.date).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
                      : ""}
                  </span>
                );
              })}
            </div>

            <div className="mt-1 flex gap-2">
              <div className="grid w-7 shrink-0 grid-rows-7 gap-1">
                {weekdayLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="flex items-center text-[9px] font-bold text-slate-400">
                    {label}
                  </span>
                ))}
              </div>
              <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-1">
                    {week.map((day, dayIndex) => (
                      day ? (
                        <div
                          key={day.date}
                          className={`aspect-square rounded-[3px] ${cellTones[getIntensity(day.activityCount, maxActivity)]}`}
                          title={`${day.date}: ${day.activityCount} hoat dong, ${day.xpEarned} XP`}
                        />
                      ) : (
                        <div key={`${weekIndex}-${dayIndex}`} className="aspect-square rounded-[3px] bg-transparent" />
                      )
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
        <span>{totalActivity.toLocaleString("vi-VN")} hoat dong trong nam qua</span>
        <div className="flex items-center gap-1.5">
          <span>It</span>
          {cellTones.map((tone, index) => <span key={tone} className={`h-3 w-3 rounded-[3px] ${tone}`} title={`Cap do ${index}`} />)}
          <span>Nhieu</span>
        </div>
      </div>
    </section>
  );
}
