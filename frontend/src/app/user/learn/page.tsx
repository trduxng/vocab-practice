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

      if (index < flashcards.length - 1) {
        setFlipped(false);
        setIndex((prev) => prev + 1);
      } else {
        setSessionFinished(true);
      }
    } catch (error) {
      console.error("Failed to submit answer", error);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white font-mono">Đang tải bài học...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] text-white p-6 text-center">
        <Trophy size={64} className="text-amber-500 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">Tuyệt vời!</h2>
        <p className="text-slate-400 mb-8 text-balance">Bạn đã hoàn thành hết các từ cần học hôm nay. Hãy quay lại sau nhé!</p>
        <Button onClick={() => router.push("/user/dashboard")} className="bg-blue-600 rounded-xl px-8 h-12 font-bold uppercase text-[10px] tracking-widest">
          Quay về tổng quan
        </Button>
      </div>
    );
  }

  if (sessionFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] text-white p-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
          <Check size={40} className="text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Hoàn thành phiên học!</h2>
        <p className="text-slate-400 mb-8">Bạn vừa ôn tập xong {flashcards.length} từ vựng.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()} className="border-white/10 text-white h-12 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest">
            Học tiếp
          </Button>
          <Button onClick={() => router.push("/user/dashboard")} className="bg-blue-600 h-12 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest">
            Xong
          </Button>
        </div>
      </div>
    );
  }

  const card = flashcards[index];
  const progress = ((index + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-10 relative">
      <button
        onClick={() => router.push("/user/dashboard")}
        className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]"
      >
        <ArrowLeft size={16} /> Thoát
      </button>

      <div className="w-full max-w-2xl">
        <div className="mb-12">
          <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3">
            <span>Tiến độ học tập</span>
            <span>{index + 1} / {flashcards.length} từ</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
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
              <div className="absolute inset-0 rounded-[48px] bg-linear-to-br from-[#1a2333] to-[#0d1526] border border-white/10 flex flex-col items-center justify-center shadow-2xl" style={{ backfaceVisibility: "hidden" }}>
                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-blue-500/20">
                  Từ vựng
                </span>
                <h2 className="text-white text-7xl font-black mb-4 tracking-tighter text-center px-6">{card.term}</h2>
                <p className="text-slate-500 text-xl font-bold mb-12 font-mono tracking-widest">{card.phonetic}</p>

                <div
                  onClick={(event) => {
                    event.stopPropagation();
                    speak(card.term);
                  }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <Volume2 size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300 text-xs font-black uppercase tracking-widest">Nghe phát âm</span>
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
