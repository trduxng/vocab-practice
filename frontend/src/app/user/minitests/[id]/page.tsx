"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Brain, CheckCircle2, ChevronRight, ChevronLeft, Info, Timer, Volume2, XCircle, HelpCircle } from "lucide-react";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { QuestionRenderer } from "@/src/components/user/practice/QuestionRenderer";
import { toast } from "sonner";
import ReportDialog from "@/src/components/shared/ReportDialog";
import GamificationCelebration from "@/src/components/user/gamification/GamificationCelebration";
import type { GamificationReward } from "@/src/modules/user/types";
import { gradeQuestion, parseOptions } from "@/src/lib/question-utils";

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
    attemptNumber?: number;
  } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_SECONDS);
  const [attemptInfo, setAttemptInfo] = useState<{ attemptCount: number; bestScore: number } | null>(null);

  useEffect(() => {
    if (!user || !params.id) return;
    let cancelled = false;

    Promise.all([
      userService.getMiniTestDetails(params.id as string),
      userService.getMyMiniTestAttempts(params.id as string),
    ])
      .then(([questions, attempts]) => {
        if (cancelled) return;
        setQuestions(questions);
        setAttemptInfo(attempts);
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
      return gradeQuestion(q.questionType, answers[q.questionId] || "", q.correctAnswer);
    });
  }, [questions, answers]);

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);

    try {
      const submittedAnswers = questions.map((q) => {
        const userAnswer = answers[q.questionId] || "";
        const isCorrect = gradeQuestion(q.questionType, userAnswer, q.correctAnswer);
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

  const handleSubmitWithConfirm = useCallback(() => {
    if (submitted || submitting) return;
    if (window.confirm("Bạn đã hoàn thành? Bài làm sẽ được nộp và không thể chỉnh sửa.")) {
      void handleSubmit();
    }
  }, [submitted, submitting, handleSubmit]);

  useEffect(() => {
    if (submitted || loading || questions.length === 0 || submitting) return;
    if (timeLeft <= 0) {
      void Promise.resolve().then(() => handleSubmit());
      return;
    }

    const timer = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, loading, questions.length, handleSubmit, submitting]);

  const confirmLeave = useCallback(() => {
    if (submitted) return true;
    return window.confirm("Bạn có chắc muốn rời khỏi bài kiểm tra? Tiến trình sẽ bị mất.");
  }, [submitted]);

  const handleBack = useCallback(() => {
    if (confirmLeave()) router.back();
  }, [confirmLeave, router]);

  // ── Navigation guard ──
  useEffect(() => {
    if (submitted) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      if (confirmLeave()) router.push(url.pathname + url.search + url.hash);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [submitted, confirmLeave, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const options = useMemo(() => {
    return parseOptions(currentQuestion?.optionsJson);
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
    const accuracy = resultData?.score ?? Math.round((correct / score) * 100);
    const wrong = score - correct;
    const gaugeCircumference = 2 * Math.PI * 70;
    const gaugeOffset = gaugeCircumference * (1 - accuracy / 100);
    const gradeColor = accuracy >= 80 ? "text-green-500" : accuracy >= 60 ? "text-amber-500" : accuracy >= 40 ? "text-orange-500" : "text-red-500";
    const gradeBg = accuracy >= 80 ? "border-green-500/30 bg-green-500/10" : accuracy >= 60 ? "border-amber-500/30 bg-amber-500/10" : accuracy >= 40 ? "border-orange-500/30 bg-orange-500/10" : "border-red-500/30 bg-red-500/10";
    const gradeLabel = accuracy >= 80 ? "Tuyệt vời" : accuracy >= 60 ? "Khá tốt" : accuracy >= 40 ? "Cần cố gắng" : "Yếu";

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-4">
        <GamificationCelebration reward={resultData?.gamification} />
        <Card className="w-full max-w-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 p-8 sm:p-12 text-center rounded-[40px] shadow-sm">
          {/* Score gauge */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10"
                className="text-slate-100 dark:text-white/5" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="10"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={gaugeOffset}
                strokeLinecap="round"
                className={`${accuracy >= 80 ? "text-green-500" : accuracy >= 60 ? "text-amber-500" : accuracy >= 40 ? "text-orange-500" : "text-red-500"} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black ${gradeColor}`}>{accuracy}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mt-1">%</span>
            </div>
          </div>

          <h1 className="text-4xl font-black mb-1">{gradeLabel}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium">Kết quả đã được lưu vào lịch sử.</p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <div className="bg-green-500/5 dark:bg-green-500/5 border border-green-500/10 p-5 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1.5">Đúng</p>
              <p className="text-2xl font-black text-green-500">{correct}</p>
            </div>
            <div className="bg-red-500/5 dark:bg-red-500/5 border border-red-500/10 p-5 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1.5">Sai</p>
              <p className="text-2xl font-black text-red-500">{wrong}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-5 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1.5">Tổng</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{score}</p>
            </div>
            <div className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1.5">XP</p>
              <p className="text-2xl font-black text-amber-500">+{resultData?.xpEarned || 0}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowReview(true)}
              className="flex-1 py-5 bg-white dark:bg-white/10 text-slate-900 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-white/10 transition-all gap-2"
            >
              <Brain size={16} />
              Xem lại kết quả
            </Button>
            <Button
              onClick={() => router.push("/user/minitests")}
              className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg gap-2"
            >
              <ArrowLeft size={16} />
              Danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ==================== SUBMITTED - REVIEW RESULTS ====================
  if (submitted && showReview) {
    const isCorrects = getResults();
    const correctCount = isCorrects.filter(Boolean).length;
    const wrongCount = isCorrects.length - correctCount;

    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
        <header className="bg-white/80 dark:bg-black/60 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowReview(false)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">Xem lại kết quả</h1>
                <p className="text-slate-500 dark:text-slate-400 text-[9px] font-bold tracking-widest uppercase">{correctCount} đúng / {wrongCount} sai</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/user/minitests")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest px-5 h-9 rounded-xl"
            >
              Hoàn tất
            </Button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto p-6 space-y-3 py-8">
          {questions.map((q, i) => {
            const correct = isCorrects[i];
            const userAnswer = (answers[q.questionId] || "").trim();

            return (
              <div
                key={q.questionId}
                className={`rounded-2xl border p-5 transition-all ${
                  correct
                    ? "bg-green-500/[0.03] dark:bg-green-500/[0.03] border-green-500/15"
                    : "bg-red-500/[0.03] dark:bg-red-500/[0.03] border-red-500/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${
                      correct ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-red-500/15 text-red-600 dark:text-red-400"
                    }`}>
                      {i + 1}
                    </span>
                    {correct ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${correct ? "text-green-500" : "text-red-500"}`}>
                      {correct ? "Đúng" : "Sai"}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5">
                    {q.questionType === "MCQ" ? "Trắc nghiệm"
                      : q.questionType === "FillBlank" ? "Điền từ"
                      : q.questionType === "Dictation" ? "Nghe chép"
                      : q.questionType === "DragDrop" ? "Sắp xếp"
                      : q.questionType || "Câu hỏi"}
                  </span>
                </div>

                <h4 className="text-slate-900 dark:text-white font-bold text-base mb-3 leading-snug">{q.questionText}</h4>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest shrink-0 w-20">Bạn trả lời</span>
                    <span className={`font-bold ${correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {userAnswer || <span className="italic text-slate-400 font-normal">(Bỏ trống)</span>}
                    </span>
                  </div>
                  {!correct && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest shrink-0 w-20">Đáp án</span>
                      <span className="font-bold text-slate-900 dark:text-white">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>

                {q.term && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-2.5">
                    <Brain size={13} className="text-blue-400 shrink-0" />
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
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl text-sm mt-4 gap-2"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách
          </Button>
        </main>
      </div>
    );
  }

  // ==================== ACTIVE TEST ====================
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const timerPercent = (timeLeft / TEST_SECONDS) * 100;
  const timerColor = timeLeft < 60 ? "text-red-500" : timeLeft < 120 ? "text-amber-500" : "text-blue-500";
  const timerBorderColor = timeLeft < 60 ? "border-red-500/30" : timeLeft < 120 ? "border-amber-500/30" : "border-white/10";

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Top bar */}
      <header className="bg-white/80 dark:bg-black/60 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">
                <span>Tiến độ</span>
                <span>{answeredCount}/{questions.length} đã trả lời</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all ${timerBorderColor}`}>
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="absolute inset-0 w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-200 dark:text-white/10" />
                  <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 13}`}
                    strokeDashoffset={`${2 * Math.PI * 13 * (1 - timerPercent / 100)}`}
                    className={`${timerColor} transition-all duration-1000`}
                    strokeLinecap="round"
                  />
                </svg>
                <Timer size={14} className={`relative ${timerColor}`} />
              </div>
              <span className={`font-mono font-black text-lg ${timeLeft < 60 ? "text-red-500 animate-pulse" : timeLeft < 120 ? "text-amber-500" : "text-slate-900 dark:text-white"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <Button
              onClick={handleSubmitWithConfirm}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest px-5 h-9 rounded-xl shadow-lg transition-all disabled:opacity-40"
            >
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6 py-10">
        {/* Attempt info banner */}
        {attemptInfo && attemptInfo.attemptCount > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm">
            <Info size={16} className="shrink-0" />
            <span className="font-medium">
              Bạn đã làm bài này <strong>{attemptInfo.attemptCount} lần</strong>.
              Điểm cao nhất: <strong>{attemptInfo.bestScore}%</strong>
            </span>
          </div>
        )}

        {/* Question dots navigator */}
        <div className="flex items-center gap-3 justify-center">
          {questions.map((question, qIndex) => {
            const isAnswered = !!answers[question.questionId];
            return (
              <button
                key={question.questionId}
                onClick={() => setCurrentIndex(qIndex)}
                className={`group relative flex items-center gap-2 transition-all ${
                  qIndex === currentIndex
                    ? "scale-110"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all ${
                  qIndex === currentIndex
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                    : isAnswered
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-500"
                }`}>
                  {isAnswered ? <CheckCircle2 size={14} /> : qIndex + 1}
                </span>
                {qIndex < questions.length - 1 && (
                  <span className={`w-6 h-px hidden sm:block ${
                    qIndex < currentIndex ? "bg-blue-500" : "bg-slate-200 dark:bg-white/10"
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Question card */}
        <Card className="dark:bg-white/5 bg-white border border-slate-200 dark:border-white/10 p-8 sm:p-12 rounded-[40px] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-600 to-cyan-400 shadow-lg" />

          {currentQuestion && (
            <div className="flex items-center justify-between mb-6 gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <HelpCircle size={12} />
                {currentQuestion?.questionType === "MCQ" ? "Trắc nghiệm"
                  : currentQuestion?.questionType === "FillBlank" ? "Điền từ"
                  : currentQuestion?.questionType === "Dictation" ? "Nghe và chép"
                  : currentQuestion?.questionType === "DragDrop" ? "Sắp xếp"
                  : "Câu hỏi"}
              </span>
              <div className="flex items-center gap-2">
                {currentQuestion?.questionType === "Dictation" && (
                  <button
                    type="button"
                    onClick={() => {
                      const text = currentQuestion.correctAnswer;
                      if (typeof window !== "undefined" && window.speechSynthesis && text) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = "en-US";
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 transition-all"
                    aria-label="Phát âm thanh chính tả"
                  >
                    <Volume2 size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Nghe</span>
                  </button>
                )}
                <ReportDialog
                  wordId={currentQuestion.wordId}
                  questionId={currentQuestion.questionId}
                  entityType="Question"
                  defaultType="AnswerIncorrect"
                  title={`Report test question #${currentQuestion.questionId}`}
                  context={currentQuestion.term || currentQuestion.questionText}
                />
              </div>
            </div>
          )}

          <h2 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-tighter">
            {currentQuestion?.questionText}
          </h2>
          {currentQuestion?.term && currentQuestion.term !== currentQuestion.correctAnswer && (
            <p className="mt-4 text-slate-500 dark:text-slate-400 italic text-sm font-medium flex items-center gap-2">
              <Brain size={14} className="shrink-0" />
              Ngữ cảnh: liên quan đến từ &quot;{currentQuestion.term}&quot;
            </p>
          )}
        </Card>

        {/* Answer area */}
        <div className="py-2">
          <QuestionRenderer
            questionType={currentQuestion?.questionType}
            options={options}
            value={answers[currentQuestion.questionId] || ""}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [currentQuestion.questionId]: val }))}
            correctAnswer={currentQuestion?.correctAnswer}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="ghost"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold uppercase text-[10px] tracking-widest h-12 px-6 rounded-2xl gap-2"
          >
            <ChevronLeft size={16} />
            Quay lại
          </Button>

          <Button
            onClick={() => {
              if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
              else handleSubmitWithConfirm();
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-[0.15em] shadow-lg shadow-blue-500/20 transition-all gap-2"
          >
            {currentIndex < questions.length - 1 ? (
              <>Tiếp theo <ChevronRight size={16} /></>
            ) : (
              <><CheckCircle2 size={16} /> Hoàn thành</>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MiniTestExecutionPage;
