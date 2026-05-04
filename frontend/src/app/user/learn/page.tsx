// vocab-practice/frontend/src/app/user/learn/page.tsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Volume2, Check, X, RotateCcw } from "lucide-react";
import { userService } from "@/src/services/user.service";
import type {
  Flashcard,
  SubmitAnswerResponse,
} from "@/src/services/user.service";

export default function StudentFlashcard() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch flashcards từ API
  useEffect(() => {
    async function fetchFlashcards() {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getDueFlashcards(20);
        setFlashcards(data);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "response" in err
              ? (err as { response: { data?: { message?: string } } }).response
                  ?.data?.message
              : "Không thể tải flashcards. Vui lòng thử lại sau.";
        setError(
          errorMessage || "Không thể tải flashcards. Vui lòng thử lại sau.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchFlashcards();
  }, []);

  const card = flashcards[index];
  const progress =
    flashcards.length > 0 ? ((index + 1) / flashcards.length) * 100 : 0;

  const handleAnswer = async (isCorrect: boolean) => {
    if (!card || submitting) return;

    setSubmitting(true);
    try {
      const result: SubmitAnswerResponse = await userService.submitAnswer({
        questionId: card.questionId,
        submittedAnswer: isCorrect ? "known" : "unknown",
      });
      console.log("Answer submitted:", result);
    } catch (err) {
      console.error("Failed to submit answer:", err);
      // Vẫn tiếp tục dù submit lỗi (có thể retry sau)
    } finally {
      setSubmitting(false);
      nextCard();
    }
  };

  const nextCard = useCallback(() => {
    setFlipped(false);
    if (index < flashcards.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      // Đã học hết flashcards trong phiên này
      setIndex(0); // Quay lại đầu hoặc hiển thị message
    }
  }, [index, flashcards.length]);

  const resetCard = () => {
    setFlipped(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Đang tải flashcards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Tuyệt vời!</h2>
          <p className="text-slate-400 mb-2">
            Bạn không có từ nào cần ôn tập lúc này.
          </p>
          <p className="text-slate-500 text-sm">
            Hãy quay lại sau hoặc học thêm từ mới.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-center text-white text-4xl font-bold mb-10">
          Flashcard học từ vựng
        </h1>

        {/* PROGRESS */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Tiến độ</span>
            <span>
              {index + 1} / {flashcards.length}
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-linear-to-r from-brand-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* FLASHCARD */}
        <div className="relative" style={{ perspective: "1400px" }}>
          <div
            onClick={() => setFlipped((p) => !p)}
            className="relative w-full h-130 cursor-pointer transition-transform duration-700"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT */}
            <div
              className="absolute inset-0 rounded-3xl bg-linear-to-br from-brand-900/70 to-slate-900 border border-white/10 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-slate-400 text-sm mb-4">Từ vựng</p>
              <h2 className="text-white text-6xl font-bold mb-3">
                {card.term}
              </h2>
              <p className="text-brand-400 text-base mb-8">{card.phonetic}</p>
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                <Volume2 size={20} className="text-brand-400" />
                <span className="text-slate-300 text-sm">Nghe phát âm</span>
              </div>
            </div>

            {/* BACK */}
            <div
              className="absolute inset-0 rounded-3xl bg-linear-to-br from-violet-900/70 to-slate-900 border border-white/10 flex flex-col items-center justify-center text-center px-14"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <h2 className="text-white text-4xl font-bold mb-4">
                {card.meaning}
              </h2>
              <p className="text-slate-300 text-base max-w-lg mb-4">
                <span className="text-slate-500">Ví dụ: </span>
                {card.questionText}
              </p>
              <p className="text-slate-500 text-sm mt-4">
                Nhấn để lật lại mặt trước
              </p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-3 gap-4 mt-10">
          <button
            onClick={() => handleAnswer(false)}
            disabled={submitting}
            className="bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 px-5 py-3 rounded-xl flex justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} /> Quên
          </button>

          <button
            onClick={resetCard}
            disabled={submitting}
            className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 px-5 py-3 rounded-xl flex justify-center gap-2"
          >
            <RotateCcw size={18} /> Xem lại
          </button>

          <button
            onClick={() => handleAnswer(true)}
            disabled={submitting}
            className="bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 px-5 py-3 rounded-xl flex justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={18} /> Nhớ
          </button>
        </div>
      </div>
    </div>
  );
}
