"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, BookmarkCheck, BookmarkPlus, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
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

type VocabularyPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics?: LearningPathTopic[];
  initialTopicId?: number;
  onStartLearning?: (topicId: number) => void;
  onNotebookChanged?: () => void;
};

export default function VocabularyPreviewDialog({
  open,
  onOpenChange,
  topics,
  initialTopicId,
  onStartLearning,
  onNotebookChanged,
}: VocabularyPreviewDialogProps) {
  const [availableTopics, setAvailableTopics] = useState<LearningPathTopic[]>(topics || []);
  const [selectedTopicId, setSelectedTopicId] = useState<number>();
  const [words, setWords] = useState<TopicWord[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [addingWordId, setAddingWordId] = useState<number>();

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const loadTopics = async () => {
      setTopicsLoading(true);
      try {
        const sourceTopics = topics?.length
          ? topics
          : (await userService.getLearningPath()).levels.flatMap((level) => level.topics);
        const nextTopics = sourceTopics.filter((topic) => topic.totalWords > 0);
        if (cancelled) return;

        setAvailableTopics(nextTopics);
        setSelectedTopicId((current) => {
          const preferred = initialTopicId || current;
          return nextTopics.some((topic) => topic.topicId === preferred)
            ? preferred
            : nextTopics[0]?.topicId;
        });
      } catch (error) {
        console.error("Failed to load vocabulary topics", error);
        toast.error("Không thể tải danh sách chủ đề");
      } finally {
        if (!cancelled) setTopicsLoading(false);
      }
    };

    void loadTopics();
    return () => {
      cancelled = true;
    };
  }, [initialTopicId, open, topics]);

  useEffect(() => {
    if (!open || !selectedTopicId) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setWordsLoading(true);
      userService
        .getTopicWords(selectedTopicId)
        .then((data) => {
          if (!cancelled) setWords(data);
        })
        .catch((error) => {
          console.error("Failed to load topic vocabulary", error);
          toast.error("Không thể tải từ vựng trong chủ đề");
        })
        .finally(() => {
          if (!cancelled) setWordsLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [open, selectedTopicId]);

  const selectedTopic = useMemo(
    () => availableTopics.find((topic) => topic.topicId === selectedTopicId),
    [availableTopics, selectedTopicId],
  );

  const handleAddWord = async (word: TopicWord) => {
    if (word.isInNotebook || addingWordId) return;

    setAddingWordId(word.wordId);
    try {
      const result = await userService.addNotebookEntry(word.wordId);
      setWords((current) =>
        current.map((item) =>
          item.wordId === word.wordId
            ? { ...item, isInNotebook: true, notebookId: Number(result?.data?.notebookId || result?.notebookId || 0) || undefined }
            : item,
        ),
      );
      onNotebookChanged?.();
      toast.success(`Đã thêm "${word.term}" vào sổ tay`);
    } catch (error) {
      console.error("Failed to add notebook word", error);
      toast.error("Không thể thêm từ vào sổ tay");
    } finally {
      setAddingWordId(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-hidden rounded-[28px] border-slate-200 bg-white p-0 dark:border-white/10 dark:bg-slate-900 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 p-5 dark:border-white/10">
          <DialogTitle className="text-xl font-black text-slate-950 dark:text-white">Xem trước từ vựng</DialogTitle>
          <DialogDescription>
            Chọn chủ đề, xem danh sách từ và lưu những từ cần ghi nhớ vào sổ tay.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-5 pb-2">
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Chủ đề</span>
            <select
              value={selectedTopicId || ""}
              onChange={(event) => setSelectedTopicId(Number(event.target.value))}
              disabled={topicsLoading || availableTopics.length === 0}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {availableTopics.map((topic) => (
                <option key={topic.topicId} value={topic.topicId}>
                  {topic.title} ({topic.totalWords} từ)
                </option>
              ))}
            </select>
          </label>

          {topicsLoading || wordsLoading ? (
            <div className="flex min-h-52 items-center justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : words.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-white/10">
              Chủ đề chưa có từ vựng để xem trước.
            </div>
          ) : (
            <div className="grid gap-2">
              {words.map((word) => (
                <article key={word.wordId} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-white/10 dark:bg-white/[0.025]">
                  <button
                    type="button"
                    onClick={() => speak(word.term)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300"
                    aria-label={`Nghe phát âm ${word.term}`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-slate-900 dark:text-white">{word.term}</h3>
                      {word.phonetic && <span className="text-xs text-slate-400">{word.phonetic}</span>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{word.meaning}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleAddWord(word)}
                    disabled={word.isInNotebook || addingWordId === word.wordId}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-[10px] font-black uppercase tracking-wide text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-600 dark:border-white/10 dark:text-slate-300 dark:disabled:border-emerald-500/20 dark:disabled:bg-emerald-500/10 dark:disabled:text-emerald-300"
                  >
                    {addingWordId === word.wordId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : word.isInNotebook ? <BookmarkCheck className="h-3.5 w-3.5" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
                    {word.isInNotebook ? "Đã lưu" : "Lưu từ"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-slate-200 p-5 dark:border-white/10">
          {selectedTopic && onStartLearning && (
            <Button onClick={() => onStartLearning(selectedTopic.topicId)} className="bg-blue-600 hover:bg-blue-700">
              <BookOpen className="mr-2 h-4 w-4" />
              Mở chủ đề
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function speak(text: string) {
  if (!window.speechSynthesis || !text) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}
