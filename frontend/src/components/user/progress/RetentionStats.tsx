import { Brain, CheckCircle2, RefreshCw } from "lucide-react";
import type { RetentionStatistics } from "@/src/modules/user/types";

type RetentionStatsProps = {
  stats: RetentionStatistics;
};

export default function RetentionStats({ stats }: RetentionStatsProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div>          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">Ghi nhớ</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">Khả năng ghi nhớ</h2>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <RetentionMetric
          icon={CheckCircle2}
          label="Đúng"
          value={stats.correctAnswerRate}
          detail={`${stats.correctAnswers}/${stats.totalAnswers} câu`}
          tone="emerald"
        />
        <RetentionMetric
          icon={Brain}
          label="Đã quên"
          value={stats.forgottenWordRate}
          detail={`${stats.forgottenWords}/${stats.learnedWords} từ`}
          tone="rose"
        />
        <RetentionMetric
          icon={RefreshCw}
          label="Ôn đúng hạn"
          value={stats.reviewCompletionRate}
          detail={`${stats.upToDateWords}/${stats.learnedWords} từ đúng hạn`}
          tone="sky"
        />
      </div>
    </section>
  );
}

type RetentionMetricProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  detail: string;
  tone: "emerald" | "rose" | "sky";
};

const metricTones = {
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
};

function RetentionMetric({ icon: Icon, label, value, detail, tone }: RetentionMetricProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.025]">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${metricTones[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-3xl font-black text-slate-950 dark:text-white">{Math.round(value)}%</p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-[11px] leading-5 text-slate-400">{detail}</p>
    </div>
  );
}
