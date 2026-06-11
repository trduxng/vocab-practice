"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  BookmarkCheck,
  BookmarkPlus,
  Brain,
  Loader2,
  RefreshCw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import type { LearningPathTopic, TopicWord } from "@/src/modules/user/types";
import { userService } from "@/src/services/user.service";

type WordFilter = "all" | "new" | "review" | "mastered";

export default function VocabularyTopicDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const topicId = Number(params.topicId);
  const [topic, setTopic] = useState<LearningPathTopic>();
  const [words, setWords] = useState<TopicWord[]>([]);
  const [filter, setFilter] = useState<WordFilter>("all");
  const [selectedWord, setSelectedWord] = useState<TopicWord>();
  const [savingWordId, setSavingWordId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTopic = useCallback(async () => {
    if (!topicId) return;

    setLoading(true);
    setError(false);
    try {
      const [roadmap, topicWords] = await Promise.all([
        userService.getLearningPath(),
        userService.getTopicWords(topicId),
      ]);
      const currentTopic = roadmap.levels.flatMap((level) => level.topics).find((item) => item.topicId === topicId);
      setTopic(currentTopic);
      setWords(topicWords);
      if (!currentTopic) setError(true);
    } catch (topicError) {
      console.error("Failed to load vocabulary topic", topicError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    if (!user || !topicId) return;

    const timeout = window.setTimeout(() => {
      void fetchTopic();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchTopic, topicId, user]);

  const newWords = useMemo(() => words.filter(isNewWord), [words]);
  const reviewWords = useMemo(() => words.filter(isReviewWord), [words]);
  const masteredWords = useMemo(() => words.filter((word) => word.masteryLevel >= 8), [words]);
  const filteredWords = useMemo(() => {
    if (filter === "new") return newWords;
    if (filter === "review") return reviewWords;
    if (filter === "mastered") return masteredWords;
    return words;
  }, [filter, masteredWords, newWords, reviewWords, words]);

  const saveWord = async (word: TopicWord) => {
    if (word.isInNotebook || savingWordId) return;

    setSavingWordId(word.wordId);
    try {
      const result = await userService.addNotebookEntry(word.wordId);
      const notebookId = Number(result?.data?.notebookId || result?.notebookId || 0) || undefined;
      setWords((current) => current.map((item) => item.wordId === word.wordId ? { ...item, isInNotebook: true, notebookId } : item));
      setSelectedWord((current) => current?.wordId === word.wordId ? { ...current, isInNotebook: true, notebookId } : current);
      toast.success(`Đã thêm "${word.term}" vào sổ tay`);
    } catch (saveError) {
      console.error("Failed to save vocabulary word", saveError);
      toast.error("Không thể thêm từ vào sổ tay");
    } finally {
      setSavingWordId(undefined);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950" />;
  }

  return (
    <>
      <Topbar
        title={topic?.title || "Chi tiết chủ đề"}
        subtitle="Xem trước từ vựng trước khi bắt đầu phiên flashcard."
        role="student"
        userName={user?.fullName || "Learner"}
      />

      <main className="flex-1 overflow-auto bg-slate-100 p-4 pb-28 dark:bg-slate-950 sm:p-6 sm:pb-28">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <TopicDetailSkeleton />
          ) : error || !topic ? (
            <TopicError onBack={() => router.push("/user/learn")} onRetry={fetchTopic} />
          ) : (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-[28px] bg-linear-to-br from-emerald-700 via-teal-700 to-cyan-800 p-5 text-white shadow-xl shadow-emerald-900/15 sm:p-6">
                <button type="button" onClick={() => router.push("/user/learn")} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-100 transition-colors hover:text-white">
                  <ArrowLeft className="h-4 w-4" />
                  Danh sách chủ đề
                </button>
                <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">{topic.code || "TOEIC vocabulary"}</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{topic.title}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/85">{topic.description || "Học từng từ mới trong chủ đề và ôn tập để ghi nhớ lâu hơn."}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <TopicMetric value={`${topic.learnedWords}/${topic.totalWords}`} label="Đã học" />
                    <TopicMetric value={`${reviewWords.length}`} label="Cần ôn" />
                    <TopicMetric value={`${topic.masteredWords}`} label="Thành thạo" />
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Từ vựng trong chủ đề</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chạm vào một từ để xem ví dụ và bản dịch.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Tất cả {words.length}</FilterButton>
                    <FilterButton active={filter === "new"} onClick={() => setFilter("new")}>Từ mới {newWords.length}</FilterButton>
                    <FilterButton active={filter === "review"} onClick={() => setFilter("review")}>Cần ôn {reviewWords.length}</FilterButton>
                    <FilterButton active={filter === "mastered"} onClick={() => setFilter("mastered")}>Thành thạo {masteredWords.length}</FilterButton>
                  </div>
                </div>
              </section>

              {filteredWords.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white p-6 text-center text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.03]">
                  Không có từ vựng phù hợp với bộ lọc này.
                </div>
              ) : (
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredWords.map((word) => (
                    <WordCard key={word.wordId} word={word} onOpen={() => setSelectedWord(word)} onSave={() => void saveWord(word)} saving={savingWordId === word.wordId} />
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      {!loading && topic && (
        <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => router.push(`/user/learn/session?topicId=${topic.topicId}&mode=new`)}
              disabled={newWords.length === 0}
              className="min-h-12 flex-1 rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-wide hover:bg-blue-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {newWords.length > 0 ? `Học từ mới · ${newWords.length} còn lại` : "Đã học hết từ mới"}
            </Button>
            <Button
              onClick={() => router.push(`/user/practice?topicId=${topic.topicId}`)}
              disabled={topic.learnedWords === 0}
              className="min-h-12 flex-1 rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-wide hover:bg-emerald-700"
            >
              <Brain className="mr-2 h-4 w-4" />
              Luyện tập chủ đề
            </Button>
          </div>
        </div>
      )}

      <WordDetailDialog word={selectedWord} onOpenChange={(open) => !open && setSelectedWord(undefined)} onSave={() => selectedWord && void saveWord(selectedWord)} saving={savingWordId === selectedWord?.wordId} />
    </>
  );
}

function WordCard({ word, onOpen, onSave, saving }: { word: TopicWord; onOpen: () => void; onSave: () => void; saving: boolean }) {
  const status = getWordStatus(word);

  return (
    <article className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-emerald-500/40">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-emerald-700 dark:text-emerald-300">{word.term}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${status.className}`}>{status.label}</span>
        </div>
        {word.phonetic && <p className="mt-1 text-[11px] font-bold text-slate-400">{word.phonetic}</p>}
        <p className="mt-1 line-clamp-1 text-sm text-slate-600 dark:text-slate-300">
          {word.partOfSpeechName && <em className="mr-1 text-slate-400">({word.partOfSpeechName})</em>}
          {word.meaning}
        </p>
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={word.isInNotebook || saving}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-emerald-300 hover:text-emerald-600 disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-600 dark:border-white/10 dark:disabled:border-emerald-500/20 dark:disabled:bg-emerald-500/10 dark:disabled:text-emerald-300"
        aria-label={word.isInNotebook ? "Đã lưu vào sổ tay" : `Lưu ${word.term} vào sổ tay`}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : word.isInNotebook ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
      </button>
    </article>
  );
}

function WordDetailDialog({ word, onOpenChange, onSave, saving }: { word?: TopicWord; onOpenChange: (open: boolean) => void; onSave: () => void; saving: boolean }) {
  return (
    <Dialog open={!!word} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[28px] border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {word && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-950 dark:text-white">
                {word.term}
                <button type="button" onClick={() => speak(word.term)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" aria-label={`Nghe phát âm ${word.term}`}>
                  <Volume2 className="h-4 w-4" />
                </button>
              </DialogTitle>
              <DialogDescription>{word.phonetic || "Chưa có phiên âm"} {word.partOfSpeechName ? `· ${word.partOfSpeechName}` : ""}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <InfoBlock label="Ý nghĩa" value={word.meaning} />
              <InfoBlock label="Ví dụ" value={word.exampleSentence || "Chưa có câu ví dụ cho từ này."} />
              <InfoBlock label="Dịch nghĩa" value={word.exampleMeaning || "Bản dịch đang được cập nhật."} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
              <Button onClick={onSave} disabled={word.isInNotebook || saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : word.isInNotebook ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
                {word.isInNotebook ? "Đã lưu vào sổ tay" : "Lưu vào sổ tay"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wide transition-colors ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"}`}>
      {children}
    </button>
  );
}

function TopicMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-20 rounded-2xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur">
      <p className="text-lg font-black">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-emerald-100/80">{label}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-[10px] font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-300">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

function TopicDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-60 rounded-[28px] bg-slate-200 dark:bg-white/10" />
      <div className="h-24 rounded-[24px] bg-slate-200 dark:bg-white/10" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }).map((_, index) => <div key={index} className="h-24 rounded-[20px] bg-slate-200 dark:bg-white/10" />)}
      </div>
    </div>
  );
}

function TopicError({ onBack, onRetry }: { onBack: () => void; onRetry: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-rose-200 bg-white p-8 text-center dark:border-rose-500/20 dark:bg-white/[0.04]">
      <BookOpen className="h-10 w-10 text-rose-500" />
      <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Không thể tải chủ đề</h2>
      <div className="mt-5 flex gap-2">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Danh sách chủ đề</Button>
        <Button onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" />Thử lại</Button>
      </div>
    </div>
  );
}

function isNewWord(word: TopicWord) {
  return Number(word.repetitionCount || 0) === 0;
}

function isReviewWord(word: TopicWord) {
  if (isNewWord(word) || !word.nextReviewDate) return false;
  return new Date(word.nextReviewDate).getTime() <= Date.now();
}

function getWordStatus(word: TopicWord) {
  if (word.masteryLevel >= 8) return { label: "Thành thạo", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" };
  if (isReviewWord(word)) return { label: "Cần ôn", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" };
  if (isNewWord(word)) return { label: "Từ mới", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" };
  return { label: "Đang học", className: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" };
}

function speak(text: string) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}
