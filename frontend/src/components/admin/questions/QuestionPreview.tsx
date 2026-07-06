"use client";

import { useState } from "react";
import { QuestionRenderer } from "@/src/components/user/practice/QuestionRenderer";
import { Eye } from "lucide-react";

type QuestionPreviewProps = {
  questionType: string;
  options: string[];
  correctAnswer: string;
  questionText: string;
};

export function QuestionPreview({ questionType, options, correctAnswer, questionText }: QuestionPreviewProps) {
  const [value, setValue] = useState("");

  const previewOptions = (() => {
    if (questionType === "DragDrop") return options.length > 0 ? options : correctAnswer ? correctAnswer.split(" ") : [];
    if (questionType === "MCQ") return options.filter(Boolean);
    return [];
  })();

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-white/10">
        <Eye className="h-4 w-4 text-slate-500" />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Preview
        </span>
      </div>
      <div className="p-4">
        {questionText && (
          <p className="mb-4 text-center text-lg font-bold text-slate-800 dark:text-slate-200">
            {questionText}
          </p>
        )}
        <QuestionRenderer
          questionType={questionType}
          options={previewOptions}
          value={value}
          onChange={setValue}
          mode="select"
          correctAnswer={correctAnswer}
        />
      </div>
    </div>
  );
}
