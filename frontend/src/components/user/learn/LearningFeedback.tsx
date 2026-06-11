import { CalendarClock, Sparkles } from "lucide-react";
import type { ReviewFeedback } from "@/src/modules/user/types";

type LearningFeedbackProps = {
  feedback: ReviewFeedback;
};

export default function LearningFeedback({ feedback }: LearningFeedbackProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-2 gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-amber-500 dark:bg-white/10">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700/70 dark:text-emerald-300/70">XP nhận được</p>
          <p className="text-sm font-black text-emerald-800 dark:text-emerald-100">+{feedback.xpGained} XP</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600 dark:bg-white/10 dark:text-emerald-300">
          <CalendarClock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700/70 dark:text-emerald-300/70">Lần ôn tiếp theo</p>
          <p className="text-sm font-black text-emerald-800 dark:text-emerald-100">{formatNextReview(feedback.nextReviewDate)}</p>
        </div>
      </div>
    </div>
  );
}

function formatNextReview(nextReviewDate?: string) {
  if (!nextReviewDate) return "Đang cập nhật";

  const reviewTime = new Date(nextReviewDate).getTime();
  const diffMinutes = Math.max(1, Math.round((reviewTime - Date.now()) / 60000));

  if (diffMinutes < 60) return `Sau ${diffMinutes} phút`;
  if (diffMinutes < 1440) return `Sau ${Math.round(diffMinutes / 60)} giờ`;
  return `Sau ${Math.round(diffMinutes / 1440)} ngày`;
}
