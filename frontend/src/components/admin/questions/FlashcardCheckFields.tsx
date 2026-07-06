"use client";

import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";

type FlashcardCheckFieldsProps = {
  correctAnswer: string;
  questionText: string;
  onCorrectAnswerChange: (answer: string) => void;
  onQuestionTextChange: (text: string) => void;
  defaultTerm: string;
};

export function FlashcardCheckFields({
  correctAnswer,
  questionText,
  onCorrectAnswerChange,
  onQuestionTextChange,
  defaultTerm,
}: FlashcardCheckFieldsProps) {
  const term = correctAnswer || defaultTerm;
  const meaning = questionText || "";

  function handleTermChange(value: string) {
    onCorrectAnswerChange(value);
  }

  function handleMeaningChange(value: string) {
    onQuestionTextChange(value);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        FlashcardCheck hiển thị term cho learner và họ tự kiểm tra xem có nhớ nghĩa không.
        Không có nhập liệu — chỉ self-assessment.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Mặt trước — Term
          </label>
          <div className="mt-2 overflow-hidden rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white dark:border-white/10 dark:from-slate-900 dark:to-slate-950">
            <div className="p-6 text-center">
              <Input
                value={term}
                onChange={(e) => handleTermChange(e.target.value)}
                placeholder="Nhập term..."
                className="border-0 bg-transparent text-center text-2xl font-black text-slate-900 shadow-none placeholder:text-slate-300 dark:text-white"
              />
            </div>
            <div className="border-t border-slate-200 bg-slate-100 px-4 py-2 text-center text-xs text-slate-500 dark:border-white/5 dark:bg-white/[0.03]">
              <Eye className="mr-1 inline h-3 w-3" /> Learner sẽ thấy mặt này trước
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Mặt sau — Meaning
          </label>
          <div className="mt-2 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white dark:border-white/20 dark:bg-slate-950">
            <div className="p-6 text-center">
              <Textarea
                value={meaning}
                onChange={(e) => handleMeaningChange(e.target.value)}
                placeholder="Nhập nghĩa của term..."
                className="min-h-24 border-0 bg-transparent text-center text-lg font-medium text-slate-600 shadow-none placeholder:text-slate-300 dark:text-slate-300"
              />
            </div>
            <div className="border-t border-slate-200 bg-slate-100 px-4 py-2 text-center text-xs text-slate-500 dark:border-white/5 dark:bg-white/[0.03]">
              <EyeOff className="mr-1 inline h-3 w-3" /> Ẩn cho đến khi learner tự kiểm tra
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
        Mẹo: Nên để term là từ vựng gốc và meaning là nghĩa tiếng Việt hoặc định nghĩa ngắn gọn.
      </div>
    </div>
  );
}
