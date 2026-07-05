"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, CheckCircle2, ChevronRight, GripVertical, Loader2, RefreshCw, Volume2, X,
} from "lucide-react";
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
const MCQ_LABELS = ["A", "B", "C", "D", "E", "F"];

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

function speak(text: string) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

const shuffle = <T,>(items: T[]) => {
  const nextItems = [...items];
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = (index * 7 + 3) % (index + 1);
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }
  return nextItems;
};

function CircularTimer({ timeLeft, max }: { timeLeft: number; max: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const frac = timeLeft / max;
  const dash = circ * frac;
  const color =
    frac > 0.5 ? "stroke-emerald-400" :
    frac > 0.25 ? "stroke-amber-400" :
    "stroke-red-400";

  return (
    <svg width={72} height={72} className={`drop-shadow-lg ${frac < 0.25 ? "animate-pulse" : ""}`}>
      <circle cx={36} cy={36} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-white/10" />
      <circle
        cx={36} cy={36} r={r} fill="none" strokeWidth={5}
        className={`${color} transition-all duration-1000 ease-linear`}
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
      />
      <text x={36} y={36} textAnchor="middle" dominantBaseline="central"
        className={`fill-current text-lg font-black ${frac < 0.25 ? "text-red-400" : frac < 0.5 ? "text-amber-400" : "text-slate-200"}`}
      >
        {timeLeft}
      </text>
    </svg>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color =
    score >= 80 ? "stroke-emerald-400" :
    score >= 50 ? "stroke-amber-400" :
    "stroke-red-400";

  return (
    <div className="relative mx-auto flex items-center justify-center w-44 h-44">
      <svg width={176} height={176} className="transform -rotate-90">
        <circle cx={88} cy={88} r={r} fill="none" stroke="currentColor" strokeWidth={10} className="text-white/5" />
        <circle
          cx={88} cy={88} r={r} fill="none" strokeWidth={10}
          className={`${color} transition-all duration-1000 ease-out`}
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-black ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>
          {score}%
        </span>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
          {score >= 80 ? "Tuyệt vời" : score >= 60 ? "Khá tốt" : score >= 40 ? "Cố gắng" : "Yếu"}
        </span>
      </div>
    </div>
  );
}

export default function UserPractice() {
  const { loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
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
  const [animKey, setAnimKey] = useState(0);
  const questionRef = useRef<HTMLDivElement>(null);
  const practiceSessionKey = useRef("");
  const autoStarted = useRef(false);
  const router = useRouter();

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const topicId = searchParams.get("topicId") || undefined;
      const data = await userService.getPracticeQueue({ limit: 15, topicId });
      setQuestions(shuffle(data));
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || autoStarted.current) return;
    autoStarted.current = true;
    practiceSessionKey.current = window.crypto.randomUUID();
    void Promise.resolve().then(() => fetchQuestions());
  }, [authLoading, fetchQuestions]);

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
      // fallback
    }
    return shuffle(expectedAnswer.split(/\s+/).filter(Boolean));
  }, [current, expectedAnswer]);

  const resetQuestionState = useCallback((items: string[] = []) => {
    setSelected("");
    setChecked(false);
    setTimeLeft(QUESTION_TIME);
    setOrderedItems(items);
    setDraggedIndex(null);
    setAnimKey((k) => k + 1);
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

      setChecked(true);

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

  // ── Keyboard shortcuts ──
  useEffect(() => {
    if (!current || checked) return;

    const onKey = (e: KeyboardEvent) => {
      if (current.questionType === "MCQ") {
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < mcqOptions.length) {
          e.preventDefault();
          setSelected(mcqOptions[idx]);
        }
      }
      if (e.key === "Enter" && selected) {
        e.preventDefault();
        void handleCheck();
      }
      if (e.key === "Escape" && selected) {
        setSelected("");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, checked, mcqOptions, selected, handleCheck]);

  useEffect(() => {
    if (!current || !checked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [checked, current]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Fetch session summary when practice is completed
  useEffect(() => {
    if (index >= questions.length && questions.length > 0 && !summaryLoading && !sessionSummary && !finalizeAttempted) {
      const timeout = window.setTimeout(() => {
        const topicId = Number(new URLSearchParams(window.location.search).get("topicId")) || undefined;
        setFinalizeAttempted(true);
        setSummaryLoading(true);
        (async () => {
          try {
            const reward = await userService.completePracticeSession({
              sessionKey: practiceSessionKey.current,
              topicId,
              correctCount: sessionResults.correctCount,
              totalAttempts: sessionResults.totalAttempts,
            });
            setPracticeReward(reward);
            const summary = await userService.getSessionSummary();
            setSessionSummary(summary);
          } catch (error) {
            console.error("Failed to finalize practice session", error);
            toast.error("Không thể ghi nhận XP hoàn thành phiên luyện tập.");
          } finally {
            setSummaryLoading(false);
          }
        })()
          .catch((error) => {
            console.error("Failed to finalize practice session", error);
            toast.error("Không thể ghi nhận XP hoàn thành phiên luyện tập.");
          })
          .finally(() => setSummaryLoading(false));
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [finalizeAttempted, index, questions.length, sessionResults.correctCount, sessionResults.totalAttempts, summaryLoading, sessionSummary]);

  // ── Render ──

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang xác thực...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <div className="flex flex-col gap-3 w-full max-w-md">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black mb-3">Không có câu hỏi</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Hiện không có câu hỏi nào phù hợp. Hãy học thêm từ mới hoặc chọn chủ đề khác.
        </p>
        <Button variant="outline" onClick={() => router.push("/user/courses")} className="mt-8">
          Chọn chủ đề
        </Button>
      </div>
    );
  }

  // ═══════════════ RESULTS ═══════════════
  if (index >= questions.length) {
    const localAccuracy = sessionResults.totalAttempts > 0
      ? Math.round((sessionResults.correctCount / sessionResults.totalAttempts) * 100)
      : 0;
    const accuracy = localAccuracy;
    const xpEarned = practiceReward?.xpGained ?? 0;
    const weakWords = sessionSummary?.weakWords ?? [];

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
        <GamificationCelebration reward={practiceReward} />
        <div className="w-full max-w-lg animate-fade-in-up">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl text-center">

            <ScoreGauge score={accuracy} />

            <div className="grid grid-cols-3 gap-3 mt-8 mb-6">
              <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Đúng</p>
                <p className="text-2xl font-black text-emerald-400">{sessionResults.correctCount}</p>
              </div>
              <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Sai</p>
                <p className="text-2xl font-black text-red-400">{sessionResults.wrongCount}</p>
              </div>
              <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">XP</p>
                <p className="text-2xl font-black text-amber-400">+{xpEarned}</p>
              </div>
            </div>

            <div className="mb-6 text-left">
              <LevelProgressBar
                totalXP={practiceReward?.totalXP ?? sessionSummary?.totalXP ?? 0}
                currentLevel={practiceReward?.currentLevel ?? sessionSummary?.currentLevel ?? 1}
                currentLevelXP={practiceReward?.currentLevelXP ?? 0}
                xpForNextLevel={practiceReward?.xpForNextLevel ?? 100}
                levelProgress={practiceReward?.levelProgress ?? 0}
              />
            </div>

            {weakWords.length > 0 && (
              <div className="bg-red-500/5 rounded-2xl p-5 border border-red-500/10 mb-6 text-left">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    Từ cần ôn lại ({weakWords.length})
                  </p>
                </div>
                <div className="space-y-2">
                  {weakWords.slice(0, 5).map((w) => (
                    <div key={w.wordId} className="flex items-center justify-between py-1">
                      <span className="text-sm font-bold text-slate-200">{w.term}</span>
                      <span className="text-xs text-slate-500">{w.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.location.reload()}
                className="flex-1 border-white/10 text-white h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5">
                Làm lại
              </Button>
              <Button onClick={() => router.push("/user/dashboard")}
                className="flex-1 bg-blue-600 hover:bg-blue-500 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                Xong
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ QUESTION ═══════════════
  const progress = ((index + 1) / questions.length) * 100;
  const questionLabel =
    current.questionType === "MCQ" ? "Trắc nghiệm" :
    current.questionType === "Dictation" ? "Nghe và gõ lại" :
    current.questionType === "DragDrop" ? "Sắp xếp" :
    "Điền từ";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      {/* Exit */}
      <button
        onClick={() => router.push("/user/dashboard")}
        className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Thoát
      </button>

      <div className="w-full max-w-2xl">
        {/* Header - progress + score + timer */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
              <span>Tiến trình</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">{sessionResults.correctCount}</span>
                <span className="text-slate-600">/</span>
                <span className="text-red-400">{sessionResults.wrongCount}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Step dots */}
            <div className="flex gap-1 mt-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i < index ? "bg-blue-500/60" :
                    i === index ? "bg-blue-400" :
                    "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className={`relative rounded-2xl p-1 transition-all duration-500 ${
            timeLeft < 5
              ? "bg-red-500/15 ring-2 ring-red-500/30 shadow-[0_0_24px_rgba(239,68,68,0.25)]"
              : timeLeft < 10
                ? "bg-amber-500/10 ring-1 ring-amber-500/20"
                : ""
          }`}>
            <CircularTimer timeLeft={timeLeft} max={QUESTION_TIME} />
          </div>
          <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest w-8 text-center leading-tight">
            {index + 1}/{questions.length}
          </span>
        </div>

        {/* Question card */}
        <div key={animKey} className="animate-slide-in-right">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-12 mb-8 relative overflow-hidden rounded-[32px] shadow-xl">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)]" />

            {/* Badge + actions row */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                {questionLabel}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {current.term && (
                  <button
                    type="button"
                    onClick={() => speak(current.term!)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    aria-label={`Nghe phát âm ${current.term}`}
                  >
                    <Volume2 size={15} />
                  </button>
                )}
                <ReportDialog
                  wordId={current.wordId}
                  questionId={current.questionId}
                  entityType="Question"
                  defaultType={current.questionType === "Dictation" ? "AudioIssue" : "AnswerIncorrect"}
                  title={`Báo cáo câu #${current.questionId ?? index + 1}`}
                  context={current.term || current.meaning || current.questionText}
                />
              </div>
            </div>

            {/* Question text */}
            <h1 className="text-3xl sm:text-4xl text-white font-black mb-3 tracking-tight leading-tight">
              {current.questionType === "MCQ" ? (
                <>
                  Chọn nghĩa của từ
                  <span className="block text-blue-400 text-2xl sm:text-3xl mt-2">"{current.term}"</span>
                </>
              ) : current.questionType === "Dictation" ? (
                <div className="flex items-center gap-3">
                  <span>Nghe và nhập từ</span>
                  <button
                    type="button"
                    onClick={() => speak(current.term!)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-all border border-blue-500/20"
                    aria-label="Phát âm từ"
                  >
                    <Volume2 size={22} />
                  </button>
                </div>
              ) : (
                current.meaning
              )}
            </h1>

            {current.questionText && current.questionType !== "MCQ" && (
              <p className="text-slate-400 text-sm font-medium italic">{current.questionText}</p>
            )}
          </Card>

          {/* Answer area */}
          {current.questionType === "MCQ" ? (
            <div className="grid gap-3">
              {mcqOptions.map((opt: string, i: number) => {
                const isSelected = selected === opt;
                const isAnswer = checked && opt === expectedAnswer;
                const isWrong = checked && isSelected && !isAnswer;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={checked}
                    onClick={() => setSelected(opt)}
                    className={`group flex items-center gap-4 w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all ${
                      checked
                        ? isAnswer
                          ? "border-emerald-500/50 bg-emerald-500/15 text-white"
                          : isWrong
                            ? "border-red-500/50 bg-red-500/15 text-white"
                            : "border-white/5 bg-transparent text-slate-500"
                        : isSelected
                          ? "border-blue-500/50 bg-blue-500/15 text-white"
                          : "border-white/5 bg-white/[0.03] text-slate-300 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-white"
                    } ${checked && !isAnswer && !isWrong ? "opacity-40" : ""}`}
                  >
                    <span className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black shrink-0 transition-all ${
                      checked && isAnswer
                        ? "bg-emerald-500/20 text-emerald-400"
                        : checked && isWrong
                          ? "bg-red-500/20 text-red-400"
                          : isSelected
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-white/5 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400"
                    }`}>
                      {checked && isAnswer ? (
                        <Check size={18} className="text-emerald-400" />
                      ) : checked && isWrong ? (
                        <X size={18} className="text-red-400" />
                      ) : (
                        MCQ_LABELS[i] || i + 1
                      )}
                    </span>
                    <span className="font-bold text-base">{opt}</span>
                    {checked && isAnswer && (
                      <ChevronRight size={18} className="ml-auto text-emerald-400 animate-fade-in-up" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : current.questionType === "DragDrop" ? (
            <div className="space-y-3">
              {orderedItems.map((item, itemIndex) => (
                <button
                  key={`${item}-${itemIndex}`}
                  type="button"
                  disabled={checked}
                  draggable={!checked}
                  onDragStart={() => setDraggedIndex(itemIndex)}
                  onDragOver={(event) => { event.preventDefault(); moveDraggedItem(itemIndex); }}
                  onDrop={() => setDraggedIndex(null)}
                  className={`flex items-center gap-4 w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    checked
                      ? isCorrect
                        ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                        : "border-red-500/40 bg-red-500/10 text-white"
                      : "border-white/5 bg-white/[0.03] text-slate-300 hover:border-blue-500/30 hover:bg-blue-500/5"
                  }`}
                >
                  <GripVertical size={18} className="shrink-0 text-slate-500" />
                  <span className="font-bold">{item}</span>
                </button>
              ))}
              {checked && !isCorrect && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                  <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Thứ tự đúng</p>
                  <p className="text-red-400 text-xl font-black">{expectedAnswer}</p>
                </div>
              )}
            </div>
          ) : current.questionType === "FillBlank" || !current.questionType ? (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  disabled={checked}
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  autoFocus
                  placeholder="Gõ đáp án của bạn..."
                  className={`w-full px-6 py-5 text-xl font-bold bg-white/[0.03] border-2 rounded-2xl outline-none transition-all placeholder:text-slate-600 ${
                    checked
                      ? isCorrect
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/50 bg-red-500/10 text-red-400"
                      : selected
                        ? "border-blue-500/50 bg-blue-500/5 text-white focus:border-blue-400"
                        : "border-white/10 text-white focus:border-blue-500/50 focus:bg-blue-500/5"
                  }`}
                />
                {selected && !checked && (
                  <button
                    type="button"
                    onClick={() => setSelected("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {checked && !isCorrect && (
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-center animate-slide-in-right">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1.5">Đáp án đúng</p>
                  <p className="text-red-400 text-2xl font-black">{expectedAnswer}</p>
                </div>
              )}
              {!checked && (
                <p className="text-[10px] text-slate-600 text-center uppercase tracking-wider">
                  Gõ câu trả lời và nhấn <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">Enter</kbd>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
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
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-center animate-slide-in-right">
                  <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Đáp án đúng</p>
                  <p className="text-red-400 text-2xl font-black">{expectedAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <div className="mt-8 flex gap-3">
            {!checked ? (
              <>
                <Button
                  disabled={current.questionType !== "DragDrop" && !selected}
                  onClick={() => handleCheck()}
                  className="flex-1 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all disabled:opacity-20"
                >
                  Kiểm tra
                </Button>
                {index < questions.length - 1 && (
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center justify-center w-16 rounded-2xl border-2 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    Bỏ qua
                  </button>
                )}
              </>
            ) : (
              <Button
                onClick={next}
                className="flex-1 py-6 bg-gradient-to-r from-white to-slate-100 text-slate-900 hover:from-slate-100 hover:to-slate-200 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl transition-all animate-in zoom-in-95"
              >
                {index < questions.length - 1 ? "Tiếp tục" : "Kết quả"}
              </Button>
            )}
          </div>

          {/* Keyboard hints */}
          {current.questionType === "MCQ" && !checked && (
            <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-wider">
              Phím <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">{mcqOptions.length}</kbd> chọn, <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">Enter</kbd> kiểm tra
            </p>
          )}
          {current.questionType === "FillBlank" && !checked && (
            <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-wider">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">Enter</kbd> để kiểm tra, <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">Esc</kbd> xoá
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
