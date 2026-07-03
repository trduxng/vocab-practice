import {
  ArrowUpRight,
  BookOpen,
  Brain,
  ClipboardCheck,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

export type LearningAction = {
  title: string;
  description: string;
  count: number;
  unit: string;
  icon: LucideIcon;
  tone: "blue" | "violet" | "amber" | "rose";
  onClick: () => void;
};

type TodaysLearningProps = {
  actions: LearningAction[];
};

const tones = {
  blue: {
    icon: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    hover: "hover:border-sky-300 dark:hover:border-sky-500/40",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    hover: "hover:border-violet-300 dark:hover:border-violet-500/40",
  },
  amber: {
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    hover: "hover:border-amber-300 dark:hover:border-amber-500/40",
  },
  rose: {
    icon: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    hover: "hover:border-rose-300 dark:hover:border-rose-500/40",
  },
};

export const learningActionIcons = {
  newWords: BookOpen,
  review: Brain,
  practice: Dumbbell,
  tests: ClipboardCheck,
};

export default function TodaysLearning({ actions }: TodaysLearningProps) {
  const hasLearningAvailable = actions.some((action) => action.count > 0);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            Học tập hôm nay
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
            Chọn hoạt động tiếp theo
          </h2>
        </div>
        {!hasLearningAvailable && (
          <span className="hidden text-xs font-medium text-emerald-600 sm:block dark:text-emerald-400">
            Đã hoàn thành kế hoạch
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <LearningActionCard key={action.title} action={action} />
        ))}
      </div>
    </section>
  );
}

function LearningActionCard({ action }: { action: LearningAction }) {
  const tone = tones[action.tone];
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={`group flex min-h-[120px] flex-col rounded-3xl border border-slate-200 bg-white p-2.5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] ${tone.hover}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone.icon}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300" />
      </div>
      <p className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">
        {action.count}
        <span className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">{action.unit}</span>
      </p>
      <h3 className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">{action.title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{action.description}</p>
    </button>
  );
}
