"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { HelpCircle } from "lucide-react";

type FillBlankFieldsProps = {
  questionText: string;
  correctAnswer: string;
  onQuestionTextChange: (text: string) => void;
  onCorrectAnswerChange: (answer: string) => void;
};

export function FillBlankFields({
  questionText,
  correctAnswer,
  onQuestionTextChange,
  onCorrectAnswerChange,
}: FillBlankFieldsProps) {
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [hint, setHint] = useState("");

  const blankCount = (questionText.match(/\{blank\}/g) || []).length;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Nội dung câu hỏi
        </label>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Dùng <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-blue-600 dark:bg-slate-800 dark:text-blue-400">{`{blank}`}</code> để đánh dấu vị trí điền.
          {blankCount > 0 && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400">
              ({blankCount} chỗ trống)
            </span>
          )}
        </p>
        <Textarea
          value={questionText}
          onChange={(e) => onQuestionTextChange(e.target.value)}
          placeholder={`Ví dụ: The scientific study of {blank} is called biology.`}
          className="mt-2 min-h-24 rounded-md font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Đáp án đúng
          </label>
          <Input
            value={correctAnswer}
            onChange={(e) => onCorrectAnswerChange(e.target.value)}
            placeholder="Nhập đáp án đúng"
            className="mt-2 h-10 rounded-md"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Gợi ý (hiển thị khi learner cần trợ giúp)
          </label>
          <div className="relative mt-2">
            <Input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="VD: It starts with 'l' and has 4 letters"
              className="h-10 rounded-md pr-8"
            />
            <HelpCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={caseInsensitive}
            onChange={(e) => setCaseInsensitive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Case-insensitive (chấp nhận &quot;Life&quot; = &quot;life&quot;)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={(e) => setAllowMultiple(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Cho phép nhiều đáp án (phân cách bằng dấu phẩy)
        </label>
      </div>
    </div>
  );
}
