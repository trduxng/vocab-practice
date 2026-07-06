"use client";

import { useState, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { adminService } from "@/src/services/admin.service";
import { toast } from "sonner";
import { McqFields } from "./McqFields";
import { FillBlankFields } from "./FillBlankFields";
import { DragDropFields } from "./DragDropFields";
import { DictationFields } from "./DictationFields";
import { FlashcardCheckFields } from "./FlashcardCheckFields";
import { QuestionPreview } from "./QuestionPreview";
import { adminLabel } from "@/src/lib/admin-i18n";

export type QuestionType = "MCQ" | "FillBlank" | "DragDrop" | "Dictation" | "FlashcardCheck";
export type ContentStatus = "Draft" | "PendingReview" | "Published" | "Rejected" | "Archived";

export type WordItem = {
  id: number;
  term: string;
  meaning: string;
};

export type QuestionItem = {
  id: number;
  questionType: QuestionType;
  questionText: string;
  optionsJson?: string;
  correctAnswer: string;
  explanation?: string;
  status?: ContentStatus;
  difficultyLevel?: number;
};

const questionTypes: QuestionType[] = ["MCQ", "FillBlank", "DragDrop", "Dictation", "FlashcardCheck"];
const statusOptions: ContentStatus[] = ["Draft", "PendingReview", "Published", "Rejected", "Archived"];

type QuestionFormProps = {
  word: WordItem;
  question?: QuestionItem | null;
  onSaved: () => void;
  onCancel: () => void;
};

export function QuestionForm({ word, question, onSaved, onCancel }: QuestionFormProps) {
  const [questionType, setQuestionType] = useState<QuestionType>(question?.questionType || "MCQ");
  const [questionText, setQuestionText] = useState(question?.questionText || `What is the correct meaning of "${word.term}"?`);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || word.meaning);
  const [options, setOptions] = useState<string[]>(() => {
    if (question?.optionsJson) {
      try {
        const parsed = JSON.parse(question.optionsJson);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      } catch { /* ignore */ }
    }
    return questionType === "MCQ" ? [word.meaning, "", "", ""] : [];
  });
  const [explanation, setExplanation] = useState(question?.explanation || "");
  const [status, setStatus] = useState<ContentStatus>(question?.status || "Published");
  const [difficultyLevel, setDifficultyLevel] = useState(question?.difficultyLevel || 1);
  const [saving, setSaving] = useState(false);

  const resetAnswerOnTypeChange = useCallback((newType: QuestionType) => {
    if (newType === "FlashcardCheck") {
      setQuestionText(word.meaning);
      setCorrectAnswer(word.term);
      setOptions([]);
    } else if (newType === "DragDrop") {
      const words = word.term.split(" ");
      setQuestionText(`Arrange the words to form a correct sentence:`);
      setCorrectAnswer(word.term);
      setOptions(words);
    } else {
      setQuestionText(`What is the correct meaning of "${word.term}"?`);
      setCorrectAnswer(word.meaning);
      setOptions(newType === "MCQ" ? [word.meaning, "", "", ""] : []);
    }
  }, [word]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const trimmedText = questionText.trim();
      const trimmedAnswer = correctAnswer.trim();
      const trimmedExplanation = explanation.trim();

      if (trimmedText.length < 5) throw new Error("Nội dung câu hỏi phải có ít nhất 5 ký tự");
      if (!trimmedAnswer) throw new Error("Vui lòng nhập đáp án đúng");

      const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
      if (questionType === "MCQ") {
        if (cleanOptions.length < 2) throw new Error("Câu trắc nghiệm cần ít nhất 2 lựa chọn");
        if (!cleanOptions.includes(trimmedAnswer)) throw new Error("Đáp án đúng phải nằm trong danh sách lựa chọn");
      }

      const payload = {
        wordId: word.id,
        questionType,
        questionText: trimmedText,
        optionsJson: JSON.stringify(questionType === "MCQ" || questionType === "DragDrop" ? cleanOptions : []),
        correctAnswer: trimmedAnswer,
        explanation: trimmedExplanation || undefined,
        status,
        difficultyLevel,
      };

      if (question) {
        await adminService.updateQuestion(question.id, payload);
        toast.success("Đã cập nhật câu hỏi");
      } else {
        await adminService.createQuestion(payload);
        toast.success("Đã tạo câu hỏi");
      }
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu câu hỏi");
    } finally {
      setSaving(false);
    }
  }

  function renderTypeSpecificFields() {
    switch (questionType) {
      case "MCQ":
        return (
          <McqFields
            options={options}
            correctAnswer={correctAnswer}
            onOptionsChange={setOptions}
            onCorrectAnswerChange={setCorrectAnswer}
          />
        );
      case "FillBlank":
        return (
          <FillBlankFields
            questionText={questionText}
            correctAnswer={correctAnswer}
            onQuestionTextChange={setQuestionText}
            onCorrectAnswerChange={setCorrectAnswer}
          />
        );
      case "DragDrop":
        return (
          <DragDropFields
            options={options}
            correctAnswer={correctAnswer}
            onOptionsChange={setOptions}
            onCorrectAnswerChange={setCorrectAnswer}
          />
        );
      case "Dictation":
        return (
          <DictationFields
            questionText={questionText}
            correctAnswer={correctAnswer}
            onQuestionTextChange={setQuestionText}
            onCorrectAnswerChange={setCorrectAnswer}
          />
        );
      case "FlashcardCheck":
        return (
          <FlashcardCheckFields
            correctAnswer={correctAnswer}
            questionText={questionText}
            onCorrectAnswerChange={(val) => { setCorrectAnswer(val); }}
            onQuestionTextChange={(val) => { setQuestionText(val); }}
            defaultTerm={word.term}
          />
        );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
            {question ? "Sửa câu hỏi" : "Tạo câu hỏi"}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gắn với từ <strong>{word.term}</strong> — {word.meaning}
          </p>
        </div>
        <button type="button" onClick={onCancel} className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Loại câu hỏi</label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {questionTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (!question) resetAnswerOnTypeChange(type);
                  setQuestionType(type);
                }}
                disabled={!!question}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  questionType === type
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                } ${question ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {adminLabel(type)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Độ khó</label>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficultyLevel(level)}
                className={`h-8 w-8 rounded-md text-xs font-bold transition-colors ${
                  difficultyLevel >= level
                    ? level <= 2
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : level <= 4
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                    : "border border-slate-200 bg-slate-50 text-slate-300 dark:border-white/10 dark:bg-white/[0.04]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentStatus)}
            className="mt-1 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{adminLabel(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {questionType !== "FillBlank" && questionType !== "FlashcardCheck" && questionType !== "Dictation" && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Nội dung câu hỏi
          </label>
          <Textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="mt-1 min-h-20 rounded-md"
          />
        </div>
      )}

      {renderTypeSpecificFields()}

      {questionType !== "FillBlank" && questionType !== "Dictation" && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Đáp án đúng
          </label>
          <Input
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="mt-1 h-10 rounded-md"
          />
        </div>
      )}

      <QuestionPreview
        questionType={questionType}
        options={questionType === "DragDrop" ? options : questionType === "MCQ" ? options : []}
        correctAnswer={correctAnswer}
        questionText={questionType === "FlashcardCheck" ? `Do you know the meaning of "${correctAnswer || word.term}"?` : questionText}
      />

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Giải thích</label>
        <Textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="mt-1 min-h-20 rounded-md"
          placeholder="Giải thích thêm về đáp án (hiển thị sau khi learner trả lời)..."
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-md">Hủy</Button>
        <Button type="submit" disabled={saving} className="rounded-md bg-blue-600 hover:bg-blue-700">
          {saving ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : question ? "Cập nhật câu hỏi" : "Tạo câu hỏi"}
        </Button>
      </div>
    </form>
  );
}
