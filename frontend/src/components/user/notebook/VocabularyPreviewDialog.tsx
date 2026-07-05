"use client";

import { useEffect, useState } from "react";
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
import type { TopicWord } from "@/src/modules/user/types";
import { userService } from "@/src/services/user.service";

type VocabularyPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTopicId?: number;
  onStartLearning?: (topicId: number) => void;
  onNotebookChanged?: () => void;
};

export default function VocabularyPreviewDialog({
  open,
  onOpenChange,
  initialTopicId,
  onStartLearning,
  onNotebookChanged,
}: VocabularyPreviewDialogProps) {
  const [words, setWords] = useState<TopicWord[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [addingWordId, setAddingWordId] = useState<number>();

  useEffect(() => {
    if (!open || !initialTopicId) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setWordsLoading(true);
      userService
        .getTopicWords(initialTopicId)
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
  }, [open, initialTopicId]);

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
      <DialogContent className="flex max-h-[88vh] max-w-4xl flex-col overflow-hidden rounded-[28px] border-slate-200 bg-white p-0 dark:border-white/10 dark:bg-slate-900 sm:max-w-4xl">
        <DialogHeader className="border-b border-slate-200 p-5 dark:border-white/10">
          <DialogTitle className="text-xl font-black text-slate-950 dark:text-white">Xem trước từ vựng</DialogTitle>
          <DialogDescription>
            Xem danh sách từ và lưu những từ cần ghi nhớ vào sổ tay.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
          {wordsLoading ? (
            <div className="flex min-h-52 items-center justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : words.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-white/10">
              Chủ đề chưa có từ vựng để xem trước.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {words.map((word, index) => (
                <article
                  key={word.wordId}
                  className="animate-fade-in-up flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-white/[0.025]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => speak(word.term)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300"
                    aria-label={`Nghe phát âm ${word.term}`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black leading-tight text-slate-900 dark:text-white">{word.term}</h3>
                    {word.phonetic && <p className="mt-0.5 text-[10px] text-slate-400">{word.phonetic}</p>}
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{word.meaning}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleAddWord(word)}
                    disabled={word.isInNotebook || addingWordId === word.wordId}
                    className="mt-auto inline-flex min-h-8 w-full items-center justify-center gap-1 rounded-xl border border-slate-200 px-2.5 text-[9px] font-black uppercase tracking-wide text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-600 dark:border-white/10 dark:text-slate-300 dark:disabled:border-emerald-500/20 dark:disabled:bg-emerald-500/10 dark:disabled:text-emerald-300"
                  >
                    {addingWordId === word.wordId ? <Loader2 className="h-3 w-3 animate-spin" /> : word.isInNotebook ? <BookmarkCheck className="h-3 w-3" /> : <BookmarkPlus className="h-3 w-3" />}
                    {word.isInNotebook ? "Đã lưu" : "Lưu"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-slate-200 p-5 dark:border-white/10">
          {initialTopicId && onStartLearning && (
            <Button onClick={() => onStartLearning(initialTopicId)} className="bg-blue-600 hover:bg-blue-700">
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
