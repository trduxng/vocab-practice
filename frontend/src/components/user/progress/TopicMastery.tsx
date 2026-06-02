import { AlertTriangle, Award, Layers3 } from "lucide-react";
import type { TopicMasteryProgress } from "@/src/modules/user/types";

type TopicMasteryProps = {
  topics: TopicMasteryProgress[];
};

export default function TopicMastery({ topics }: TopicMasteryProps) {
  const strongest = [...topics].sort((a, b) => b.completionPercentage - a.completionPercentage).slice(0, 3);
  const weakest = [...topics].sort((a, b) => a.completionPercentage - b.completionPercentage).slice(0, 3);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Topic mastery</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">Muc do nam vung theo chu de</h2>
      </div>

      {topics.length === 0 ? (
        <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <Layers3 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Chua co du lieu chu de</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <TopicGroup title="Chu de manh" icon={Award} tone="emerald" topics={strongest} />
          <TopicGroup title="Can uu tien" icon={AlertTriangle} tone="rose" topics={weakest} />
        </div>
      )}
    </section>
  );
}

type TopicGroupProps = {
  title: string;
  icon: React.ElementType;
  tone: "emerald" | "rose";
  topics: TopicMasteryProgress[];
};

const toneStyles = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    bar: "bg-rose-500",
  },
};

function TopicGroup({ title, icon: Icon, tone, topics }: TopicGroupProps) {
  const styles = toneStyles[tone];

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.025]">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="mt-4 space-y-4">
        {topics.map((topic) => (
          <div key={topic.topicId}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{topic.topicName}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{topic.masteredWords}/{topic.totalWords} tu nam vung</p>
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">{topic.completionPercentage}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${topic.completionPercentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
