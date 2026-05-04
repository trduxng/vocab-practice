// vocab-practice/frontend/src/app/user/practice/page.tsx
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { userService } from "@/src/services/user.service";

// Fisher-Yates shuffle
const shuffle = <T,>(arr: T[]): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

interface QuestionOption {
  meaning: string;
  wordId: number;
  isCorrect: boolean;
}

interface PracticeQuestion {
  wordId: number;
  questionId: number;
  term: string;
  meaning: string;
  options: QuestionOption[];
}

const QUESTION_TIME = 10;

export default function UserPractice() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [wrongList, setWrongList] = useState<
    { term: string; meaning: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  // Refs để tránh setState trong effect
  const handleTimeoutRef = useRef<() => void>(() => {});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch flashcards và chuyển thành practice questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        const flashcards = await userService.getDueFlashcards(20);

        if (flashcards.length === 0) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        const allFlashcards = [...flashcards];

        const practiceQuestions: PracticeQuestion[] = flashcards.map((card) => {
          const wrongOptions = shuffle(
            allFlashcards.filter((f) => f.wordId !== card.wordId),
          ).slice(0, 3);

          const options: QuestionOption[] = shuffle([
            { meaning: card.meaning, wordId: card.wordId, isCorrect: true },
            ...wrongOptions.map((w) => ({
              meaning: w.meaning,
              wordId: w.wordId,
              isCorrect: false,
            })),
          ]);

          return {
            wordId: card.wordId,
            questionId: card.questionId,
            term: card.term,
            meaning: card.meaning,
            options,
          };
        });

        setQuestions(shuffle(practiceQuestions));
      } catch (err: unknown) {
        console.error("Failed to fetch practice questions:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "response" in err
              ? (err as { response: { data?: { message?: string } } }).response
                  ?.data?.message
              : "Không thể tải câu hỏi.";
        setError(errorMessage || "Không thể tải câu hỏi.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const current = questions[index];
  const progress =
    questions.length > 0 ? ((index + 1) / questions.length) * 100 : 0;
  const accuracy =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // Cập nhật handleTimeoutRef mỗi khi current thay đổi
  useEffect(() => {
    handleTimeoutRef.current = () => {
      if (!current) return;
      setChecked(true);
      setWrongList((prev) => [
        ...prev,
        { term: current.term, meaning: current.meaning },
      ]);
    };
  }, [current]);

  // Timer effect - KHÔNG gọi setState trực tiếp
  useEffect(() => {
    // Clear timer cũ nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Dừng timer nếu: đã check, đang loading, không có câu hỏi
    if (checked || loading || questions.length === 0) {
      return;
    }

    // Nếu hết giờ, gọi callback qua ref (không setState trực tiếp)
    if (timeLeft <= 0) {
      // Dùng setTimeout để defer setState ra khỏi effect
      timerRef.current = setTimeout(() => {
        handleTimeoutRef.current();
      }, 0);
      return;
    }

    // Đếm ngược
    timerRef.current = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, checked, loading, questions.length]);

  const submitAnswerToAPI = useCallback(
    async (selectedMeaning: string) => {
      if (!current) return;
      setSubmitting(true);
      try {
        const result = await userService.submitAnswer({
          questionId: current.questionId,
          submittedAnswer: selectedMeaning,
        });
        console.log("Practice answer submitted:", result);
      } catch (err) {
        console.error("Failed to submit practice answer:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [current],
  );

  const handleCheck = () => {
    if (!current || selected === null) return;

    const selectedOption = current.options[selected];
    const isCorrect = selectedOption.isCorrect;

    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setWrongList((prev) => [
        ...prev,
        { term: current.term, meaning: current.meaning },
      ]);
    }

    setChecked(true);
    submitAnswerToAPI(selectedOption.meaning);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((prev) => prev + 1);
      setSelected(null);
      setChecked(false);
      setTimeLeft(QUESTION_TIME);
    } else {
      setIndex(questions.length);
    }
  };

  const restart = () => {
    setQuestions(shuffle(questions));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setChecked(false);
    setTimeLeft(QUESTION_TIME);
    setWrongList([]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-600 rounded-xl text-white"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">
        <div className="text-center">
          <p className="text-xl mb-2">Chưa có câu hỏi nào</p>
          <p className="text-slate-400">
            Hãy học thêm từ vựng trước khi luyện tập.
          </p>
        </div>
      </div>
    );
  }

  // End screen
  if (index >= questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Hoàn thành</h1>
          <p className="text-lg mb-2">
            Điểm: {score} / {questions.length}
          </p>
          <p className="text-slate-400 mb-6">Accuracy: {accuracy}%</p>

          {wrongList.length > 0 && (
            <div className="text-left mb-6">
              <p className="mb-2 text-red-400">Câu sai:</p>
              <ul className="text-sm text-slate-300 space-y-1">
                {wrongList.map((w, i) => (
                  <li key={i}>
                    {w.term} → {w.meaning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={restart}
            className="px-6 py-3 bg-brand-600 rounded-xl"
          >
            Làm lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-2xl">
        {/* PROGRESS */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Tiến độ</span>
            <span>
              {index + 1}/{questions.length}
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-brand-500 to-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* TIMER */}
        <div className="text-right text-sm text-slate-400 mb-2">
          ⏱ {timeLeft}s
        </div>

        {/* WORD */}
        <h1 className="text-4xl text-white font-bold text-center mb-8">
          {current.term}
        </h1>

        {/* OPTIONS */}
        <div className="grid gap-4">
          {current.options.map((opt, i) => {
            const isSelected = selected === i;
            const isAnswer = opt.isCorrect;

            return (
              <button
                key={i}
                onClick={() => !checked && setSelected(i)}
                className={`p-4 rounded-xl border text-left transition
                  ${
                    checked
                      ? isAnswer
                        ? "bg-green-500/30 border-green-400 text-white"
                        : isSelected
                          ? "bg-red-500/30 border-red-400 text-white"
                          : "bg-white/5 border-white/10 text-slate-400"
                      : isSelected
                        ? "bg-brand-500/30 border-brand-400 text-white"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }
                `}
              >
                {opt.meaning}
              </button>
            );
          })}
        </div>

        {/* ACTION */}
        {!checked ? (
          <button
            disabled={selected === null || submitting}
            onClick={handleCheck}
            className="mt-6 w-full py-3 bg-brand-600 text-white rounded-xl disabled:opacity-50"
          >
            Check
          </button>
        ) : (
          <div className="mt-6 text-center">
            <p
              className={`text-lg font-semibold ${
                current.options[selected!]?.isCorrect
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {current.options[selected!]?.isCorrect ? "Đúng" : "Sai"}
            </p>

            {!current.options[selected!]?.isCorrect && (
              <p className="text-slate-300 mt-2">
                Đáp án đúng: {current.meaning}
              </p>
            )}

            <button
              onClick={next}
              disabled={submitting}
              className="mt-4 px-6 py-3 bg-white/10 rounded-xl text-white"
            >
              Câu tiếp
            </button>
          </div>
        )}

        {/* SCORE */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          Điểm: {score}
        </div>
      </div>
    </div>
  );
}
