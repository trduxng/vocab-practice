"use client";

import { useState } from "react";
import { X, Plus, GripVertical, ArrowUpDown } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

type DragDropFieldsProps = {
  options: string[];
  correctAnswer: string;
  onOptionsChange: (options: string[]) => void;
  onCorrectAnswerChange: (answer: string) => void;
};

export function DragDropFields({ options, correctAnswer, onOptionsChange, onCorrectAnswerChange }: DragDropFieldsProps) {
  const [newWord, setNewWord] = useState("");

  const words = options.length > 0 ? options : correctAnswer ? correctAnswer.split(" ") : [];
  const correctWords = correctAnswer ? correctAnswer.split(" ") : words;

  function addWord() {
    const trimmed = newWord.trim();
    if (!trimmed) return;
    onOptionsChange([...options, trimmed]);
    onCorrectAnswerChange(correctAnswer ? `${correctAnswer} ${trimmed}` : trimmed);
    setNewWord("");
  }

  function removeWord(index: number) {
    const removed = words[index];
    const nextWords = words.filter((_, i) => i !== index);
    onOptionsChange(nextWords);
    const nextCorrect = correctWords.filter((w) => w !== removed || correctWords.indexOf(w) !== correctWords.lastIndexOf(w)).length === 0
      ? correctWords.filter((w, i) => i !== correctWords.indexOf(removed))
      : correctWords;
    onCorrectAnswerChange(nextCorrect.join(" "));
  }

  function moveWord(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= words.length) return;
    const next = [...words];
    [next[index], next[target]] = [next[target], next[index]];
    onOptionsChange(next);
    onCorrectAnswerChange(next.join(" "));
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Danh sách từ (learner sẽ kéo thả các từ này)
        </label>
        <div className="mt-2 space-y-1.5">
          {words.map((word, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                {index + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">{word}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveWord(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 dark:hover:text-slate-300"
                  title="Di chuyển lên"
                >
                  <ArrowUpDown className="h-3.5 w-3.5 rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => moveWord(index, 1)}
                  disabled={index === words.length - 1}
                  className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 dark:hover:text-slate-300"
                  title="Di chuyển xuống"
                >
                  <ArrowUpDown className="h-3.5 w-3.5 -rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => removeWord(index)}
                  className="rounded p-1 text-slate-400 hover:text-rose-500"
                  title="Xóa từ"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addWord(); } }}
          placeholder="Nhập từ mới..."
          className="h-10 rounded-md"
        />
        <Button type="button" variant="outline" onClick={addWord} className="h-10 shrink-0 rounded-md">
          <Plus className="mr-1 h-4 w-4" /> Thêm
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Thứ tự đúng:</p>
        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {correctWords.join(" \u2192 ")}
        </p>
      </div>
    </div>
  );
}
