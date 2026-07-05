"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain, CheckCircle2, Clock, GripVertical, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { QuestionRenderer } from "@/src/components/user/practice/QuestionRenderer";
import ReportDialog from "@/src/components/shared/ReportDialog";
import GamificationCelebration from "@/src/components/user/gamification/GamificationCelebration";
import LevelProgressBar from "@/src/components/user/gamification/LevelProgressBar";
import type { GamificationReward } from "@/src/modules/user/types";

const QUESTION_TIME = 20;

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
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
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
        // Transform smart queue items into practice question format
        // Note: questionId is intentionally omitted — these use wordId for review submission
        const mapped = smartQueue.map((item: Record<string, unknown>) => ({
          wordId: item.wordId as number,
          questionType: "FillBlank",
          questionText: item.meaning as string,
          correctAnswer: item.term as string,
          term: item.term as string,
          meaning: item.meaning as string,
        } as PracticeQuestion));
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
    setTimeLeft(QUESTION_TIME);
    setOrderedItems(items);
    setDraggedIndex(null);
  }, []);

  useEffect(() => {
    if (current?.questionType === "DragDrop") {
      void Promise.resolve().then(() => resetQuestionState(dragItems));
    } else {
      void Promise.resolve().then(() => resetQuestionState());
    }
  }, [current?.questionId, current?.questionType, dragItems, resetQuestionState]);

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
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
            <Brain size={32} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">Chọn chế độ luyện tập</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">Chọn cách bạn muốn ôn tập từ vựng hôm nay.</p>

          <div className="grid gap-4">
            <button
              onClick={() => handleModeSelect("normal")}
              className="group p-6 rounded-3xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-left transition-all hover:border-blue-500/40 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <RefreshCw size={22} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white mb-1">Luyện tập thường</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Câu hỏi ngẫu nhiên từ các chủ đề bạn đang học</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleModeSelect("smart")}
              className="group p-6 rounded-3xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-left transition-all hover:border-emerald-500/40 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Brain size={22} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white mb-1">Ôn tập thông minh</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Ưu tiên từ sắp quên, hay sai nhiều nhất theo SRS</p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => router.push("/user/dashboard")}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold uppercase tracking-widest transition-colors"
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
            ? "Hiện chưa có từ đã học nào cần ôn tập. Hãy học thêm từ mới hoặc chọn luyện tập thường."
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
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-10">
        <GamificationCelebration reward={practiceReward} />
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-10 shadow-sm text-center">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
              <RefreshCw size={40} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Hoàn thành</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Bạn đã hoàn thành phiên luyện tập.</p>

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
              <div className="bg-red-500/5 dark:bg-red-500/5 bg-red-50/50 rounded-2xl p-5 border border-red-500/10 mb-6 text-left">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    Từ cần ôn lại ({weakWords.length})
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("mode", "smart");
                      router.push(`/user/practice?${params.toString()}`);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-500 h-auto p-0"
                  >
                    Ôn ngay
                  </Button>
                </div>
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
              <Button variant="outline" onClick={() => window.location.reload()} className="flex-1 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest">Làm lại</Button>
              <Button onClick={() => router.push("/user/dashboard")} className="flex-1 bg-blue-600 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest">Xong</Button>
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-10 relative">
      <button onClick={() => router.push("/user/dashboard")} className="absolute top-8 left-8 text-slate-500 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Thoát
      </button>

      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 mr-6">
            <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
              <span>Tiến trình</span>
              <span>{index + 1} / {questions.length}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-linear-to-r from-blue-600 to-cyan-400 transition-all duration-500 shadow-glow" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${timeLeft < 5 ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-white/5 border-white/5 text-slate-400"}`}>
            <Clock size={16} />
            <span className="font-mono font-black text-lg">{timeLeft}s</span>
          </div>
        </div>

        <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 p-12 mb-8 relative overflow-hidden rounded-[32px] shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-glow" />
          <div className="absolute right-5 top-5">
            <ReportDialog
              wordId={current.wordId}
              questionId={current.questionId}
              entityType="Question"
              defaultType={current.questionType === "Dictation" ? "AudioIssue" : "AnswerIncorrect"}
              title={`Báo cáo câu #${current.questionId}`}
              context={current.term || current.meaning || current.questionText}
            />
          </div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{questionLabel}</p>
          <h1 className="text-4xl sm:text-5xl text-slate-900 dark:text-white font-black mb-4 tracking-tight">
            {current.questionType === "MCQ" ? current.term : current.questionType === "Dictation" ? "Nghe và nhập từ" : current.meaning}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-sm font-medium italic">{current.questionText}</p>
        </Card>

        {current.questionType === "MCQ" ? (
          <QuestionRenderer
            questionType="MCQ"
            options={mcqOptions}
            value={selected}
            onChange={setSelected}
            mode={checked ? "feedback" : "select"}
            correctAnswer={expectedAnswer}
            disabled={checked}
          />
        ) : current.questionType === "DragDrop" ? (
          <div className="space-y-4">
            <div className="grid gap-3">
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
                  className={`flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all ${checked ? (isCorrect ? "border-green-500/40 bg-green-500/10 text-white" : "border-red-500/40 bg-red-500/10 text-white") : "border-slate-200 dark:border-white/5 dark:bg-white/3 bg-white text-slate-700 dark:text-slate-200 hover:border-blue-500/40 dark:hover:bg-white/10 hover:bg-slate-100"}`}
                >
                  <GripVertical size={18} className="shrink-0 text-slate-500" />
                  <span className="text-lg font-black">{item}</span>
                </button>
              ))}
            </div>
            {checked && !isCorrect && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-[10px] uppercase font-bold mb-1">Thứ tự đúng</p>
                <p className="text-red-400 text-xl font-black">{expectedAnswer}</p>
              </div>
            )}
          </div>
        ) : current.questionType === "FillBlank" ? (
          <div className="space-y-6">
            <QuestionRenderer
              questionType="FillBlank"
              options={[]}
              value={selected}
              onChange={setSelected}
              mode={checked ? "feedback" : "select"}
              correctAnswer={expectedAnswer}
              disabled={checked}
            />
            {checked && !isCorrect && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-[10px] uppercase font-bold mb-1">Đáp án đúng</p>
                <p className="text-red-400 text-2xl font-black">{expectedAnswer}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <QuestionRenderer
              questionType={current.questionType}
              options={[]}
              value={selected}
              onChange={setSelected}
              mode={checked ? "feedback" : "select"}
              correctAnswer={expectedAnswer}
              disabled={checked}
            />
            {checked && !isCorrect && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                <p className="text-slate-500 dark:text-slate-400 text-slate-500 text-[10px] uppercase font-bold mb-1">Đáp án đúng</p>
                <p className="text-red-400 text-2xl font-black">{expectedAnswer}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12">
          {!checked ? (
            <Button disabled={current.questionType !== "DragDrop" && !selected} onClick={() => handleCheck()} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-20">
              Kiểm tra
            </Button>
          ) : (
            <Button onClick={next} className="w-full py-8 bg-white text-slate-900 hover:bg-slate-200 rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl transition-all animate-in zoom-in-95">
              {index < questions.length - 1 ? "Tiếp tục" : "Kết quả"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
