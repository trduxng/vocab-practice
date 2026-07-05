// ── ActivityHeatmap.tsx ──
// GitHub-style contribution heatmap with polished, modern UI.
// 52-week × 7-day grid with brand colors, responsive cells, and Popover touch support.

"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Flame,
  Zap,
  TrendingUp,
  MousePointer,
} from "lucide-react";
import { Popover } from "@base-ui/react/popover";

/* ─── Types ─── */

interface ActivityHeatmapProps {
  days: Array<{
    date: string;
    activityCount: number;
    xpEarned: number;
  }>;
  loading?: boolean;
}

interface CellData {
  date: Date;
  key: string;
  count: number;
  xp: number;
}

/* ─── Constants ─── */

const LABEL_W = 32;

const WEEKDAY_LABELS = ["", "T2", "", "T4", "", "T6", ""];

const MONTH_NAMES = [
  "Thg 1",
  "Thg 2",
  "Thg 3",
  "Thg 4",
  "Thg 5",
  "Thg 6",
  "Thg 7",
  "Thg 8",
  "Thg 9",
  "Thg 10",
  "Thg 11",
  "Thg 12",
];

const LEVEL_COLORS = [
  "bg-white/60 border border-slate-200 dark:bg-white/[0.03] dark:border-white/[0.06]",
  "bg-brand-100 border border-brand-200 dark:bg-brand-900/40 dark:border-brand-800/40",
  "bg-brand-300 border border-brand-400 dark:bg-brand-700 dark:border-brand-600",
  "bg-brand-500 border border-brand-600 text-white dark:bg-brand-500 dark:border-brand-400",
  "bg-brand-700 border border-brand-800 text-white dark:bg-brand-400 dark:border-brand-300",
];

/* ─── Helpers ─── */

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLevel(val: number, max: number): number {
  if (val <= 0 || max <= 0) return 0;
  const r = val / max;
  if (r <= 0.25) return 1;
  if (r <= 0.5) return 2;
  if (r <= 0.75) return 3;
  return 4;
}

function fmt(d: Date): string {
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─── Build data ─── */

interface BuildDataResult {
  weeks: CellData[][];
  maxActivity: number;
  totalActivity: number;
  activeDays: number;
  monthLabels: Array<{ col: number; text: string }>;
  currentStreak: number;
  totalXP: number;
  maxXP: number;
}

function buildData(days: ActivityHeatmapProps["days"]): BuildDataResult {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() - start.getDay());

  const map = new Map<string, { activityCount: number; xpEarned: number }>();
  for (const d of days) {
    map.set(d.date.slice(0, 10), {
      activityCount: d.activityCount,
      xpEarned: d.xpEarned,
    });
  }

  const allCells: CellData[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const k = toKey(cursor);
    const entry = map.get(k);
    allCells.push({
      date: new Date(cursor),
      key: k,
      count: entry?.activityCount ?? 0,
      xp: entry?.xpEarned ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: CellData[][] = [];
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }

  const maxVal = Math.max(...allCells.map((c) => c.count), 1);

  let currentStreak = 0;
  for (let i = allCells.length - 1; i >= 0; i--) {
    if (allCells[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const monthLabels: Array<{ col: number; text: string }> = [];
  let prev = -1;
  for (let c = 0; c < weeks.length; c++) {
    const cell = weeks[c][0];
    if (!cell) continue;
    const m = cell.date.getMonth();
    if (m !== prev) {
      monthLabels.push({ col: c, text: MONTH_NAMES[m] });
      prev = m;
    }
  }

  const totals = allCells.reduce(
    (s, c) => ({ count: s.count + c.count, xp: s.xp + c.xp }),
    { count: 0, xp: 0 },
  );

  return {
    weeks,
    maxActivity: maxVal,
    totalActivity: totals.count,
    activeDays: allCells.filter((c) => c.count > 0).length,
    monthLabels,
    currentStreak,
    totalXP: totals.xp,
    maxXP: Math.max(...allCells.map((c) => c.xp), 1),
  };
}

/* ─── Skeleton ─── */

function Skeleton() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="mb-6">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mt-2 h-5 w-52 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="flex gap-1">
        <div className="flex w-[26px] shrink-0 flex-col gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[18px] w-full animate-pulse rounded bg-slate-200 dark:bg-white/10"
            />
          ))}
        </div>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div
                key={j}
                className="h-[18px] w-[18px] animate-pulse rounded-[4px] bg-slate-200 dark:bg-white/10"
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Stats Bar ─── */

interface Stats {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  bg: string;
}

function StatsBar({
  totalActivity,
  activeDays,
  currentStreak,
  totalXP,
}: {
  totalActivity: number;
  activeDays: number;
  currentStreak: number;
  totalXP: number;
}) {
  const stats: Stats[] = [
    {
      icon: MousePointer,
      value: totalActivity.toLocaleString("vi-VN"),
      label: "Tổng hoạt động",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-500/10",
    },
    {
      icon: Flame,
      value: `${currentStreak} ngày`,
      label: "Chuỗi hiện tại",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-500/10",
    },
    {
      icon: TrendingUp,
      value: activeDays.toString(),
      label: "Ngày hoạt động",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      icon: Zap,
      value: `${totalXP.toLocaleString("vi-VN")} XP`,
      label: "XP kiếm được",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5",
            stat.bg,
          )}
        >
          <stat.icon className={cn("h-4 w-4 shrink-0", stat.color)} />
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-black leading-tight tracking-tight",
                stat.color,
              )}
            >
              {stat.value}
            </p>
            <p className="truncate text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */

export default function ActivityHeatmap({
  days,
  loading,
}: ActivityHeatmapProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const GAP = 3;

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (loading) return <Skeleton />;

  const {
    weeks,
    maxActivity,
    totalActivity,
    activeDays,
    monthLabels,
    currentStreak,
    totalXP,
  } = useMemo(() => buildData(days), [days]);

  const numCols = weeks.length;

  // Calculate cell size to fill available width, clamped to [12, 20]
  const availW = containerWidth - LABEL_W - (numCols - 1) * GAP;
  const CELL =
    containerWidth > 0
      ? Math.min(20, Math.max(12, Math.floor(availW / numCols)))
      : 14; // default before measurement
  const COL_W = CELL + GAP;

  if (totalActivity === 0) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
              Biểu đồ nhiệt
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Hoạt động trong 365 ngày qua
            </h2>
          </div>
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <CalendarDays className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              Chưa có hoạt động học tập
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Hoàn thành một bài học để bắt đầu xây dựng chuỗi hoạt động.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      {/* ── Header ── */}
      <div className="border-b border-slate-100 p-5 dark:border-white/[0.06] sm:p-6">
        <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
              Biểu đồ nhiệt
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Hoạt động trong 365 ngày qua
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <CalendarDays className="h-4 w-4" />
            {activeDays} ngày hoạt động
          </div>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-slate-400 dark:text-slate-500">
          Mỗi ô đại diện cho một ngày. Màu càng đậm, bạn càng học nhiều.
        </p>
      </div>

      {/* ── Stats Bar ── */}
      <div className="border-b border-slate-100 px-5 py-4 dark:border-white/[0.06] sm:px-6">
        <StatsBar
          totalActivity={totalActivity}
          activeDays={activeDays}
          currentStreak={currentStreak}
          totalXP={totalXP}
        />
      </div>

      {/* ── Heatmap Grid ── */}
      <div ref={gridRef} className="overflow-hidden pt-5">
        <div
          className="flex overflow-x-auto pb-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#e2e8f0 transparent",
          }}
        >
          <div className="inline-block">
            {/* Month labels — absolute above grid */}
            <div className="relative h-5" style={{ marginLeft: LABEL_W + GAP }}>
              {monthLabels.map((m, i) => (
                <span
                  key={i}
                  className="pointer-events-none absolute select-none whitespace-nowrap text-[10px] font-bold tracking-wide text-slate-400 dark:text-slate-500"
                  style={{ left: m.col * COL_W, top: 2 }}
                >
                  {m.text}
                </span>
              ))}
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: `${LABEL_W}px repeat(${numCols}, ${CELL}px)`,
                gridTemplateRows: `repeat(7, ${CELL}px)`,
                gap: `${GAP}px`,
              }}
            >
              {/* Weekday column */}
              {WEEKDAY_LABELS.map((label, i) => (
                <span
                  key={`wd-${i}`}
                  className="flex items-center justify-end pr-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none"
                  style={{
                    gridColumn: 1,
                    gridRow: i + 1,
                    height: CELL,
                  }}
                >
                  {label}
                </span>
              ))}

              {/* Cells */}
              {weeks.map((col, ci) =>
                col.map((cell, ri) => {
                  const level = getLevel(cell.count, maxActivity);
                  const now = new Date();
                  const isToday =
                    cell.date.getDate() === now.getDate() &&
                    cell.date.getMonth() === now.getMonth() &&
                    cell.date.getFullYear() === now.getFullYear();

                  return (
                    <Popover.Root key={cell.key}>
                      <Popover.Trigger
                        nativeButton={false}
                        openOnHover
                        delay={80}
                        render={
                          <div
                            className={cn(
                              "rounded-[5px] transition-all duration-150",
                              level > 0 &&
                                "hover:scale-[1.35] hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-brand-500/20",
                              level === 0 && "hover:scale-[1.1]",
                              LEVEL_COLORS[level],
                              isToday &&
                                "ring-2 ring-brand-400/70 ring-offset-1 ring-offset-white dark:ring-offset-[#0f172a]",
                            )}
                            style={{
                              gridColumn: ci + 2,
                              gridRow: ri + 1,
                              width: CELL,
                              height: CELL,
                              cursor: "pointer",
                            }}
                            aria-label={
                              cell.count > 0
                                ? `${fmt(cell.date)}: ${cell.count} hoạt động, ${cell.xp} XP`
                                : `${fmt(cell.date)}: Không có hoạt động`
                            }
                          />
                        }
                      />
                      <Popover.Portal>
                        <Popover.Positioner
                          side="top"
                          sideOffset={8}
                          align="center"
                        >
                          <Popover.Popup className="z-50 overflow-hidden rounded-xl border-0 bg-slate-900 px-0 py-0 shadow-2xl dark:bg-slate-800">
                            <div className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-block h-3 w-3 rounded-[3px]",
                                    LEVEL_COLORS[level],
                                  )}
                                />
                                <span className="text-xs font-semibold text-white">
                                  {cell.count > 0
                                    ? `${cell.count.toLocaleString("vi-VN")} hoạt động`
                                    : "Không có hoạt động"}
                                </span>
                              </div>
                              <div className="mt-1 text-[10px] font-medium text-white/60">
                                {fmt(cell.date)}
                              </div>
                              {cell.xp > 0 && (
                                <div className="mt-1.5 flex items-center gap-1 rounded-md bg-brand-500/15 px-2 py-1">
                                  <Zap className="h-3 w-3 text-brand-400" />
                                  <span className="text-[10px] font-bold text-brand-300">
                                    +{cell.xp} XP
                                  </span>
                                </div>
                              )}
                            </div>
                          </Popover.Popup>
                        </Popover.Positioner>
                      </Popover.Portal>
                    </Popover.Root>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 pt-3.5 dark:border-white/[0.06] sm:px-6">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {totalActivity.toLocaleString("vi-VN")} hoạt động · {activeDays}{" "}
            ngày
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              Ít
            </span>
            {LEVEL_COLORS.map((cls, i) => (
              <span
                key={i}
                className={cn("inline-block rounded-[3px] border", cls)}
                style={{ width: 12, height: 12 }}
              />
            ))}
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              Nhiều
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
