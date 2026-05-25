"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { userService } from "@/src/services/user.service";

type DayData = {
  date: string;
  count: number;
};

type HeatmapProps = {
  data: DayData[];
  year?: number;
  loading?: boolean;
};

const MONTH_LABELS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getIntensity(count: number, maxCount: number): string {
  if (count === 0) return "bg-slate-100 dark:bg-white/[0.03]";
  const ratio = count / Math.max(maxCount, 1);
  if (ratio > 0.7) return "bg-green-600 dark:bg-green-500";
  if (ratio > 0.4) return "bg-green-500 dark:bg-green-400";
  if (ratio > 0.2) return "bg-green-400 dark:bg-green-300";
  return "bg-green-300 dark:bg-green-200";
}

export default function CalendarHeatmap({ data, year, loading }: HeatmapProps) {
  const [tooltipContent, setTooltipContent] = useState<{ date: string; count: number } | null>(null);

  const { weeks, maxCount } = useMemo(() => {
    const yearNum = year || new Date().getFullYear();
    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31);

    // Build a map of date -> count
    const countMap = new Map<string, number>();
    let max = 0;
    for (const d of data) {
      const count = d.count || 0;
      countMap.set(d.date, count);
      if (count > max) max = count;
    }

    // Generate all days of the year
    const allDays: { date: string; count: number; dayOfWeek: number }[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];
      const count = countMap.get(dateStr) || 0;
      allDays.push({ date: dateStr, count, dayOfWeek: current.getDay() });
      current.setDate(current.getDate() + 1);
    }

    // Group into weeks (columns)
    const weeks: { date: string; count: number }[][] = [];
    let currentWeek: { date: string; count: number }[] = [];

    // Pad the first week with empty cells so it starts on the right day
    const firstDay = allDays[0]?.dayOfWeek ?? 0;
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: "", count: -1 });
    }

    for (const day of allDays) {
      currentWeek.push({ date: day.date, count: day.count });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, maxCount: max };
  }, [data, year]);

  if (loading) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-[3px]">
          {Array.from({ length: 53 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-[10px] w-[10px] rounded-sm bg-slate-100 dark:bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px] min-w-fit">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => {
                if (day.count < 0) {
                  return <div key={`empty-${weekIndex}-${dayIndex}`} className="h-[10px] w-[10px]" />;
                }
                return (
                  <Tooltip key={day.date}>
                    <TooltipTrigger>
                      <div
                        className={`h-[10px] w-[10px] rounded-sm cursor-pointer transition-colors hover:ring-1 hover:ring-slate-400 dark:hover:ring-white/30 ${getIntensity(day.count, maxCount)}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px] px-2 py-1 font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-none rounded-md shadow-lg">
                      {day.count > 0 ? `${day.count} lượt` : "Không có hoạt động"} &mdash;{" "}
                      {new Date(day.date + "T00:00:00").toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Ít</span>
          <div className="flex gap-[3px] items-center">
            <div className="h-[10px] w-[10px] rounded-sm bg-slate-100 dark:bg-white/[0.03]" />
            <div className="h-[10px] w-[10px] rounded-sm bg-green-300 dark:bg-green-200" />
            <div className="h-[10px] w-[10px] rounded-sm bg-green-400 dark:bg-green-300" />
            <div className="h-[10px] w-[10px] rounded-sm bg-green-500 dark:bg-green-400" />
            <div className="h-[10px] w-[10px] rounded-sm bg-green-600 dark:bg-green-500" />
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Nhiều</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
