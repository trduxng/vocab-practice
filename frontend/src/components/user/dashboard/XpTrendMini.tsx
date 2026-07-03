"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type XpTrendMiniProps = {
  data: { date: string; xpEarned?: number }[];
};

export default function XpTrendMini({ data }: XpTrendMiniProps) {
  const isDark = useDarkMode();

  const chartData = useMemo(() => {
    const xpByDate = new Map<string, number>();
    for (const entry of data) {
      const key = String(entry.date).slice(0, 10);
      xpByDate.set(key, (xpByDate.get(key) || 0) + (entry.xpEarned || 0));
    }

    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (13 - index));
      const key = date.toISOString().slice(0, 10);
      const xp = xpByDate.get(key) || 0;
      return {
        label: date.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" }),
        xp,
      };
    });
  }, [data]);

  const totalXp = chartData.reduce((sum, d) => sum + d.xp, 0);
  const avgXp = chartData.length > 0 ? Math.round(totalXp / chartData.length) : 0;
  const maxXp = Math.max(...chartData.map((d) => d.xp), 0);
  const hasData = totalXp > 0;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:px-4 sm:py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
            Xu hướng XP
          </p>
          <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-950 dark:text-white">
            XP 14 ngày qua
          </h2>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          <TrendingUp className="h-[18px] w-[18px]" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <MiniStat label="Tổng" value={`${totalXp}`} sub="XP" />
        <MiniStat label="Trung bình" value={`${avgXp}`} sub="XP/ngày" />
        <MiniStat label="Cao nhất" value={`${maxXp}`} sub="XP" />
      </div>

      {hasData ? (
        <div className="mt-2 h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="xpGradientMini" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={isDark ? 0.35 : 0.2} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 10,
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  color: isDark ? "#f1f5f9" : "#0f172a",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [`${value} XP`, "XP"]}
                labelStyle={{ fontWeight: 700, marginBottom: 2, color: isDark ? "#94a3b8" : "#64748b" }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#a78bfa"
                strokeWidth={2.5}
                fill="url(#xpGradientMini)"
                dot={false}
                activeDot={{ r: 4, fill: "#a78bfa", stroke: isDark ? "#1e293b" : "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-2 flex h-[80px] items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Chưa có dữ liệu XP 14 ngày qua</p>
        </div>
      )}
    </section>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-2 text-center dark:border-violet-500/10 dark:bg-violet-500/[0.06]">
      <p className="text-base font-black text-slate-950 dark:text-white">{value}</p>
      <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{sub}</p>
      <p className="text-[8px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
