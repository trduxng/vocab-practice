"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Brain, CheckCircle2, ChevronRight, Timer } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { toast } from "sonner";
import ReportDialog from "@/src/components/shared/ReportDialog";
import GamificationCelebration from "@/src/components/user/gamification/GamificationCelebration";
import type { GamificationReward } from "@/src/modules/user/types";

type TestQuestion = {
  questionId: number;
  wordId?: number;
  questionText: string;
  questionType?: string;
  optionsJson?: string;
  correctAnswer: string;
  term?: string;
  meaning?: string;
};

type AnswerResult = {
  questionId?: number;
  wordId?: number;
  isCorrect: boolean;
};

const TEST_SECONDS = 600;

const MiniTestExecutionPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultData, setResultData] = useState<{
    total: number;
    correct: number;
    score: number;
    xpEarned?: number;
    gamification?: GamificationReward;
    results: AnswerResult[];
  } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_SECONDS);

  useEffect(() => {
    if (!user || !params.id) return;
    let cancelled = false;

    userService.getMiniTestDetails(params.id as string)
      .then((data) => {
        if (cancelled) return;
        setQuestions(data);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to fetch test details", error);
        toast.error("Không thể tải bài kiểm tra");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, params.id]);

  const getResults = useCallback(() => {
    return questions.map((q) => {
      const userAnswer = (answers[q.questionId] || "").toLowerCase().trim();
      const correct = q.correctAnswer.toLowerCase().trim();
      return userAnswer === correct;
    });
  }, [questions, answers]);

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);

    try {
      const submittedAnswers = questions.map((q) => {
        const userAnswer = answers[q.questionId] || "";
        const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        return {
          questionId: q.questionId,
          wordId: q.wordId || 0,
          submittedAnswer: userAnswer,
          isCorrect,
        };
      });

      const result = await userService.submitMiniTest(params.id as string, submittedAnswers);
      setResultData(result);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting test results", error);
      toast.error("Không thể nộp bài. Vui lòng thử lại.");
      setSubmitting(false);
    }
  }, [answers, questions, submitted, submitting, params.id]);

  useEffect(() => {
    if (submitted || loading || questions.length === 0 || submitting) return;
    if (timeLeft <= 0) {
      void Promise.resolve().then(() => handleSubmit());
      return;
    }

    const timer = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, loading, questions.length, handleSubmit, submitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const options = useMemo(() => {
    if (!currentQuestion?.optionsJson) return [];
    try {
      const parsed = JSON.parse(currentQuestion.optionsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [currentQuestion]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-mono uppercase tracking-widest">Đang xác thực...</div>;
  }

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono uppercase tracking-widest">Đang chuẩn bị bài kiểm tra...</p>
      </div>
    );
  }

  // ==================== NO QUESTIONS ====================
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-6 text-center">
        <AlertCircle size={56} className="mb-4 text-slate-500 dark:text-slate-600" />
        <h1 className="text-2xl font-black mb-2">Bài kiểm tra chưa có câu hỏi</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Vui lòng chọn bài khác hoặc quay lại sau.</p>
        <Button onClick={() => router.push("/user/minitests")} className="bg-blue-600">Quay lại danh sách</Button>
      </div>
    );
  }

  // ==================== SUBMITTED - RESULT ====================
  if (submitted && !showReview) {
    const score = resultData?.total ?? questions.length;
    const correct = resultData?.correct ?? 0;
    const accuracy = resultData?.score != null ? Math.round(resultData.score) : Math.round((correct / score) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-4">
        <GamificationCelebration reward={resultData?.gamification} />
        <Card className="w-full max-w-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 p-12 text-center rounded-[40px] shadow-sm">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border-2 ${accuracy >= 70 ? "bg-green-500/20 border-green-500/30" : accuracy >= 40 ? "bg-amber-500/20 border-amber-500/30" : "bg-red-500/20 border-red-500/30"}`}>
            {accuracy >= 70 ? (
              <CheckCircle2 size={48} className="text-green-400" />
            ) : (
              <Brain size={48} className="text-amber-400" />
            )}
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Hoàn thành!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Kết quả của bạn đã được ghi nhận và lưu vào lịch sử.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            <div className="dark:bg-white/3 bg-slate-50 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Đúng</p>
              <p className="text-3xl font-black text-green-400">{correct}/{score}</p>
            </div>
            <div className="dark:bg-white/3 bg-slate-50 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Chính xác</p>
              <p className={`text-3xl font-black ${accuracy >= 70 ? "text-green-400" : accuracy >= 40 ? "text-amber-400" : "text-red-400"}`}>{accuracy}%</p>
            </div>
            <div className="dark:bg-white/3 bg-slate-50 p-6 rounded-3xl border border-slate-200 dark:border-white/5">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Sai</p>
              <p className="text-3xl font-black text-red-400">{score - correct}</p>
            </div>
            <div className="dark:bg-white/3 bg-amber-50/50 p-6 rounded-3xl border border-amber-200 dark:border-amber-500/10">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">XP</p>
              <p className="text-3xl font-black text-amber-500">+{resultData?.xpEarned || 0}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => setShowReview(true)}
              className="flex-1 py-6 bg-white dark:bg-white text-slate-900 hover:bg-blue-600 hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-transparent transition-all"
            >
              Xem lại kết quả <ChevronRight size={14} />
            </Button>
            <Button
              onClick={() => router.push("/user/minitests")}
              className="flex-1 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg"
            >
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ==================== SUBMITTED - REVIEW RESULTS ====================
  if (submitted && showReview) {
    const isCorrects = getResults();

    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
        <header className="h-16 bg-white/80 dark:bg-black/40 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowReview(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">Xem lại kết quả</h1>
          </div>
          <Button
            onClick={() => router.push("/user/minitests")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-xl"
          >
            Hoàn tất
          </Button>
        </header>

        <main className="max-w-3xl mx-auto p-6 space-y-4 py-8">
          {questions.map((q, i) => {
            const correct = isCorrects[i];
            const userAnswer = (answers[q.questionId] || "").trim();

            return (
              <div
                key={q.questionId}
                className={`rounded-3xl border-2 p-6 transition-all ${
                  correct
                    ? "bg-green-500/5 dark:bg-green-500/5 bg-green-50 border-green-500/10"
                    : "bg-red-500/5 dark:bg-red-500/5 bg-red-50 border-red-500/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      correct ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      correct ? "bg-green-500 text-black" : "bg-red-500 text-white"
                    }`}>
                      {correct ? "Đúng" : "Sai"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{q.questionType || "Câu hỏi"}</span>
                </div>

                <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-4">{q.questionText}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Bạn đã trả lời</p>
                    <p className={`font-bold ${correct ? "text-green-500" : "text-red-500"}`}>
                      {userAnswer || "(Bỏ trống)"}
                    </p>
                  </div>
                  {!correct && (
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">Đáp án đúng</p>
                      <p className="text-slate-900 dark:text-white font-bold">{q.correctAnswer}</p>
                    </div>
                  )}
                </div>

                {q.term && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Brain size={14} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      <span className="text-slate-900 dark:text-white font-bold">{q.term}</span>
                      {q.meaning ? `: ${q.meaning}` : ""}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <Button
            onClick={() => router.push("/user/minitests")}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-3xl text-sm mt-6"
          >
            Quay lại danh sách
          </Button>
        </main>
      </div>
    );
  }

  // ==================== ACTIVE TEST ====================
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      <header className="h-20 bg-black/40 dark:bg-black/40 bg-white/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-[0.2em]">Phiên làm bài</h1>
            <p className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Câu {currentIndex + 1} / {questions.length}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all ${timeLeft < 60 ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-white/5 border-white/10 text-blue-400"}`}>
          <Timer size={18} />
          <span className="font-mono font-black text-xl">{formatTime(timeLeft)}</span>
        </div>
        <Button onClick={handleSubmit} disabled={submitting} className="bg-white text-black hover:bg-blue-600 hover:text-white font-black text-[10px] uppercase tracking-widest px-8 h-12 rounded-xl transition-all disabled:opacity-40">
          {submitting ? "Đang nộp..." : "Nộp bài"}
        </Button>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-10 py-16">
        {/* Progress dots */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-6">
          {questions.map((question, qIndex) => {
            return (
              <div
                key={question.questionId}
                className={`w-3 h-3 rounded-full border-2 transition-all cursor-pointer hover:scale-125 ${
                  qIndex === currentIndex
                    ? "bg-blue-500 border-blue-400 scale-125 shadow-glow"
                    : answers[question.questionId]
                      ? "bg-slate-600 border-slate-700"
                      : "bg-white/5 border-white/10"
                }`}
                onClick={() => setCurrentIndex(qIndex)}
              />
            );
          })}
        </div>

        <Card className="dark:bg-white/3 bg-white border border-slate-200 dark:border-white/10 p-12 rounded-[48px] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-glow" />
          {currentQuestion && (
            <div className="absolute right-5 top-5">
              <ReportDialog
                wordId={currentQuestion.wordId}
                questionId={currentQuestion.questionId}
                entityType="Question"
                defaultType="AnswerIncorrect"
                title={`Báo cáo câu hỏi kiểm tra #${currentQuestion.questionId}`}
                context={currentQuestion.term || currentQuestion.questionText}
              />
            </div>
          )}
          <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight mb-6 tracking-tighter">{currentQuestion?.questionText}</h2>
          {currentQuestion?.term && <p className="text-slate-600 dark:text-slate-400 italic text-sm font-medium">Ngữ cảnh: liên quan đến từ &quot;{currentQuestion.term}&quot;</p>}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {options.map((option: string, optionIndex: number) => (
            <button
              key={`${option}-${optionIndex}`}
              onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.questionId]: option }))}
              className={`group p-8 rounded-[32px] border-2 text-left transition-all relative ${
                answers[currentQuestion.questionId] === option
                  ? "bg-blue-600/10 border-blue-500 text-white shadow-2xl scale-[1.02]"
                  : "dark:bg-white/2 bg-white border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:dark:bg-white/5 hover:bg-slate-100 hover:border-slate-300 dark:hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-5">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 ${
                  answers[currentQuestion.questionId] === option
                    ? "bg-blue-500 border-blue-400 text-white"
                    : "dark:bg-white/5 bg-slate-100 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-600"
                }`}>
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="font-bold text-xl">{option}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-16">
          <Button
            variant="ghost"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold uppercase text-[10px] tracking-widest h-14 px-8 rounded-2xl"
          >
            Quay lại
          </Button>
          <Button
            onClick={() => {
              if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
              else handleSubmit();
            }}
            className="bg-white text-black hover:bg-blue-600 hover:text-white px-12 h-16 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-sm border border-slate-200 transition-all"
          >
            {currentIndex < questions.length - 1 ? "Tiếp theo" : "Hoàn thành bài thi"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MiniTestExecutionPage;
