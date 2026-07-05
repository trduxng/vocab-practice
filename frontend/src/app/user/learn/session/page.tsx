"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookmarkCheck, BookmarkPlus, Keyboard, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/src/app/context/AuthContext";
import ReportDialog from "@/src/components/shared/ReportDialog";
import FlashcardStudyCard from "@/src/components/user/learn/FlashcardStudyCard";
import LearningFeedback from "@/src/components/user/learn/LearningFeedback";
import ReviewGradeButtons from "@/src/components/user/learn/ReviewGradeButtons";
import SessionComplete from "@/src/components/user/learn/SessionComplete";
import SessionProgress from "@/src/components/user/learn/SessionProgress";
import GamificationCelebration from "@/src/components/user/gamification/GamificationCelebration";
import { userService } from "@/src/services/user.service";
import type { Flashcard, GamificationReward, ReviewFeedback, ReviewRating } from "@/src/modules/user/types";

type SessionResults = {
  total: number;
  remembered: number;
  again: number;
};

type SessionSummary = {
  totalXP: number;
  currentLevel: number;
};

const initialResults: SessionResults = {
  total: 0,
  remembered: 0,
  again: 0,
};

export default function StudentFlashcard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [latestReward, setLatestReward] = useState<GamificationReward | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionResults>(initialResults);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [savedWordIds, setSavedWordIds] = useState<Set<number>>(new Set());
  const [savingWordId, setSavingWordId] = useState<number>();
  const advanceTimer = useRef<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const currentCard = flashcards[index];
  const sessionRoute = getSessionRoute();

  const fetchFlashcards = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const topicId = searchParams.get("topicId") || undefined;
      const mode = searchParams.get("mode") || undefined;
      const cards = await userService.getDueFlashcards({ topicId, mode });
      setFlashcards(Array.isArray(cards) ? cards : []);
    } catch (error) {
      console.error("Failed to fetch flashcards", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const timeout = window.setTimeout(() => {
      void fetchFlashcards();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchFlashcards, user]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      audio.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const playAudio = useCallback(() => {
    if (!currentCard) return;

    audio.current?.pause();
    const audioUrl = currentCard.audioUrlUS || currentCard.audioUrlUK;
    if (audioUrl) {
      const nextAudio = new Audio(audioUrl);
      audio.current = nextAudio;
      void nextAudio.play().catch(() => speak(currentCard.term));
      return;
    }

    speak(currentCard.term);
  }, [currentCard]);

  const saveCurrentWord = useCallback(async () => {
    if (!currentCard || savedWordIds.has(currentCard.wordId) || savingWordId) return;

    setSavingWordId(currentCard.wordId);
    try {
      await userService.addNotebookEntry(currentCard.wordId);
      setSavedWordIds((current) => new Set(current).add(currentCard.wordId));
      toast.success(`Đã thêm "${currentCard.term}" vào sổ tay`);
    } catch (error) {
      console.error("Failed to add flashcard to notebook", error);
      toast.error("Không thể thêm từ vào sổ tay");
    } finally {
      setSavingWordId(undefined);
    }
  }, [currentCard, savedWordIds, savingWordId]);

  const finishSession = useCallback(() => {
    setSessionFinished(true);
    void userService.getSessionSummary()
      .then((summary) => {
        setSessionSummary({
          totalXP: Number(summary?.totalXP || 0),
          currentLevel: Number(summary?.currentLevel || 1),
        });
      })
      .catch((error) => {
        console.error("Failed to fetch session summary", error);
      });
  }, []);

  const handleGrade = useCallback(async (rating: ReviewRating) => {
    if (!currentCard || !flipped || submitting) return;

    const isCorrect = rating !== "Again";
    setSubmitting(true);

    try {
      const result = await userService.submitAnswer({
        questionId: currentCard.questionId,
        wordId: currentCard.wordId,
        submittedAnswer: isCorrect ? (currentCard.correctAnswer || currentCard.term) : "wrong",
        isCorrect,
        scoreAwarded: isCorrect ? 1 : 0,
        reviewRating: rating,
        activityType: "LearnWord",
      });
      const xpGained = Number(result.xpGained || 0);

      setFeedback({
        ...result,
        xpGained,
        reviewRating: rating,
      });
      setLatestReward(result.gamification || null);
      setSessionXP((value) => value + xpGained);
      setSessionResults((previous) => ({
        total: previous.total + 1,
        remembered: previous.remembered + (isCorrect ? 1 : 0),
        again: previous.again + (isCorrect ? 0 : 1),
      }));

      advanceTimer.current = window.setTimeout(() => {
        if (index < flashcards.length - 1) {
          setIndex((value) => value + 1);
          setFlipped(false);
          setFeedback(null);
          setSubmitting(false);
        } else {
          setSubmitting(false);
          finishSession();
        }
      }, 850);
    } catch (error) {
      console.error("Failed to submit flashcard review", error);
      toast.error("Không thể lưu kết quả. Vui lòng thử lại.");
      setSubmitting(false);
    }
  }, [currentCard, finishSession, flashcards.length, flipped, index, submitting]);

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (!flipped) {
      setFlipped(true);
      return;
    }

    void handleGrade(direction === "left" ? "Again" : "Good");
  }, [flipped, handleGrade]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      if (event.code === "Space") {
        event.preventDefault();
        if (!submitting) setFlipped((value) => !value);
        return;
      }

      const rating = shortcutRatings[event.key];
      if (rating && flipped) {
        event.preventDefault();
        void handleGrade(rating);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipped, handleGrade, submitting]);

  const memoryTip = useMemo(() => getMemoryTip(currentCard), [currentCard]);

  if (authLoading || loading) {
    return <LearnLoading />;
  }

  if (loadError) {
    return (
      <CenteredState
        title="Không thể tải phiên học"
        description="Dữ liệu thẻ từ chưa sẵn sàng. Hãy thử tải lại."
        actionLabel="Thử lại"
        onAction={() => void fetchFlashcards()}
      />
    );
  }

  if (flashcards.length === 0) {
    return (
      <CenteredState
        title={sessionRoute.mode === "new" ? "Bạn đã học hết từ mới" : "Bạn đã hoàn thành thẻ từ hôm nay"}
        description={sessionRoute.mode === "new"
          ? "Chủ đề này không còn từ mới. Bạn có thể quay lại danh sách từ để luyện tập hoặc chọn một chủ đề khác."
          : "Không còn từ mới hoặc từ đến hạn ôn tập. Hãy quay lại trang học tập để chọn hoạt động khác."}
        actionLabel={sessionRoute.topicId ? "Về chủ đề" : "Chọn chủ đề"}
        onAction={() => router.push(sessionRoute.topicId ? `/user/learn/${sessionRoute.topicId}` : "/user/learn")}
      />
    );
  }

  if (sessionFinished) {
    return (
      <main className="flex min-h-screen items-center bg-slate-100 px-4 py-8 dark:bg-slate-950">
        <SessionComplete
          totalCards={sessionResults.total}
          xpEarned={sessionXP}
          remembered={sessionResults.remembered}
          again={sessionResults.again}
          totalXP={sessionSummary?.totalXP || sessionXP}
          currentLevel={sessionSummary?.currentLevel || 1}
          currentLevelXP={latestReward?.currentLevelXP || 0}
          xpForNextLevel={latestReward?.xpForNextLevel || 100}
          levelProgress={latestReward?.levelProgress || 0}
          onRestart={() => window.location.reload()}
          onFinish={() => router.push(sessionRoute.topicId ? `/user/learn/${sessionRoute.topicId}` : "/user/learn")}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 dark:bg-slate-950 sm:px-5 sm:py-6">
      <GamificationCelebration reward={latestReward} />
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push(sessionRoute.topicId ? `/user/learn/${sessionRoute.topicId}` : "/user/learn")}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-xs font-black uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Thoát
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-400 shadow-sm sm:flex dark:border-white/10 dark:bg-white/5">
            <Keyboard className="h-3.5 w-3.5" />
            Space để lật · 1 - 4 để trả lời
          </div>
          {currentCard && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void saveCurrentWord()}
                disabled={savedWordIds.has(currentCard.wordId) || savingWordId === currentCard.wordId}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:disabled:border-emerald-500/20 dark:disabled:bg-emerald-500/10 dark:disabled:text-emerald-300"
              >
                {savedWordIds.has(currentCard.wordId) ? <BookmarkCheck className="h-3.5 w-3.5" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
                {savedWordIds.has(currentCard.wordId) ? "Đã lưu" : "Lưu từ"}
              </button>
              <ReportDialog
                wordId={currentCard.wordId}
                questionId={currentCard.questionId}
                entityType="Word"
                defaultType="WordIncorrect"
                title={`Báo cáo từ: ${currentCard.term}`}
                context={currentCard.meaning}
                buttonClassName="border-slate-200 bg-white text-slate-500 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:hover:text-white"
              />
            </div>
          )}
        </div>

        <SessionProgress current={index + 1} total={flashcards.length} xpEarned={sessionXP} />

        <div className="mt-4">
          {currentCard && (
            <FlashcardStudyCard
              card={currentCard}
              flipped={flipped}
              memoryTip={memoryTip}
              onFlip={() => {
                if (!submitting) setFlipped((value) => !value);
              }}
              onPlayAudio={playAudio}
              onSwipe={handleSwipe}
            />
          )}
        </div>

        <div className="mt-4 min-h-16">
          {feedback ? <LearningFeedback feedback={feedback} /> : (
            <div className="flex min-h-16 items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 text-center text-[11px] font-bold text-slate-400 dark:border-white/10">
              Trên điện thoại: vuốt trái để học lại, vuốt phải nếu bạn nhớ từ.
            </div>
          )}
        </div>

        <div className="mt-4">
          <ReviewGradeButtons revealed={flipped} disabled={submitting} onSelect={(rating) => void handleGrade(rating)} />
        </div>
      </div>
    </main>
  );
}

const shortcutRatings: Record<string, ReviewRating> = {
  "1": "Again",
  "2": "Hard",
  "3": "Good",
  "4": "Easy",
};

function speak(text: string) {
  if (!window.speechSynthesis || !text) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function getMemoryTip(card?: Flashcard) {
  if (!card) return "";
  if (card.memoryStatus === "Lapsed") {
    return `Từ "${card.term}" từng gây khó khăn. Hãy liên tưởng trực tiếp với nghĩa "${card.meaning}".`;
  }
  if (card.exampleSentence) {
    return `Đọc lại câu ví dụ và nhấn mạnh từ "${card.term}" để tạo ngữ cảnh ghi nhớ.`;
  }
  return `Tạo một hình ảnh ngắn kết nối "${card.term}" với nghĩa "${card.meaning}".`;
}

function getSessionRoute(): { topicId?: string; mode?: string } {
  if (typeof window === "undefined") return {};

  const searchParams = new URLSearchParams(window.location.search);
  return {
    topicId: searchParams.get("topicId") || undefined,
    mode: searchParams.get("mode") || undefined,
  };
}

function LearnLoading() {
  return (
    <main className="min-h-screen bg-slate-100 px-3 py-5 dark:bg-slate-950 sm:px-5">
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="mt-4 h-20 rounded-2xl bg-slate-200 dark:bg-white/10" />
        <div className="mt-4 h-[440px] rounded-[32px] bg-slate-200 dark:bg-white/10" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 rounded-2xl bg-slate-200 dark:bg-white/10" />
          ))}
        </div>
      </div>
    </main>
  );
}

function CenteredState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5 text-center dark:bg-slate-950">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-7 shadow-xl dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        <button type="button" onClick={onAction} className="mt-6 min-h-12 w-full rounded-2xl bg-emerald-600 px-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-emerald-500">
          {actionLabel}
        </button>
      </div>
    </main>
  );
}
