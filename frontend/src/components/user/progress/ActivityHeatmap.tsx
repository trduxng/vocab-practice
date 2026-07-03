"use client";

import { CalendarDays } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import type { ProgressActivityDay } from "@/src/modules/user/types";

type ActivityHeatmapProps = {
  days: ProgressActivityDay[];
};

const weekdayLabels = ["CN", "", "T3", "", "T5", "", "T7"];
const MONTH_LABELS = [
  "T1", "T2", "T3", "T4", "T5", "T6",
  "T7", "T8", "T9", "T10", "T11", "T12",
];

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
  const maxActivity = Math.max(...days.map((day) => day.count), 1);
  const totalActivity = days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = days.filter((day) => day.count > 0).length;

  return (
    <TooltipProvider delay={80}>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              Lịch hoạt động
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Hoạt động trong 365 ngày qua
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Mỗi ô đại diện cho một ngày có hoạt động học tập.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CalendarDays className="h-4 w-4" />
            {activeDays} ngày hoạt động
          </div>
        </div>

        {totalActivity === 0 ? (
          <div className="mt-6 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <CalendarDays className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có hoạt động học tập</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Hoàn thành một bài học để bắt đầu xây dựng chuỗi hoạt động.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto pb-2">
            <div className="min-w-[760px]">
              <div className="ml-9 grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
                {(() => {
                  let lastMonth = -1;
                  return weeks.map((week, index) => {
                    const labelDay = week.find((day) => day && parseDate(day.date).getUTCDate() <= 7);
                    let label = "";
                    if (labelDay) {
                      const month = parseDate(labelDay.date).getUTCMonth();
                      if (month !== lastMonth) {
                        label = MONTH_LABELS[month];
                        lastMonth = month;
                      }
                    }
                    return (
                      <span key={index} className="h-4 text-[10px] font-bold text-slate-400">
                        {label}
                      </span>
                    );
                  });
                })()}
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
                      {week.map((day, dayIndex) =>
                        day ? (
                          <Tooltip key={day.date}>
                            <TooltipTrigger
                              render={
                                <div
                                  className={`aspect-square rounded-[3px] transition-all duration-150 hover:scale-110 hover:ring-2 hover:ring-slate-400/50 dark:hover:ring-slate-300/50 ${cellTones[getIntensity(day.count, maxActivity)]}`}
                                />
                              }
                            />
                            <TooltipContent
                              side="top"
                              sideOffset={4}
                              align="center"
                              className="z-50 rounded-[8px] border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            >
                              <div className="text-xs">
                                <div className="font-semibold">
                                  {day.count > 0 ? `${day.count.toLocaleString("vi-VN")} hoạt động` : "Không có hoạt động"}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {parseDate(day.date).toLocaleDateString("vi-VN", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{day.xpEarned} XP</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div key={`${weekIndex}-${dayIndex}`} className="aspect-square rounded-[3px] bg-transparent" />
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
          <span>{totalActivity.toLocaleString("vi-VN")} hoạt động trong năm qua</span>
          <div className="flex items-center gap-1.5">
            <span>Ít</span>
            {cellTones.map((tone, index) => <span key={tone} className={`h-3 w-3 rounded-[3px] ${tone}`} title={`Cấp độ ${index}`} />)}
            <span>Nhiều</span>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
