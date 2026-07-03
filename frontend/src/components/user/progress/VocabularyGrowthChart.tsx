"use client";

import { BookOpenCheck } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VocabularyGrowthPoint } from "@/src/modules/user/types";

type VocabularyGrowthChartProps = {
  points: VocabularyGrowthPoint[];
};

export default function VocabularyGrowthChart({ points }: VocabularyGrowthChartProps) {
  const isDark = useDarkMode();

  const tooltipStyle = {
    background: isDark ? "#1e293b" : "#fff",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
    borderRadius: 8,
    color: isDark ? "#f1f5f9" : "#0f172a",
    fontSize: 12,
  };
  const sortedPoints = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const series = sortedPoints.map((point) => ({
    ...point,
    label: new Date(`${point.date}T00:00:00Z`).toLocaleDateString("vi-VN", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }),
  }));
  const hasGrowth = series.some((point) => point.learnedWords > 0 || point.masteredWords > 0);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">Tăng trưởng từ vựng</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">Vốn từ vựng theo thời gian</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">So sánh từ đã học và từ đã nắm vững trong 12 tháng.</p>
      </div>

      {!hasGrowth ? (
        <div className="mt-6 flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <BookOpenCheck className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Chưa có dữ liệu tăng trưởng từ vựng</p>
        </div>
      ) : (
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#94a3b833" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Line type="monotone" dataKey="learnedWords" name="Đã học" stroke="#0ea5e9" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="masteredWords" name="Nắm vững" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
