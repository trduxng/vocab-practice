"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/src/components/ui/input";
import { CheckCircle2, X, XCircle } from "lucide-react";

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
  // ── DragDrop state ──
  const [placed, setPlaced] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>([]);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  useEffect(() => {
    if (questionType === "DragDrop") {
      const words = options.length > 0 ? [...options] : (correctAnswer ? correctAnswer.split(" ") : []);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setBank(shuffled);
      setPlaced([]);
    }
  }, [questionType, correctAnswer, options]);

  useEffect(() => {
    if (questionType === "DragDrop") {
      onChangeRef.current(placed.join(" "));
    }
  }, [placed, questionType]);

  // ── MCQ ──
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

  // ── DragDrop ──
  if (questionType === "DragDrop") {
    const words = options.length > 0 ? options : (correctAnswer ? correctAnswer.split(" ") : []);
    const totalSlots = words.length;
    const emptySlots = totalSlots - placed.length;
    const isCorrect = disabled && value.trim().toLowerCase().replace(/\s+/g, " ") === correctAnswer.trim().toLowerCase().replace(/\s+/g, " ");

    const handlePlace = (word: string) => {
      setPlaced((prev) => [...prev, word]);
      setBank((prev) => prev.filter((w) => w !== word));
    };

    const handleRemove = (index: number) => {
      setBank((prev) => [...prev, placed[index]]);
      setPlaced((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Drop zone */}
        <div className="bg-white/[0.02] border-2 border-dashed border-white/10 rounded-3xl p-5 min-h-[80px]">
          <div className="flex flex-wrap gap-3">
            {placed.map((item, index) => (
              <button
                key={`placed-${item}-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => { if (!disabled) handleRemove(index); }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-base transition-all cursor-pointer ${
                  disabled
                    ? isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/40 bg-red-500/10 text-red-400"
                    : "border-blue-500/40 bg-blue-500/10 text-slate-900 dark:text-white hover:bg-blue-500/20"
                }`}
              >
                <span>{item}</span>
                {!disabled && <X size={14} className="text-slate-400" />}
              </button>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="inline-flex items-center px-4 py-3 rounded-xl border-2 border-slate-600/30 bg-slate-800/30 min-w-[56px]"
              />
            ))}

          </div>
        </div>

        {/* Word bank */}
        {!disabled && bank.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {bank.map((item, index) => (
              <button
                key={`bank-${item}-${index}`}
                type="button"
                onClick={() => handlePlace(item)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 font-bold text-base hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
              >
                <span>{item}</span>
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {disabled && !isCorrect && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Thứ tự đúng</p>
            <p className="text-red-400 text-xl font-black">{correctAnswer}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Dictation ──
  if (questionType === "Dictation") {
    const isExactCorrect = mode === "feedback" && value.trim().toLowerCase().replace(/\s+/g, " ") === correctAnswer.trim().toLowerCase().replace(/\s+/g, " ");
    return (
      <div className="w-full max-w-xl mx-auto space-y-4">
        <Input
          value={value}
          autoFocus
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Gõ lại những gì bạn nghe được..."
          className={`h-20 text-3xl font-black text-center rounded-[32px] dark:bg-white/3 bg-white border-4 transition-all ${
            mode === "feedback"
              ? isExactCorrect
                ? "border-green-500 text-green-400 shadow-glow-green"
                : "border-red-500 text-red-400 shadow-glow-red"
              : "border-slate-200 dark:border-white/10 focus:border-blue-600 focus:dark:bg-white/5 focus:bg-slate-50 text-slate-900 dark:text-white"
          }`}
        />
        {mode === "feedback" && !isExactCorrect && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Đáp án đúng</p>
            <p className="text-red-400 text-2xl font-black">{correctAnswer}</p>
          </div>
        )}
      </div>
    );
  }

  // ── FillBlank ──
  if (questionType === "FillBlank") {
    const isExactCorrect = mode === "feedback" && value.trim().toLowerCase().replace(/\s+/g, " ") === correctAnswer.trim().toLowerCase().replace(/\s+/g, " ");
    return (
      <div className="w-full max-w-xl mx-auto space-y-4">
        <div className="relative">
          <Input
            value={value}
            autoFocus
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Gõ đáp án của bạn..."
            className={`h-20 text-3xl font-black text-center rounded-[32px] dark:bg-white/3 bg-white border-4 transition-all pr-12 ${
              mode === "feedback"
                ? isExactCorrect
                  ? "border-green-500 text-green-400 shadow-glow-green"
                  : "border-red-500 text-red-400 shadow-glow-red"
                : value
                  ? "border-blue-500/50 bg-blue-500/5 text-slate-900 dark:text-white"
                  : "border-slate-200 dark:border-white/10 focus:border-blue-600 focus:dark:bg-white/5 focus:bg-slate-50 text-slate-900 dark:text-white"
            }`}
          />
          {value && mode !== "feedback" && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {mode === "feedback" && !isExactCorrect && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Đáp án đúng</p>
            <p className="text-red-400 text-2xl font-black">{correctAnswer}</p>
          </div>
        )}

      </div>
    );
  }

  // ── Fallback ──
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
