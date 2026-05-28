"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* ---------------- types ---------------- */

type DayData = {
  date: string;
  count: number;
};

type HeatmapProps = {
  data: DayData[];
  year?: number;
  loading?: boolean;
};

export type HeatmapCell = {
  date: Date;
  key: string;
  value: number;
  level: number;
  label: string;
  disabled: boolean;
};

/* ---------------- constants ---------------- */

const DEFAULT_LEVELS = [
  "bg-[#ebedf0] dark:bg-[#161b22]",
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
];

/* ---------------- utilities ---------------- */

function parseLocalDate(value: string | Date) {
  if (value instanceof Date) return startOfDay(value);

  const [year, month, day] = value.split("-").map(Number);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return startOfDay(new Date());
  }

  return new Date(year, month - 1, day);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function toKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(d: Date, weekStartsOn: 0 | 1) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}

/** GitHub-like buckets: 0, 1-2, 3-5, 6-10, 11+ */
function getLevel(value: number) {
  if (value <= 0) return 0;
  if (value <= 2) return 1;
  if (value <= 5) return 2;
  if (value <= 10) return 3;
  return 4;
}

function clampLevel(level: number, levelCount: number) {
  return Math.max(0, Math.min(levelCount - 1, level));
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatMonth(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short" });
}

function formatTooltipLabel(d: Date) {
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ---------------- component ---------------- */

export default function CalendarHeatmap({
  data,
  year,
  loading,
}: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const yearNum = year ?? new Date().getFullYear();
  const weekStartsOn = 0 as 0 | 1;
  const levelCount = DEFAULT_LEVELS.length;
  const minWeekSpacing = 3;
  const cellGap = 3;

  const yearStart = useMemo(() => new Date(yearNum, 0, 1), [yearNum]);
  const yearEnd = useMemo(() => new Date(yearNum, 11, 31), [yearNum]);

  const firstWeek = useMemo(() => startOfWeek(yearStart, weekStartsOn), [yearStart, weekStartsOn]);
  const lastWeek = useMemo(() => startOfWeek(yearEnd, weekStartsOn), [yearEnd, weekStartsOn]);

  const valueMap = useMemo(() => {
    const map = new Map<string, number>();

    for (const item of data) {
      const normalized = parseLocalDate(item.date);
      const key = toKey(normalized);
      const prev = map.get(key) ?? 0;
      map.set(key, prev + (item.count ?? 0));
    }

    return map;
  }, [data]);

  const weeks = useMemo(() => {
    const totalDays = Math.ceil((lastWeek.getTime() - firstWeek.getTime()) / 86400000) + 7;
    return Math.ceil(totalDays / 7);
  }, [firstWeek, lastWeek]);

  const columns = useMemo(() => {
    const allCells: HeatmapCell[] = [];

    for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = addDays(firstWeek, weekIndex * 7 + dayIndex);
        const inRange = date >= yearStart && date <= yearEnd;
        const key = toKey(date);
        const value = inRange ? valueMap.get(key) ?? 0 : 0;
        const level = inRange ? getLevel(value) : 0;

        allCells.push({
          date,
          key,
          value,
          level: clampLevel(level, levelCount),
          disabled: !inRange,
          label: formatTooltipLabel(date),
        });
      }
    }

    const cols: HeatmapCell[][] = [];
    for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
      cols.push(allCells.slice(weekIndex * 7, weekIndex * 7 + 7));
    }

    return cols;
  }, [firstWeek, yearStart, yearEnd, weeks, valueMap, levelCount]);

  const cellSize = useMemo(() => {
    if (containerWidth === 0 || columns.length === 0) return 11;

    const totalGaps = (columns.length + 1) * cellGap;
    const availableWidth = containerWidth - totalGaps;
    return Math.max(9, Math.min(12, Math.floor(availableWidth / columns.length)));
  }, [containerWidth, columns.length]);

  const monthLabels = useMemo(() => {
    const labels: { colIndex: number; text: string }[] = [];
    let lastLabeledWeek = -999;

    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];
      const firstActiveCell = column.find((cell) => !cell.disabled);
      const firstVisibleDate = firstActiveCell?.date ?? column[0].date;
      const previousColumn = index > 0 ? columns[index - 1] : null;
      const previousFirstActive = previousColumn?.find((cell) => !cell.disabled)?.date ?? previousColumn?.[0]?.date;

      const monthChanged = !previousFirstActive || !sameMonth(firstVisibleDate, previousFirstActive);

      if (monthChanged && index - lastLabeledWeek >= minWeekSpacing) {
        labels.push({
          colIndex: index,
          text: formatMonth(firstVisibleDate),
        });
        lastLabeledWeek = index;
      }
    }

    return labels;
  }, [columns]);

  if (loading) {
    return (
      <div ref={containerRef} className="w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mb-3 h-3 w-24 rounded-full bg-slate-200/70 animate-pulse dark:bg-slate-800" />
        <div className="flex gap-1">
          {Array.from({ length: 53 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="rounded-[3px] bg-slate-200 animate-pulse dark:bg-slate-800"
                  style={{ width: cellSize, height: cellSize }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tooltipNode = (cell: HeatmapCell) => (
    <div className="text-xs">
      <div className="font-semibold">
        {cell.value > 0 ? `${cell.value.toLocaleString("vi-VN")} đóng góp` : "Không có đóng góp"}
      </div>
      <div className="text-[10px] text-slate-200/80">{cell.label}</div>
    </div>
  );

  return (
    <TooltipProvider delay={80}>
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/80"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Hoạt động {yearNum}
            </p>
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              Lưới đóng góp theo ngày học, giống biểu đồ GitHub.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {data.reduce((sum, item) => sum + item.count, 0)} đóng góp
          </div>
        </div>

        <div className="mb-3 flex items-end" style={{ paddingLeft: 0, height: 18 }}>
          <div className="relative" style={{ width: columns.length * (cellSize + cellGap) - cellGap }}>
            {monthLabels.map((month) => (
              <div
                key={`${month.text}-${month.colIndex}`}
                className="absolute text-[10px] font-medium text-slate-500 dark:text-slate-400"
                style={{ left: month.colIndex * (cellSize + cellGap), top: 0 }}
              >
                {month.text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex" style={{ gap: `${cellGap}px` }} role="grid" aria-label="Biểu đồ nhiệt hoạt động">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col" style={{ gap: `${cellGap}px` }} role="rowgroup">
              {column.map((cell) => {
                const cellClass = cell.disabled ? "bg-transparent" : DEFAULT_LEVELS[clampLevel(cell.level, levelCount)];

                return (
                  <Tooltip key={cell.key}>
                    <TooltipTrigger asChild>
                      <div
                        aria-label={cell.disabled ? `Không có dữ liệu vào ${cell.label}` : `${cell.label}: ${cell.value} đóng góp`}
                        className={cn(
                          "rounded-[3px] border border-black/5 transition-transform duration-150 hover:-translate-y-px dark:border-white/10",
                          cellClass,
                        )}
                        style={{
                          width: cellSize,
                          height: cellSize,
                        }}
                        role="gridcell"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} align="center" className="z-50 px-2.5 py-1.5 text-xs font-medium shadow-lg">
                      {tooltipNode(cell)}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
          <span>Ít hơn</span>
          <div className="flex items-center gap-1">
            {DEFAULT_LEVELS.map((backgroundClass, index) => (
              <div
                key={index}
                aria-hidden="true"
                className={cn("rounded-[3px] border border-black/5 dark:border-white/10", backgroundClass)}
                style={{
                  width: Math.max(8, cellSize * 0.7),
                  height: Math.max(8, cellSize * 0.7),
                }}
              />
            ))}
          </div>
          <span>Nhiều hơn</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
