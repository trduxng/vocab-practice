"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Trophy, Volume2, X } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import ReportDialog from "@/src/components/shared/ReportDialog";

type Flashcard = {
  questionId?: number;
  questionText?: string;
  correctAnswer?: string;
  wordId: number;
  term: string;
  phonetic?: string;
  meaning: string;
};

const StudentFlashcard = () => {
  const { user, loading: authLoading } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState<{
    correctCount: number;
    wrongCount: number;
    totalAttempts: number;
  }>({ correctCount: 0, wrongCount: 0, totalAttempts: 0 });
  const [sessionSummary, setSessionSummary] = useState<{
    totalAttempts: number;
    correctCount: number;
    wrongCount: number;
    accuracy: number;
    xpEarned: number;
    totalXP: number;
    currentLevel: number;
    weakWords: Array<{ wordId: number; term: string; meaning: string; wrongCount: number }>;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const router = useRouter();

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const topicId = searchParams.get("topicId") || undefined;
        const mode = searchParams.get("mode") || undefined;
        const data = await userService.getDueFlashcards({ topicId, mode });
        setFlashcards(data);
      } catch (error) {
        console.error("Failed to fetch flashcards", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFlashcards();
    }
  }, [user]);

  useEffect(() => {
    if (flipped && flashcards[index]) {
      speak(flashcards[index].term);
    }
  }, [flipped, index, flashcards]);

  const handleAnswer = async (isCorrect: boolean) => {
    const currentCard = flashcards[index];
    if (!currentCard) return;

    try {
      await userService.submitAnswer({
        questionId: currentCard.questionId || undefined,
        wordId: currentCard.wordId,
        submittedAnswer: isCorrect ? (currentCard.correctAnswer || currentCard.term) : "wrong",
        isCorrect,
        scoreAwarded: isCorrect ? 1.0 : 0.0,
      });

      setSessionResults((prev) => ({
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
        totalAttempts: prev.totalAttempts + 1,
      }));

      if (index < flashcards.length - 1) {
        setFlipped(false);
        setIndex((prev) => prev + 1);
      } else {
        setSessionFinished(true);
        // Fetch session summary
        setSummaryLoading(true);
        userService.getSessionSummary().then(setSessionSummary).finally(() => setSummaryLoading(false));
      }
    } catch (error) {
      console.error("Failed to submit answer", error);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-mono">Đang tải bài học...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-6 text-center">
        <Trophy size={64} className="text-amber-500 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">Tuyệt vời!</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Bạn đã hoàn thành hết các từ cần học hôm nay. Hãy quay lại sau nhé!</p>
        <Button onClick={() => router.push("/user/dashboard")} className="bg-blue-600 rounded-xl px-8 h-12 font-bold uppercase text-[10px] tracking-widest">
          Quay về tổng quan
        </Button>
      </div>
    );
  }

  if (sessionFinished) {
    const summary = sessionSummary;
    const accuracy = summary?.accuracy ?? (sessionResults.totalAttempts > 0
      ? Math.round((sessionResults.correctCount / sessionResults.totalAttempts) * 100)
      : 0);
    const totalXP = summary?.totalXP ?? 0;
    const currentLevel = summary?.currentLevel ?? 1;
    const xpEarned = summary?.xpEarned ?? 0;
    const weakWords = summary?.weakWords ?? [];

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-10 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <Check size={40} className="text-green-400" />
            </div>

            <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Hoàn thành phiên học!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Bạn vừa ôn tập {sessionResults.totalAttempts} từ vựng. Hãy duy trì đều đặn mỗi ngày nhé!
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-500/5 dark:bg-blue-500/5 bg-slate-50 rounded-2xl p-4 border border-blue-500/10">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Độ chính xác</p>
                <p className={`text-2xl font-black ${accuracy >= 80 ? 'text-green-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {accuracy}%
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/3 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Đúng/Sai</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  <span className="text-green-400">{sessionResults.correctCount}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-red-400">{sessionResults.wrongCount}</span>
                </p>
              </div>
              <div className="bg-amber-500/5 dark:bg-amber-500/5 bg-amber-50/50 rounded-2xl p-4 border border-amber-500/10">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">XP nhận được</p>
                <p className="text-2xl font-black text-amber-400">+{xpEarned}</p>
              </div>
            </div>

            {/* Level & XP bar */}
            <div className="bg-slate-50 dark:bg-white/3 rounded-2xl p-5 border border-slate-200 dark:border-white/5 mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cấp độ {currentLevel}</span>
                <span className="text-xs font-black text-slate-500 dark:text-slate-400">{totalXP} XP</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full bg-linear-to-r from-amber-500 to-orange-400 transition-all duration-1000"
                  style={{ width: `${(totalXP % 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-2 font-medium">
                {100 - (totalXP % 100)} XP đến cấp tiếp theo
              </p>
            </div>

            {/* Weak words */}
            {weakWords.length > 0 && (
              <div className="bg-red-500/5 dark:bg-red-500/5 bg-red-50/50 rounded-2xl p-5 border border-red-500/10 mb-6 text-left">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-3">
                  Từ cần ôn lại ({weakWords.length})
                </p>
                <div className="space-y-2">
                  {weakWords.slice(0, 5).map((w) => (
                    <div key={w.wordId} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{w.term}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{w.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest"
              >
                Học tiếp
              </Button>
              <Button
                onClick={() => router.push("/user/dashboard")}
                className="flex-1 bg-blue-600 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest"
              >
                Xong
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const card = flashcards[index];
  const progress = ((index + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-10 relative">
      <button
        onClick={() => router.push("/user/dashboard")}
        className="absolute top-8 left-8 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]"
      >
        <ArrowLeft size={16} /> Thoát
      </button>

      <div className="w-full max-w-2xl">
        <div className="mb-12">
          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest mb-3">
            <span>Tiến độ học tập</span>
            <span>{index + 1} / {flashcards.length} từ</span>
          </div>
          <div className="w-full h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5 p-[1px]">
            <div className="h-full bg-linear-to-r from-blue-600 to-cyan-400 transition-all duration-500 shadow-glow" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {card && (
          <div className="relative" style={{ perspective: "2000px" }}>
            <div className="mb-4 flex justify-end">
              <ReportDialog
                wordId={card.wordId}
                questionId={card.questionId}
                entityType="Word"
                defaultType="WordIncorrect"
                title={`Report word: ${card.term}`}
                context={card.meaning}
              />
            </div>
            <div
              onClick={() => setFlipped(!flipped)}
              className="relative w-full h-[480px] cursor-pointer transition-all duration-700 ease-in-out"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div className="absolute inset-0 rounded-[48px] bg-linear-to-br from-sky-50 to-white dark:from-[#1a2333] dark:to-[#0d1526] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center shadow-2xl" style={{ backfaceVisibility: "hidden" }}>
                <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-blue-200 dark:border-blue-500/20">
                  Từ vựng
                </span>
                <h2 className="text-slate-900 dark:text-white text-7xl font-black mb-4 tracking-tighter text-center px-6">{card.term}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-xl font-bold mb-12 font-mono tracking-widest">{card.phonetic}</p>

                <div
                  onClick={(event) => {
                    event.stopPropagation();
                    speak(card.term);
                  }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 transition-all group"
                >
                  <Volume2 size={20} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest">Nghe phát âm</span>
                </div>
              </div>

              <div
                className="absolute inset-0 rounded-[48px] bg-linear-to-br from-blue-700 to-indigo-900 border border-white/20 flex flex-col items-center justify-center text-center px-12 shadow-2xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <h2 className="text-white text-5xl font-black mb-8 leading-tight tracking-tighter">{card.meaning}</h2>
                <div className="w-16 h-1.5 bg-white/20 rounded-full mb-10" />
                <p className="text-blue-100 text-xl leading-relaxed max-w-md font-medium italic mb-10">&quot;{card.questionText}&quot;</p>
                <p className="text-blue-300/40 text-[10px] font-black uppercase tracking-widest">Bấm để xem lại từ</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mt-16">
          <button onClick={(event) => { event.stopPropagation(); handleAnswer(false); }} disabled={!flipped} className="group flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-[32px] bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-xl group-active:scale-90 group-disabled:opacity-40 group-disabled:grayscale group-disabled:hover:bg-red-500/10 group-disabled:hover:text-red-500">
              <X size={32} strokeWidth={3} />
            </div>
            <span className="text-slate-600 text-[10px] font-black group-hover:text-red-500 transition-colors uppercase tracking-[0.2em]">Chưa nhớ</span>
          </button>

          <button onClick={(event) => { event.stopPropagation(); handleAnswer(true); }} disabled={!flipped} className="group flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-[32px] bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all shadow-xl group-active:scale-90 group-disabled:opacity-40 group-disabled:grayscale group-disabled:hover:bg-green-500/10 group-disabled:hover:text-green-500">
              <Check size={32} strokeWidth={3} />
            </div>
            <span className="text-slate-600 text-[10px] font-black group-hover:text-green-500 transition-colors uppercase tracking-[0.2em]">Đã nhớ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFlashcard;
