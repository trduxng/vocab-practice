"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Volume2, Check, X, RotateCcw, ArrowLeft, Trophy } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";

const StudentFlashcard = () => {
  const { user, loading: authLoading } = useAuth();
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionFinished, setSessionFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const data = await userService.getDueFlashcards();
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

  const handleAnswer = async (isCorrect: boolean) => {
    const currentCard = flashcards[index];
    try {
      // Submit result to backend (SRS logic in SQL)
      await userService.submitAnswer({
        questionId: currentCard.questionId,
        wordId: currentCard.wordId,
        submittedAnswer: isCorrect ? currentCard.term : "wrong", // Simple check for now
        isCorrect: isCorrect,
        scoreAwarded: isCorrect ? 1.0 : 0.0
      });

      if (index < flashcards.length - 1) {
        setFlipped(false);
        setIndex(prev => prev + 1);
      } else {
        setSessionFinished(true);
      }
    } catch (error) {
      console.error("Failed to submit answer", error);
      alert("Lỗi khi lưu kết quả học tập");
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white">Đang chuẩn bị bài học...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] text-white p-6 text-center">
        <Trophy size={64} className="text-amber-500 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">Tuyệt vời!</h2>
        <p className="text-slate-400 mb-8 text-balance">Bạn đã hoàn thành hết các từ cần học hôm nay. Hãy quay lại sau nhé!</p>
        <Button onClick={() => router.push('/user/dashboard')} className="bg-blue-600">Quay về Dashboard</Button>
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
          <Button variant="outline" onClick={() => window.location.reload()} className="border-white/10 text-white">Học tiếp</Button>
          <Button onClick={() => router.push('/user/dashboard')} className="bg-blue-600">Xong</Button>
        </div>
      </div>
    );
  }

  const card = flashcards[index];
  const progress = ((index + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-10 relative">
      <button 
        onClick={() => router.push('/user/dashboard')}
        className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Thoát
      </button>

      <div className="w-full max-w-2xl">
        {/* PROGRESS */}
        <div className="mb-12">
          <div className="flex justify-between text-xs text-slate-500 font-medium mb-3">
            <span>Tiến độ học tập</span>
            <span>{index + 1} / {flashcards.length} từ</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* FLASHCARD */}
        <div className="relative" style={{ perspective: "2000px" }}>
          <div
            onClick={() => setFlipped(!flipped)}
            className="relative w-full h-[450px] cursor-pointer transition-all duration-700 ease-in-out transform-style-3d"
            style={{
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT */}
            <div
              className="absolute inset-0 rounded-[40px] bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 flex flex-col items-center justify-center shadow-2xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-6 border border-blue-500/20">
                Từ vựng
              </span>
              <h2 className="text-white text-6xl font-black mb-4 tracking-tight text-center px-6">
                {card.term}
              </h2>
              <p className="text-slate-400 text-lg font-medium mb-10 font-mono tracking-widest">{card.phonetic}</p>

              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Volume2 size={20} className="text-blue-400" />
                <span className="text-slate-300 text-sm font-semibold">Nghe phát âm</span>
              </div>
            </div>

            {/* BACK */}
            <div
              className="absolute inset-0 rounded-[40px] bg-linear-to-br from-blue-600 to-blue-800 border border-white/20 flex flex-col items-center justify-center text-center px-10 shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <h2 className="text-white text-4xl font-bold mb-6 leading-tight">
                {card.meaning}
              </h2>
              <div className="w-12 h-1 bg-white/20 rounded-full mb-8" />
              <p className="text-blue-100 text-lg leading-relaxed max-w-md italic mb-4">
                "{card.questionText}"
              </p>
              <p className="text-blue-200/60 text-xs">Nhấn vào thẻ để xem từ vựng</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-6 mt-12">
          <button
            onClick={(e) => { e.stopPropagation(); handleAnswer(false); }}
            className="group flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all shadow-lg group-active:scale-95">
              <X size={28} strokeWidth={3} />
            </div>
            <span className="text-slate-500 text-xs font-bold group-hover:text-red-400 transition-colors uppercase tracking-widest">Quên (Lapse)</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleAnswer(true); }}
            className="group flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all shadow-lg group-active:scale-95">
              <Check size={28} strokeWidth={3} />
            </div>
            <span className="text-slate-500 text-xs font-bold group-hover:text-green-400 transition-colors uppercase tracking-widest">Nhớ (Review)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFlashcard;
