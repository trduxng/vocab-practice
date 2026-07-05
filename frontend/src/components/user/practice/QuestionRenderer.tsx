"use client";

import React from "react";
import { Input } from "@/src/components/ui/input";
import { CheckCircle2, XCircle } from "lucide-react";

type RenderMode = "select" | "feedback";

export interface QuestionRendererProps {
  questionType?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  mode?: RenderMode;
  correctAnswer?: string;
  disabled?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  questionType,
  options,
  value,
  onChange,
  mode = "select",
  correctAnswer = "",
  disabled = false,
}) => {
  if (questionType === "MCQ") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {options.map((option, optionIndex) => {
          const isSelected = value === option;
          const isAnswer = mode === "feedback" && option === correctAnswer;
          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option)}
              className={`group p-8 rounded-[32px] border-2 text-left transition-all relative ${
                mode === "feedback"
                  ? isAnswer
                    ? "bg-green-500/10 border-green-500/40 text-white"
                    : isSelected
                      ? "bg-red-500/10 border-red-500/40 text-white"
                      : "dark:bg-white/2 bg-white border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-700"
                  : isSelected
                    ? "bg-blue-600/10 border-blue-500 text-white shadow-2xl scale-[1.02]"
                    : "dark:bg-white/2 bg-white border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 dark:hover:bg-white/10 hover:bg-slate-100 hover:border-slate-300 dark:hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-5">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${
                  mode === "feedback"
                    ? isAnswer
                      ? "bg-green-500 border-green-400 text-white"
                      : isSelected
                        ? "bg-red-500 border-red-400 text-white"
                        : "dark:bg-white/5 bg-slate-100 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-600"
                    : isSelected
                      ? "bg-blue-500 border-blue-400 text-white"
                      : "dark:bg-white/5 bg-slate-100 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-600"
                }`}>
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="font-bold text-xl">{option}</span>
              </div>
              {mode === "feedback" && isAnswer && (
                <span className="absolute right-5 top-1/2 -translate-y-1/2">
                  <CheckCircle2 size={24} className="text-green-400" />
                </span>
              )}
              {mode === "feedback" && isSelected && !isAnswer && (
                <span className="absolute right-5 top-1/2 -translate-y-1/2">
                  <XCircle size={24} className="text-red-400" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <Input
        value={value}
        autoFocus
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập câu trả lời..."
        className={`h-24 text-4xl font-black text-center rounded-[32px] dark:bg-white/3 bg-white border-4 transition-all ${
          mode === "feedback"
            ? value.trim().toLowerCase().replace(/\s+/g, " ") === correctAnswer.trim().toLowerCase().replace(/\s+/g, " ")
              ? "border-green-500 text-green-400 shadow-glow-green"
              : "border-red-500 text-red-400 shadow-glow-red"
            : "border-slate-200 dark:border-white/5 focus:border-blue-600 focus:dark:bg-white/5 focus:bg-slate-50 text-slate-900 dark:text-white"
        }`}
      />
    </div>
  );
};
