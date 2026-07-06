"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Edit2, FileQuestion, HelpCircle, Loader2, Plus, Search, Send, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { aiService } from "@/src/services/ai.service";
import { creatorService, type Question, type Word } from "@/src/services/creator.service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

type QuestionType = "MCQ" | "FillBlank" | "DragDrop" | "Dictation" | "FlashcardCheck" | "AudioRecognition";
type QuestionStatus = "Draft" | "PendingReview" | "Published" | "Rejected" | "Archived";

type QuestionForm = {
  questionType: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

const questionTypes: QuestionType[] = ["MCQ", "FillBlank", "Dictation", "DragDrop", "FlashcardCheck", "AudioRecognition"];

const labels: Record<string, string> = {
  Draft: "Bản nháp",
  PendingReview: "Chờ duyệt",
  Published: "Đã xuất bản",
  Rejected: "Bị từ chối",
  Archived: "Đã lưu trữ",
  MCQ: "Trắc nghiệm",
  FillBlank: "Điền khuyết",
  DragDrop: "Kéo thả",
  Dictation: "Nghe chép",
  FlashcardCheck: "Flashcard check",
  AudioRecognition: "Nhận diện audio",
};

const statusTone: Record<QuestionStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  PendingReview: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  Published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
  Rejected: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300",
  Archived: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

const emptyForm: QuestionForm = {
  questionType: "MCQ",
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
};

function parseOptions(optionsJson?: string) {
  if (!optionsJson) return ["", "", "", ""];
  try {
    const parsed = JSON.parse(optionsJson);
    if (Array.isArray(parsed)) {
      const options = parsed.map((item) => String(item ?? ""));
      return options.length >= 2 ? options : [...options, "", ""].slice(0, 4);
    }
  } catch {
    return ["", "", "", ""];
  }
  return ["", "", "", ""];
}

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  return typeof apiError.response?.data?.message === "string" ? apiError.response.data.message : fallback;
}

export default function CreatorQuestionsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [wordQuery, setWordQuery] = useState("");
  const [questionQuery, setQuestionQuery] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("");
  const [questionStatusFilter, setQuestionStatusFilter] = useState("");
  const [loadingWords, setLoadingWords] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [form, setForm] = useState<QuestionForm>(emptyForm);

  const filteredWords = useMemo(() => {
    const query = wordQuery.trim().toLowerCase();
    if (!query) return words;
    return words.filter((word) => `${word.term} ${word.meaning} ${word.partOfSpeechName || ""}`.toLowerCase().includes(query));
  }, [wordQuery, words]);

  const publishedCount = questions.filter((question) => question.contentStatus === "Published").length;
  const pendingCount = questions.filter((question) => question.contentStatus && question.contentStatus !== "Published").length;

  const fetchWords = useCallback(async () => {
    setLoadingWords(true);
    try {
      const wordList = await creatorService.getWords({ pageSize: 200 });
      setWords(wordList);
      setSelectedWord((current) => current || wordList[0] || null);
    } catch (error) {
      console.error("Không thể tải từ vựng", error);
      toast.error(getErrorMessage(error, "Không thể tải danh sách từ vựng"));
    } finally {
      setLoadingWords(false);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    if (!selectedWord) {
      setQuestions([]);
      return;
    }
    setLoadingQuestions(true);
    try {
      const questionList = await creatorService.getQuestions({
        wordId: selectedWord.id,
        search: questionQuery.trim(),
        type: questionTypeFilter,
        status: questionStatusFilter,
        pageSize: 100,
      });
      setQuestions(questionList);
    } catch (error) {
      console.error("Không thể tải câu hỏi", error);
      toast.error(getErrorMessage(error, "Không thể tải danh sách câu hỏi"));
    } finally {
      setLoadingQuestions(false);
    }
  }, [questionQuery, questionStatusFilter, questionTypeFilter, selectedWord]);

  useEffect(() => {
    void fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  function selectWord(word: Word) {
    setSelectedWord(word);
    setQuestionQuery("");
    setQuestionTypeFilter("");
    setQuestionStatusFilter("");
    resetForm();
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingQuestion(null);
    setShowForm(false);
  }

  function openCreateForm() {
    if (!selectedWord) {
      toast.error("Hãy chọn từ vựng trước");
      return;
    }
    setEditingQuestion(null);
    setForm({
      ...emptyForm,
      questionText: `What is the correct meaning of "${selectedWord.term}"?`,
      correctAnswer: selectedWord.meaning,
      options: [selectedWord.meaning, "", "", ""],
    });
    setShowForm(true);
  }

  function openEditForm(question: Question) {
    setEditingQuestion(question);
    setForm({
      questionType: question.questionType as QuestionType,
      questionText: question.questionText,
      options: parseOptions(question.optionsJson),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
    });
    setShowForm(true);
  }

  function updateOption(index: number, value: string) {
    setForm((current) => {
      const nextOptions = [...current.options];
      nextOptions[index] = value;
      return { ...current, options: nextOptions };
    });
  }

  function addOption() {
    setForm((current) => ({ ...current, options: [...current.options, ""] }));
  }

  function removeOption(index: number) {
    setForm((current) => ({ ...current, options: current.options.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function handleSuggestQuestionContent() {
    if (!selectedWord) {
      toast.error("Hãy chọn từ vựng trước khi dùng AI");
      return;
    }
    setGeneratingDraft(true);
    try {
      const suggestion = await aiService.suggestQuestionContent({
        wordId: selectedWord.id,
        term: selectedWord.term,
        meaning: selectedWord.meaning,
        questionType: form.questionType,
        optionCount: Math.max(2, form.options.length || 4),
      });
      const options = parseOptions(suggestion.optionsJson).filter((item) => item.trim());
      setForm((current) => ({
        ...current,
        questionText: suggestion.questionText || current.questionText,
        options: options.length > 0 ? options : current.options,
        correctAnswer: suggestion.correctAnswer || current.correctAnswer,
        explanation: suggestion.explanation || current.explanation,
      }));
      toast.success("AI đã gợi ý câu hỏi");
    } catch (error) {
      console.error("Không thể tạo gợi ý câu hỏi", error);
      toast.error(getErrorMessage(error, "Không thể tạo gợi ý AI"));
    } finally {
      setGeneratingDraft(false);
    }
  }

  function buildPayload() {
    if (!selectedWord) throw new Error("Vui lòng chọn từ vựng trước");
    const questionText = form.questionText.trim();
    const correctAnswer = form.correctAnswer.trim();
    const options = form.options.map((option) => option.trim()).filter(Boolean);

    if (questionText.length < 5) throw new Error("Nội dung câu hỏi phải có ít nhất 5 ký tự");
    if (!correctAnswer) throw new Error("Vui lòng nhập đáp án đúng");
    if (form.questionType === "MCQ" && options.length < 2) throw new Error("Câu trắc nghiệm cần ít nhất 2 lựa chọn");

    return {
      wordId: selectedWord.id,
      questionType: form.questionType,
      questionText,
      optionsJson: JSON.stringify(form.questionType === "MCQ" ? options : []),
      correctAnswer,
      explanation: form.explanation.trim() || undefined,
    };
  }

  async function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingQuestion) {
        await creatorService.updateQuestion(editingQuestion.id, payload);
        toast.success("Đã cập nhật câu hỏi");
      } else {
        await creatorService.createQuestion(payload);
        toast.success("Đã tạo câu hỏi");
      }
      resetForm();
      await Promise.all([fetchQuestions(), fetchWords()]);
    } catch (error) {
      console.error("Không thể lưu câu hỏi", error);
      toast.error(error instanceof Error ? error.message : getErrorMessage(error, "Không thể lưu câu hỏi"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await creatorService.deleteQuestion(deleteTarget.id);
      toast.success("Đã xóa câu hỏi");
      setDeleteTarget(null);
      await Promise.all([fetchQuestions(), fetchWords()]);
    } catch (error) {
      console.error("Không thể xóa câu hỏi", error);
      toast.error(getErrorMessage(error, "Không thể xóa câu hỏi"));
    } finally {
      setDeleting(false);
    }
  }

  async function submitForReview(question: Question) {
    setSubmittingId(question.id);
    try {
      await creatorService.submitQuestionForReview(question.id);
      toast.success("Đã gửi câu hỏi để duyệt");
      await fetchQuestions();
    } catch (error) {
      console.error("Không thể gửi duyệt câu hỏi", error);
      toast.error(getErrorMessage(error, "Không thể gửi duyệt"));
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý câu hỏi</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Chọn từ vựng, tạo câu hỏi bằng AI, rồi gửi admin duyệt.</p>
        </div>
        <Button onClick={openCreateForm} disabled={!selectedWord} className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Tạo câu hỏi
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Từ vựng</h2>
              <p className="text-xs text-slate-500">Chọn từ để quản lý câu hỏi</p>
            </div>
            <Badge>{filteredWords.length} từ</Badge>
          </div>
          <div className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-white/10 dark:bg-slate-950">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={wordQuery} onChange={(event) => setWordQuery(event.target.value)} placeholder="Tìm từ vựng..." className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="mt-4 max-h-[64vh] space-y-2 overflow-y-auto pr-1">
            {loadingWords ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tải từ...</div>
            ) : filteredWords.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">Không có từ vựng phù hợp.</p>
            ) : filteredWords.map((word) => {
              const selected = selectedWord?.id === word.id;
              return (
                <button key={word.id} type="button" onClick={() => selectWord(word)} className={`w-full rounded-xl border p-3 text-left transition-colors ${selected ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]"}`}>
                  <span className="block font-semibold text-slate-900 dark:text-white">{word.term}</span>
                  <span className="mt-1 line-clamp-2 block text-xs text-slate-500">{word.meaning}</span>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-white/10">{word.partOfSpeechName || "—"}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Kpi label="Tổng câu hỏi" value={questions.length} icon={<FileQuestion className="h-5 w-5" />} />
            <Kpi label="Đã xuất bản" value={publishedCount} icon={<Check className="h-5 w-5" />} />
            <Kpi label="Đang xử lý" value={pendingCount} icon={<HelpCircle className="h-5 w-5" />} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px]">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-white/10 dark:bg-slate-950">
                <Search className="h-4 w-4 text-slate-500" />
                <input value={questionQuery} onChange={(event) => setQuestionQuery(event.target.value)} placeholder="Tìm câu hỏi, đáp án..." className="w-full bg-transparent text-sm outline-none" />
              </div>
              <select value={questionTypeFilter} onChange={(event) => setQuestionTypeFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
                <option value="">Tất cả loại</option>
                {questionTypes.map((type) => <option key={type} value={type}>{labels[type]}</option>)}
              </select>
              <select value={questionStatusFilter} onChange={(event) => setQuestionStatusFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
                <option value="">Tất cả trạng thái</option>
                {["Draft", "PendingReview", "Published", "Rejected", "Archived"].map((status) => <option key={status} value={status}>{labels[status]}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
            <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <h2 className="font-semibold">{selectedWord ? `Câu hỏi cho “${selectedWord.term}”` : "Chọn từ vựng"}</h2>
              <p className="text-xs text-slate-500">Creator chỉ gửi duyệt; publish/archive do admin xử lý.</p>
            </div>
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-16 text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tải câu hỏi...</div>
            ) : questions.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center text-center">
                <FileQuestion className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-semibold">Chưa có câu hỏi</p>
                <p className="mt-1 text-sm text-slate-500">Tạo câu hỏi đầu tiên cho từ vựng đang chọn.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/10">
                {questions.map((question) => (
                  <article key={question.id} className="p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{labels[question.questionType] || question.questionType}</Badge>
                          <Badge className={statusTone[question.contentStatus as QuestionStatus] || statusTone.Draft}>{labels[question.contentStatus] || question.contentStatus}</Badge>
                        </div>
                        <h3 className="mt-3 line-clamp-2 font-semibold text-slate-950 dark:text-white">{question.questionText}</h3>
                        <p className="mt-2 text-sm text-slate-500">Đáp án: <span className="font-medium text-slate-700 dark:text-slate-300">{question.correctAnswer}</span></p>
                        {question.explanation && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{question.explanation}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {(question.contentStatus === "Draft" || question.contentStatus === "Rejected") && (
                          <button type="button" disabled={submittingId === question.id} onClick={() => void submitForReview(question)} title="Gửi duyệt" className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-500/10">
                            {submittingId === question.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        )}
                        <button type="button" onClick={() => openEditForm(question)} title="Sửa" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"><Edit2 className="h-4 w-4" /></button>
                        {(question.contentStatus === "Draft" || question.contentStatus === "PendingReview") && (
                          <button type="button" onClick={() => setDeleteTarget(question)} title="Xóa" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" onClick={resetForm}>
          <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950">
              <div>
                <h2 className="font-semibold text-slate-950 dark:text-white">{editingQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi"}</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedWord ? `Từ vựng: ${selectedWord.term}` : "Chọn từ trước khi tạo câu hỏi"}</p>
              </div>
              <button type="button" onClick={resetForm} aria-label="Đóng"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={saveQuestion} className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Loại câu hỏi">
                  <select value={form.questionType} onChange={(event) => setForm((current) => ({ ...current, questionType: event.target.value as QuestionType }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
                    {questionTypes.map((type) => <option key={type} value={type}>{labels[type]}</option>)}
                  </select>
                </Field>
                <div className="flex items-end">
                  <Button type="button" variant="outline" onClick={() => void handleSuggestQuestionContent()} disabled={generatingDraft} className="w-full gap-2 rounded-xl">
                    {generatingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Gợi ý AI
                  </Button>
                </div>
              </div>
              <Field label="Nội dung câu hỏi *">
                <Textarea value={form.questionText} rows={4} onChange={(event) => setForm((current) => ({ ...current, questionText: event.target.value }))} />
              </Field>
              {form.questionType === "MCQ" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Options</label>
                    <Button type="button" variant="outline" onClick={addOption} className="rounded-xl text-xs">Thêm option</Button>
                  </div>
                  <div className="space-y-2">
                    {form.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Lựa chọn ${index + 1}`} />
                        {form.options.length > 2 && <Button type="button" variant="outline" onClick={() => removeOption(index)} className="rounded-xl px-3"><X className="h-4 w-4" /></Button>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Đáp án đúng *">
                  <Input value={form.correctAnswer} onChange={(event) => setForm((current) => ({ ...current, correctAnswer: event.target.value }))} />
                </Field>
                <Field label="Giải thích">
                  <Input value={form.explanation} onChange={(event) => setForm((current) => ({ ...current, explanation: event.target.value }))} />
                </Field>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                <Button type="button" variant="outline" onClick={resetForm}>Hủy</Button>
                <Button type="submit" disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingQuestion ? "Lưu thay đổi" : "Tạo câu hỏi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-950">
            <h2 className="text-lg font-semibold">Xóa câu hỏi?</h2>
            <p className="mt-2 text-sm text-slate-500">Câu hỏi này sẽ bị xóa nếu đang ở trạng thái cho phép. Thao tác này không thể hoàn tác.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
              <Button type="button" disabled={deleting} onClick={() => void deleteQuestion()} className="gap-2 bg-rose-600 hover:bg-rose-700">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function Badge({ children, className = "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300" }: { children: React.ReactNode; className?: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">{icon}</div>
      </div>
    </div>
  );
}
