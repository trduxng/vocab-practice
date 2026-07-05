"use client";

import { BookOpenCheck, BookMarked, Sparkles } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VocabularyGrowthPoint } from "@/src/modules/user/types";

/* ─── Custom Tooltip ─── */

function VocabTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="overflow-hidden rounded-xl border-0 bg-slate-900 px-3 py-2.5 shadow-2xl dark:bg-slate-800">
      <p className="text-[10px] font-medium text-white/60">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry, i) => {
          const Icon = entry.name === "Đã học" ? BookMarked : Sparkles;
          return (
            <div key={i} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" style={{ color: entry.color }} />
              <span className="text-xs font-semibold text-white">
                {entry.name}: {entry.value.toLocaleString("vi-VN")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type VocabularyGrowthChartProps = {
  points: VocabularyGrowthPoint[];
};

export default function VocabularyGrowthChart({ points }: VocabularyGrowthChartProps) {
  const series = points.map((point) => ({
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
              <Tooltip content={<VocabTooltip />} />
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
