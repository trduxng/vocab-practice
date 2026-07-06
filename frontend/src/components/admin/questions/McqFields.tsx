"use client";

import { X, Plus, CheckCircle } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

type McqFieldsProps = {
  options: string[];
  correctAnswer: string;
  onOptionsChange: (options: string[]) => void;
  onCorrectAnswerChange: (answer: string) => void;
};

export function McqFields({ options, correctAnswer, onOptionsChange, onCorrectAnswerChange }: McqFieldsProps) {
  function updateOption(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    onOptionsChange(next);
  }

  function addOption() {
    onOptionsChange([...options, ""]);
  }

  function removeOption(index: number) {
    onOptionsChange(options.filter((_, i) => i !== index));
    if (correctAnswer === options[index]) {
      onCorrectAnswerChange("");
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
        Các lựa chọn
      </label>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {options.map((option, index) => {
          const isCorrect = correctAnswer === option;
          return (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-lg border p-1.5 transition-colors ${
                isCorrect
                  ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                  : "border-slate-200 dark:border-white/10"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                {String.fromCharCode(65 + index)}
              </span>
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                className="h-10 rounded-md"
              />
              <button
                type="button"
                onClick={() => onCorrectAnswerChange(option)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  isCorrect
                    ? "border-emerald-400 bg-emerald-500 text-white"
                    : "border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 dark:border-white/10"
                }`}
                title="Đánh dấu là đáp án đúng"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-400 hover:text-rose-500"
                  title="Xóa lựa chọn"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <Button type="button" variant="outline" onClick={addOption} className="h-9 rounded-md">
        <Plus className="mr-1 h-4 w-4" /> Thêm lựa chọn
      </Button>
      {!correctAnswer && (
        <p className="text-xs text-amber-500">Vui lòng chọn đáp án đúng bằng cách click vào icon <CheckCircle className="inline h-3 w-3" /></p>
      )}
    </div>
  );
}
