import { RotateCcw, Smile, Sparkles, TrendingUp } from "lucide-react";
import type { ReviewRating } from "@/src/modules/user/types";

type ReviewGradeButtonsProps = {
  disabled: boolean;
  revealed: boolean;
  onSelect: (rating: ReviewRating) => void;
};

const grades = [
  {
    rating: "Again" as const,
    label: "Lại",
    shortcut: "1",
    interval: "10 phút",
    icon: RotateCcw,
    className: "border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-400 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20",
  },
  {
    rating: "Hard" as const,
    label: "Khó",
    shortcut: "2",
    interval: "1 ngày",
    icon: TrendingUp,
    className: "border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-400 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20",
  },
  {
    rating: "Good" as const,
    label: "Tốt",
    shortcut: "3",
    interval: "3 ngày",
    icon: Smile,
    className: "border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20",
  },
  {
    rating: "Easy" as const,
    label: "Dễ",
    shortcut: "4",
    interval: "7+ ngày",
    icon: Sparkles,
    className: "border-sky-200 bg-sky-50 text-sky-600 hover:border-sky-400 hover:bg-sky-100 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20",
  },
];

export default function ReviewGradeButtons({ disabled, revealed, onSelect }: ReviewGradeButtonsProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          {revealed ? "Bạn nhớ từ này thế nào?" : "Lật thẻ để chọn mức độ ghi nhớ"}
        </p>
        <p className="hidden text-[10px] font-bold text-slate-400 sm:block">Phím 1 - 4</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {grades.map((grade) => {
          const Icon = grade.icon;

          return (
            <button
              key={grade.rating}
              type="button"
              disabled={disabled || !revealed}
              onClick={() => onSelect(grade.rating)}
              className={`group min-h-20 rounded-2xl border p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-35 ${grade.className}`}
            >
              <div className="flex items-start justify-between gap-2">
                <Icon className="h-4 w-4" />
                <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-black dark:bg-white/10">{grade.shortcut}</span>
              </div>
              <p className="mt-3 text-sm font-black">{grade.label}</p>
              <p className="mt-0.5 text-[10px] font-bold opacity-75">{grade.interval}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
