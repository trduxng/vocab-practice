"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, Clock, GripVertical, RefreshCw, Volume2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card } from "@/src/components/ui/card";
import ReportDialog from "@/src/components/shared/ReportDialog";
import GamificationCelebration from "@/src/components/user/gamification/GamificationCelebration";
import LevelProgressBar from "@/src/components/user/gamification/LevelProgressBar";
import type { GamificationReward } from "@/src/modules/user/types";

const QUESTION_TIME = 20;
const SMART_QUESTION_TIME = 45; // Smart mode: more time for deep recall

type PracticeMode = "normal" | "smart" | null;

type PracticeQuestion = {
  questionId?: number;
  wordId: number;
  questionType?: "MCQ" | "Dictation" | "DragDrop" | "FillBlank" | string;
  questionText?: string;
  optionsJson?: string;
  correctAnswer?: string;
  term?: string;
  meaning?: string;
};

type SmartQuestion = PracticeQuestion & {
  masteryLevel?: number;
  memoryStatus?: string;
  consecutiveWrong?: number;
  repetitionCount?: number;
  nextReviewDate?: string;
  lastReviewedAt?: string;
  priorityScore?: number;
};

const shuffle = <T,>(items: T[]) => {
  const nextItems = [...items];
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = (index * 7 + 3) % (index + 1);
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }
  return nextItems;
};

export default function UserPractice() {
  const { loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<(PracticeQuestion | SmartQuestion)[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);
  const [loading, setLoading] = useState(false);
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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
  const [practiceReward, setPracticeReward] = useState<GamificationReward | null>(null);
  const [finalizeAttempted, setFinalizeAttempted] = useState(false);
  const practiceSessionKey = useRef("");
  const autoStarted = useRef(false);
  const router = useRouter();

  const fetchQuestions = useCallback(async (mode: PracticeMode) => {
    if (!mode) return;
    setLoading(true);
    try {
      if (mode === "smart") {
        const smartQueue = await userService.getSmartReviewQueue(15);
        // Preserve all SRS fields — questionId is omitted so backend uses submitWordReview path
        const mapped = smartQueue.map((item: Record<string, unknown>) => ({
          wordId: item.wordId as number,
          questionType: "FillBlank",
          questionText: item.meaning as string,
          correctAnswer: item.term as string,
          term: item.term as string,
          meaning: item.meaning as string,
          masteryLevel: item.masteryLevel as number,
          memoryStatus: item.memoryStatus as string,
          consecutiveWrong: item.consecutiveWrong as number,
          repetitionCount: item.repetitionCount as number,
          nextReviewDate: item.nextReviewDate as string,
          lastReviewedAt: item.lastReviewedAt as string,
          priorityScore: item.priorityScore as number,
        } as SmartQuestion));
        setQuestions(shuffle(mapped));
      } else {
        const searchParams = new URLSearchParams(window.location.search);
        const topicId = searchParams.get("topicId") || undefined;
        const mode = searchParams.get("mode") || undefined;
        const data = await userService.getDueFlashcards({ topicId, mode });
        setQuestions(shuffle(data));
      }
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleModeSelect = useCallback((mode: PracticeMode) => {
    if (!mode) return;
    if (!practiceSessionKey.current) {
      practiceSessionKey.current = window.crypto.randomUUID();
    }
    setPracticeMode(mode);
    fetchQuestions(mode);
  }, [fetchQuestions]);

  useEffect(() => {
    if (authLoading || autoStarted.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const requestedMode = searchParams.get("mode");
    const topicId = searchParams.get("topicId");
    const mode = requestedMode === "smart" ? "smart" : topicId || requestedMode === "normal" ? "normal" : null;

    if (mode) {
      autoStarted.current = true;
      void Promise.resolve().then(() => handleModeSelect(mode));
    }
  }, [authLoading, handleModeSelect]);

  const current = questions[index];
  const expectedAnswer = String(current?.correctAnswer || current?.term || "");

  const mcqOptions = useMemo(() => {
    if (!current?.optionsJson || current.questionType !== "MCQ") return [];
    try {
      const parsed = JSON.parse(current.optionsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [current]);

  const dragItems = useMemo(() => {
    if (!current || current.questionType !== "DragDrop") return [];
    try {
      const parsed = JSON.parse(current.optionsJson || "{}");
      if (Array.isArray(parsed.items)) return parsed.items;
    } catch {
      // Use fallback below.
    }
    return shuffle(expectedAnswer.split(/\s+/).filter(Boolean));
  }, [current, expectedAnswer]);

  const resetQuestionState = useCallback((items: string[] = []) => {
    setSelected("");
    setChecked(false);
    setTimeLeft(practiceMode === "smart" ? SMART_QUESTION_TIME : QUESTION_TIME);
    setOrderedItems(items);
    setDraggedIndex(null);
  }, [practiceMode]);

  useEffect(() => {
    if (current?.questionType === "DragDrop") {
      void Promise.resolve().then(() => resetQuestionState(dragItems));
    } else {
      void Promise.resolve().then(() => resetQuestionState());
    }
  }, [current?.questionId, current?.questionType, dragItems, resetQuestionState]);

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const submittedAnswer = current?.questionType === "DragDrop" ? orderedItems.join(" ") : selected;
  const isCorrect = current?.questionType === "MCQ"
    ? selected === expectedAnswer
    : submittedAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();

  const handleCheck = useCallback(async (isTimeout = false) => {
    if (!current || checked) return;
    const correct = !isTimeout && isCorrect;

    try {
      // For smart review mode, questionId is omitted so backend uses submitWordReview path
      const submitData: Record<string, unknown> = {
        wordId: current.wordId,
        submittedAnswer: isTimeout ? "TIMEOUT" : (submittedAnswer || "NONE"),
        isCorrect: correct,
        scoreAwarded: correct ? 1.0 : 0.0,
      };
      if (current.questionId) {
        submitData.questionId = current.questionId;
      }
      await userService.submitAnswer(submitData);

      if (correct) setScore((value) => value + 1);
      setChecked(true);

      // Track session results
      setSessionResults((prev) => ({
        correctCount: prev.correctCount + (correct ? 1 : 0),
        wrongCount: prev.wrongCount + (correct ? 0 : 1),
        totalAttempts: prev.totalAttempts + 1,
      }));
    } catch (error) {
      console.error("Failed to submit answer", error);
      toast.error("Không thể ghi nhận kết quả. Vui lòng thử lại.");
    }
  }, [checked, current, isCorrect, submittedAnswer]);

  useEffect(() => {
    if (checked || !current) return;
    if (timeLeft <= 0) {
      void Promise.resolve().then(() => handleCheck(true));
      return;
    }

    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, checked, current, handleCheck]);

  const moveDraggedItem = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setOrderedItems((items) => {
      const nextItems = [...items];
      const [moved] = nextItems.splice(draggedIndex, 1);
      nextItems.splice(targetIndex, 0, moved);
      return nextItems;
    });
    setDraggedIndex(targetIndex);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
    } else {
      setIndex(questions.length);
    }
  };

  // Fetch session summary when practice is completed (index >= questions.length)
  useEffect(() => {
    if (index >= questions.length && questions.length > 0 && !summaryLoading && !sessionSummary && !finalizeAttempted) {
      const timeout = window.setTimeout(() => {
        const topicId = Number(new URLSearchParams(window.location.search).get("topicId")) || undefined;
        setFinalizeAttempted(true);
        setSummaryLoading(true);
        Promise.all([
          userService.getSessionSummary(),
          userService.completePracticeSession({
            sessionKey: practiceSessionKey.current,
            topicId,
            correctCount: sessionResults.correctCount,
            totalAttempts: sessionResults.totalAttempts,
          }),
        ])
          .then(([summary, reward]) => {
            setSessionSummary(summary);
            setPracticeReward(reward);
          })
          .catch((error) => {
            console.error("Failed to finalize practice session", error);
            toast.error("Không thể ghi nhận XP hoàn thành phiên luyện tập.");
          })
          .finally(() => setSummaryLoading(false));
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [finalizeAttempted, index, questions.length, sessionResults.correctCount, sessionResults.totalAttempts, summaryLoading, sessionSummary]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">Đang xác thực...</div>;
  }

  // Show mode selector before starting
  if (!practiceMode && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-6">
        <div className="w-full max-w-lg space-y-6 text-center">
          <div className="animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-linear-to-br from-blue-600/20 to-blue-500/10 rounded-[28px] flex items-center justify-center mx-auto border border-blue-500/30 shadow-lg shadow-blue-900/10">
              <Brain size={40} className="text-blue-400" />
            </div>
          </div>
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">Chọn chế độ luyện tập</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Chọn chế độ phù hợp với bạn nhất. Cả hai đều giúp bạn nhớ từ lâu hơn.
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 mt-8">
            <button
              onClick={() => handleModeSelect("normal")}
              className="group relative overflow-hidden p-5 sm:p-7 rounded-[28px] border-2 border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/30"
            >
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-blue-500/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <div className="relative flex items-center gap-3 sm:gap-5">
                <div className="h-12 w-12 shrink-0 sm:h-14 sm:w-14 rounded-2xl bg-linear-to-br from-blue-500/15 to-blue-600/10 border border-blue-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <RefreshCw size={22} className="sm:size-[26px] text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white mb-1">Luyện tập thường</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Câu hỏi ngẫu nhiên từ các chủ đề bạn đang học</p>
                </div>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-500" />
              </div>
            </button>

            <button
              onClick={() => handleModeSelect("smart")}
              className="group relative overflow-hidden p-5 sm:p-7 rounded-[28px] border-2 border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-emerald-500/30"
            >
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-emerald-500/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <div className="relative flex items-center gap-3 sm:gap-5">
                <div className="h-12 w-12 shrink-0 sm:h-14 sm:w-14 rounded-2xl bg-linear-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Brain size={22} className="sm:size-[26px] text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white mb-1">Ôn tập thông minh</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Tập trung vào những từ bạn hay quên hoặc thường sai nhất</p>
                </div>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-500" />
              </div>
            </button>
          </div>

          <button
            onClick={() => router.push("/user/dashboard")}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold uppercase tracking-widest transition-colors mt-4"
          >
            ← Quay về tổng quan
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">Đang tải câu hỏi...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-6 text-center">
        <CheckCircle2 size={64} className="text-green-500 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">Không có câu hỏi</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          {practiceMode === "smart"
            ? "Chưa có từ nào cần ôn lại. Học thêm từ mới hoặc chọn luyện tập thường nhé!"
            : "Chủ đề này chưa có câu hỏi phù hợp. Hãy thử ôn tập thông minh hoặc chọn chủ đề khác."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => handleModeSelect(practiceMode === "smart" ? "normal" : "smart")}
            className="bg-blue-600"
          >
            Đổi chế độ
          </Button>
          <Button variant="outline" onClick={() => router.push("/user/courses")}>
            Chọn chủ đề
          </Button>
        </div>
      </div>
    );
  }

  if (index >= questions.length) {
    const localAccuracy = Math.round((score / questions.length) * 100);

    const summary = sessionSummary;
    const accuracy = summary?.accuracy ?? localAccuracy;
    const totalXP = summary?.totalXP ?? 0;
    const currentLevel = summary?.currentLevel ?? 1;
    const xpEarned = practiceReward?.xpGained ?? 0;
    const weakWords = summary?.weakWords ?? [];

    return (
      <div className={`min-h-screen flex items-center justify-center px-4 py-6 sm:py-10 ${practiceMode === "smart" ? "bg-linear-to-br from-slate-100 via-emerald-50/40 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950" : "bg-slate-100 dark:bg-slate-950"}`}>
        <GamificationCelebration reward={practiceReward} />
        <div className="w-full max-w-lg animate-in zoom-in-95 duration-500">
          <div className={`bg-white dark:bg-white/5 border ${practiceMode === "smart" ? "border-emerald-200 dark:border-emerald-500/20" : "border-slate-200 dark:border-white/10"} rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 shadow-sm text-center`}>
            {/* Circular accuracy display */}
            <div className="relative mx-auto mb-5 sm:mb-6 h-20 w-20 sm:h-24 sm:w-24">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-100 dark:text-white/5" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeDasharray={`${accuracy * 0.97} 100`}
                  className={`${accuracy >= 80 ? 'text-green-500' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500'}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl sm:text-3xl font-black ${accuracy >= 80 ? 'text-green-500' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{accuracy}%</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-2 text-slate-900 dark:text-white">
              {practiceMode === "smart" ? "Ôn tập hoàn tất" : "Hoàn thành"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 max-w-xs mx-auto">
              {practiceMode === "smart"
                ? `Bạn đã ôn lại ${questions.length} từ với độ chính xác ${accuracy}%. Hệ thống SRS đã được cập nhật.`
                : `Bạn đã hoàn thành phiên luyện tập với độ chính xác ${accuracy}%.`}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8">
              <div className="bg-slate-50 dark:bg-white/[0.03] rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-white/5">
                <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest mb-1">Đúng / Sai</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  <span className="text-green-500">{sessionResults.correctCount}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-red-500">{sessionResults.wrongCount}</span>
                </p>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-500/[0.04] rounded-2xl p-3 sm:p-4 border border-amber-200 dark:border-amber-500/15">
                <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest mb-1">XP nhận được</p>
                <p className="text-xl sm:text-2xl font-black text-amber-500">+{xpEarned}</p>
              </div>
            </div>

            <div className="mb-6 text-left">
              <LevelProgressBar
                totalXP={practiceReward?.totalXP ?? totalXP}
                currentLevel={practiceReward?.currentLevel ?? currentLevel}
                currentLevelXP={practiceReward?.currentLevelXP ?? 0}
                xpForNextLevel={practiceReward?.xpForNextLevel ?? 100}
                levelProgress={practiceReward?.levelProgress ?? 0}
              />
            </div>

            {/* Weak words */}
            {weakWords.length > 0 && (
              <div className="bg-red-50/50 dark:bg-red-500/[0.04] rounded-2xl p-4 sm:p-5 border border-red-200 dark:border-red-500/15 mb-6 text-left">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest">
                    Từ cần ôn lại ({weakWords.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("mode", "smart");
                      router.push(`/user/practice?${params.toString()}`);
                    }}
                    className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Ôn ngay →
                  </button>
                </div>
                <div className="space-y-2">
                  {weakWords.slice(0, 5).map((w) => (
                    <div key={w.wordId} className="flex items-center justify-between py-1.5 gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{w.term}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{w.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                setIndex(0);
                setScore(0);
                setSessionResults({ correctCount: 0, wrongCount: 0, totalAttempts: 0 });
                setPracticeMode(null);
                setSessionSummary(null);
                setPracticeReward(null);
                setFinalizeAttempted(false);
                practiceSessionKey.current = '';
              }} className="flex-1 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 h-10 sm:h-12 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-widest hover:bg-slate-100 dark:hover:bg-white/5">Làm lại</Button>
              <Button onClick={() => router.push("/user/dashboard")} className="flex-1 bg-blue-600 hover:bg-blue-500 h-10 sm:h-12 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-widest shadow-lg shadow-blue-900/20">Hoàn tất</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((index + 1) / questions.length) * 100;
  const questionLabel = current.questionType === "MCQ"
    ? "Trắc nghiệm"
    : current.questionType === "Dictation"
      ? "Nghe và gõ lại"
      : current.questionType === "DragDrop"
        ? "Sắp xếp câu"
        : "Điền từ vào chỗ trống";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 px-3 py-6 sm:px-4 sm:py-10 relative">
      <button onClick={() => router.push("/user/dashboard")} className="absolute top-4 left-3 sm:top-8 sm:left-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest z-10">
        <ArrowLeft size={14} className="sm:size-4" /> Thoát
      </button>

      <div className="w-full max-w-2xl">
        {/* Progress + Timer bar */}
        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">
              <span>Tiến trình</span>
              <span>{index + 1} / {questions.length}</span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className={`h-full transition-all duration-500 shadow-glow ${practiceMode === "smart" ? "bg-linear-to-r from-emerald-500 to-teal-400" : "bg-linear-to-r from-blue-600 to-cyan-400"}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
          {practiceMode === "smart" ? (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Brain size={13} className="sm:size-4" />
              <span className="font-mono font-black text-xs sm:text-sm uppercase tracking-widest">Ôn tập</span>
            </div>
          ) : (
            <div className={`flex shrink-0 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 transition-all ${timeLeft < 5 ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-white/5 border-white/5 text-slate-400"}`}>
              <Clock size={13} className="sm:size-4" />
              <span className="font-mono font-black text-base sm:text-lg tabular-nums">{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Question card */}
        <Card className={`bg-white dark:bg-white/5 border p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 relative overflow-hidden rounded-[24px] sm:rounded-[32px] shadow-sm ${practiceMode === "smart" ? "border-emerald-200 dark:border-emerald-500/20" : "border-slate-200 dark:border-white/10"}`}>
          <div className={`absolute top-0 left-0 w-1 sm:w-1.5 h-full shadow-glow ${practiceMode === "smart" ? "bg-emerald-500" : "bg-blue-600"}`} />
          
          {/* Smart mode: SRS context badges */}
          {practiceMode === "smart" && (current as SmartQuestion).masteryLevel !== undefined && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Memory status badge */}
              <SRSStatusBadge status={(current as SmartQuestion).memoryStatus} />
              {/* Mastery level */}
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-400">
                Thành thạo {(current as SmartQuestion).masteryLevel}/10
              </span>
              {/* Consecutive wrong indicator */}
              {(current as SmartQuestion).consecutiveWrong !== undefined && (current as SmartQuestion).consecutiveWrong! >= 2 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-500/15 dark:text-red-300">
                  <XCircle size={10} />
                  Sai {(current as SmartQuestion).consecutiveWrong} lần liên tiếp
                </span>
              )}
              {/* Days since last review */}
              {(current as SmartQuestion).lastReviewedAt && (
                <DaysSinceBadge date={(current as SmartQuestion).lastReviewedAt!} />
              )}
            </div>
          )}

          <div className="absolute right-3 top-3 sm:right-5 sm:top-5">
            <ReportDialog
              wordId={current.wordId}
              questionId={current.questionId}
              entityType="Question"
              defaultType={current.questionType === "Dictation" ? "AudioIssue" : "AnswerIncorrect"}
              title={`Report question #${current.questionId}`}
              context={current.term || current.meaning || current.questionText}
            />
          </div>
          <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 ${practiceMode === "smart" ? "text-emerald-500" : "text-blue-500"}`}>{questionLabel}</p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl text-slate-900 dark:text-white font-black mb-3 sm:mb-4 tracking-tight leading-tight">
            {current.questionType === "MCQ" ? current.term : current.questionType === "Dictation" ? "Nghe và nhập từ" : current.meaning}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium italic leading-relaxed">{current.questionText}</p>
        </Card>

        {/* Answer area */}
        {current.questionType === "MCQ" ? (
          <div className="grid gap-2 sm:gap-3">
            {mcqOptions.map((option: string, optionIndex: number) => {
              const isSelected = selected === option;
              const isAnswer = option === expectedAnswer;
              return (
                <button key={`${option}-${optionIndex}`} disabled={checked} onClick={() => setSelected(option)} className={`group relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 text-left transition-all ${checked ? (isAnswer ? "bg-green-500/10 border-green-500/40 text-white" : (isSelected ? "bg-red-500/10 border-red-500/40 text-white" : "dark:bg-white/2 bg-slate-100 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-700")) : (isSelected ? "bg-blue-600 border-blue-500 text-white scale-[1.02] shadow-2xl shadow-blue-900/40" : "dark:bg-white/3 bg-white border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:dark:bg-white/5 hover:bg-slate-100 hover:border-slate-300 dark:hover:border-white/10")}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-base sm:text-lg leading-snug">{option}</span>
                    {checked && isAnswer && <CheckCircle2 size={20} className="sm:size-6 shrink-0 text-green-400" />}
                    {checked && isSelected && !isAnswer && <XCircle size={20} className="sm:size-6 shrink-0 text-red-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : current.questionType === "DragDrop" ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid gap-2 sm:gap-3">
              {orderedItems.map((item, itemIndex) => (
                <button
                  key={`${item}-${itemIndex}`}
                  type="button"
                  disabled={checked}
                  draggable={!checked}
                  onDragStart={() => setDraggedIndex(itemIndex)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    moveDraggedItem(itemIndex);
                  }}
                  onDrop={() => setDraggedIndex(null)}
                  className={`flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border-2 p-4 sm:p-5 text-left transition-all ${checked ? (isCorrect ? "border-green-500/40 bg-green-500/10 text-white" : "border-red-500/40 bg-red-500/10 text-white") : "border-slate-200 dark:border-white/5 dark:bg-white/3 bg-white text-slate-700 dark:text-slate-200 hover:border-blue-500/40 hover:dark:bg-white/5 hover:bg-slate-100"}`}
                >
                  <GripVertical size={16} className="sm:size-[18px] shrink-0 text-slate-500" />
                  <span className="text-base sm:text-lg font-black">{item}</span>
                </button>
              ))}
            </div>
            {checked && !isCorrect && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-bold mb-1">Thứ tự đúng</p>
                <p className="text-red-400 text-lg sm:text-xl font-black">{expectedAnswer}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {current.questionType === "Dictation" && (
              <button type="button" onClick={() => speak(expectedAnswer)} className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20" aria-label="Phát âm thanh chính tả">
                <Volume2 size={24} className="sm:size-7" />
              </button>
            )}
            <Input
              value={selected}
              disabled={checked}
              autoFocus
              onChange={(event) => setSelected(event.target.value)}
              placeholder="Nhập câu trả lời..."
              className={`h-14 sm:h-20 md:h-24 text-2xl sm:text-3xl md:text-4xl font-black text-center rounded-[20px] sm:rounded-[32px] dark:bg-white/3 bg-white border-2 sm:border-4 transition-all ${checked ? (isCorrect ? "border-green-500 text-green-400 shadow-glow-green" : "border-red-500 text-red-400 shadow-glow-red") : "border-slate-200 dark:border-white/5 focus:border-blue-600 focus:dark:bg-white/5 focus:bg-slate-50 text-slate-900 dark:text-white"}`}
            />
            {checked && !isCorrect && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] uppercase font-bold mb-1">Đáp án đúng</p>
                <p className="text-red-400 text-lg sm:text-xl md:text-2xl font-black">{expectedAnswer}</p>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="mt-8 sm:mt-10 md:mt-12">
          {!checked ? (
            <Button disabled={current.questionType !== "DragDrop" && !selected} onClick={() => handleCheck()} className={`w-full py-5 sm:py-7 md:py-8 text-white rounded-2xl sm:rounded-3xl text-base sm:text-lg md:text-xl font-black uppercase tracking-widest shadow-2xl transition-all disabled:opacity-20 ${practiceMode === "smart" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40" : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40"}`}>
              Kiểm tra
            </Button>
          ) : (
            <Button onClick={next} className="w-full py-5 sm:py-7 md:py-8 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl sm:rounded-3xl text-base sm:text-lg md:text-xl font-black uppercase tracking-widest shadow-2xl transition-all animate-in zoom-in-95">
              {index < questions.length - 1 ? "Tiếp tục" : "Kết quả"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SRS Status Badge ─────────────────────────────────────────────────

function SRSStatusBadge({ status }: { status?: string }) {
  if (!status || status === "New") return null;

  const config: Record<string, { label: string; colors: string }> = {
    Learning: { label: "Đang học", colors: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
    Reviewing: { label: "Đang ôn", colors: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
    Mastered: { label: "Đã thuộc", colors: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
    Lapsed: { label: "Cần ôn lại", colors: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  };

  const c = config[status] || { label: status, colors: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400" };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${c.colors}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}

function DaysSinceBadge({ date }: { date: string }) {
  const daysSince = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSince < 0) return null;

  const colors = daysSince >= 7
    ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
    : daysSince >= 3
      ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${colors}`}>
      {daysSince === 0 ? "Hôm nay" : `${daysSince} ngày trước`}
    </span>
  );
}
