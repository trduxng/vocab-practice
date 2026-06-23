"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProgressActivityDay } from "@/src/modules/user/types";

type TrendPeriod = "daily" | "weekly" | "monthly";

type XPTrendChartProps = {
  activity: ProgressActivityDay[];
};

const periods: Array<{ id: TrendPeriod; label: string }> = [
  { id: "daily", label: "Ngày" },
  { id: "weekly", label: "Tuần" },
  { id: "monthly", label: "Tháng" },
];

function shortDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

function buildSeries(activity: ProgressActivityDay[], period: TrendPeriod) {
  if (period === "daily") {
    return activity
      .slice(-30)
      .map((day) => ({ label: shortDate(day.date), xp: day.xpEarned }));
  }

  if (period === "weekly") {
    const recentDays = activity.slice(-84);
    return Array.from(
      { length: Math.ceil(recentDays.length / 7) },
      (_, index) => {
        const week = recentDays.slice(index * 7, index * 7 + 7);
        return {
          label: week[0] ? shortDate(week[0].date) : "",
          xp: week.reduce((sum, day) => sum + day.xpEarned, 0),
        };
      },
    );
  }

  const monthMap = new Map<string, number>();
  activity.forEach((day) => {
    const month = day.date.slice(0, 7);
    monthMap.set(month, (monthMap.get(month) || 0) + day.xpEarned);
  });

  return Array.from(monthMap.entries())
    .slice(-12)
    .map(([month, xp]) => ({
      label: new Date(`${month}-01T00:00:00Z`).toLocaleDateString("vi-VN", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      xp,
    }));
}

export default function XPTrendChart({ activity }: XPTrendChartProps) {
  const [period, setPeriod] = useState<TrendPeriod>("daily");
  const series = useMemo(
    () => buildSeries(activity, period),
    [activity, period],
  );
  const totalXP = series.reduce((sum, item) => sum + item.xp, 0);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            Xu hướng XP
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
            Nhịp tăng XP
          </h2>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/6">
          {periods.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors ${
                period === item.id
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {totalXP === 0 ? (
        <div className="mt-6 flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-white/10 dark:bg-white/2">
          <BarChart3 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
            Chưa có XP trong khoảng thời gian này
          </p>
        </div>
      ) : (
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="xpTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#94a3b833"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="xp"
                name="XP"
                stroke="#f59e0b"
                strokeWidth={3}
                fill="url(#xpTrendFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
