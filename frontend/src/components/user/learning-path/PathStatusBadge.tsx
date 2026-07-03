import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import type { LearningPathStatus } from "@/src/modules/user/types";

type PathStatusBadgeProps = {
  status: LearningPathStatus;
};

const statusStyles = {
  completed: {
    label: "Hoàn thành",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  available: {
    label: "Có sẵn",
    icon: PlayCircle,
    className: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
  },
  locked: {
    label: "Đã khóa",
    icon: Lock,
    className: "border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400",
  },
};

export default function PathStatusBadge({ status }: PathStatusBadgeProps) {
  const style = statusStyles[status];
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${style.className}`}>
      <Icon className="h-3 w-3" />
      {style.label}
    </span>
  );
}
