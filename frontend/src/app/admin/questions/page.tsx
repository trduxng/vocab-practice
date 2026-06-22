"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import { toast } from "sonner";
import {
  Check,
  Download,
  Edit2,
  FileQuestion,
  Filter,
  HelpCircle,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, ConfirmDialog, IconButton, KpiCard, StatusBadge, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { adminService, type PaginationMeta } from "@/src/services/admin.service";
import { adminLabel } from "@/src/lib/admin-i18n";

type ContentStatus = "Draft" | "PendingReview" | "Published" | "Rejected" | "Archived";
type QuestionType = "MCQ" | "FillBlank" | "DragDrop" | "Dictation" | "FlashcardCheck" | "AudioRecognition";

type WordItem = {
  id: number;
  term: string;
  meaning: string;
  partOfSpeechName?: string;
  questionCount?: number;
  status?: ContentStatus;
};

type QuestionItem = {
  id: number;
  questionType: QuestionType;
  questionText: string;
  optionsJson?: string;
  correctAnswer: string;
  explanation?: string;
  status?: ContentStatus;
  updatedAt?: string;
};

type QuestionForm = {
  questionType: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  status: ContentStatus;
};

type BulkImportResult = {
  success: number;
  failed: number;
  errors?: Array<{ row: number; message: string }>;
};

const questionTypes: QuestionType[] = ["MCQ", "FillBlank", "Dictation", "DragDrop", "FlashcardCheck", "AudioRecognition"];
const statusOptions: ContentStatus[] = ["Draft", "PendingReview", "Published", "Rejected", "Archived"];

const statusTone: Record<ContentStatus, "slate" | "blue" | "emerald" | "amber" | "rose"> = {
  Draft: "amber",
  PendingReview: "blue",
  Published: "emerald",
  Rejected: "rose",
  Archived: "slate",
};

const emptyForm: QuestionForm = {
  questionType: "MCQ",
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  status: "Published",
};

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  return typeof apiError.response?.data?.message === "string" ? apiError.response.data.message : fallback;
}

function parseOptions(optionsJson?: string) {
  if (!optionsJson) return ["", "", "", ""];
  try {
    const parsed = JSON.parse(optionsJson);
    if (Array.isArray(parsed)) {
      const values = parsed.map((item) => String(item ?? ""));
      return values.length >= 2 ? values : [...values, "", ""].slice(0, 4);
    }
  } catch {
    return ["", "", "", ""];
  }
  return ["", "", "", ""];
}

function compactNumber(value?: number) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function downloadText(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function AdminQuestionsPage() {
  const [words, setWords] = useState<WordItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [wordQuery, setWordQuery] = useState("");
  const [wordPage, setWordPage] = useState(1);
  const [wordPagination, setWordPagination] = useState<PaginationMeta | null>(null);
  const [onlyMissingQuestions, setOnlyMissingQuestions] = useState(false);
  const [loadingWords, setLoadingWords] = useState(true);
  const [wordsError, setWordsError] = useState("");

  const [questionQuery, setQuestionQuery] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("");
  const [questionStatusFilter, setQuestionStatusFilter] = useState("");
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsPagination, setQuestionsPagination] = useState<PaginationMeta | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState("");

  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkImportResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedQuestionCount = questionsPagination?.total ?? questions.length;
  const publishedCount = questions.filter((question) => question.status === "Published").length;
  const draftLikeCount = questions.filter((question) => question.status && question.status !== "Published").length;

  const fetchWords = useCallback(async () => {
    setLoadingWords(true);
    setWordsError("");
    try {
      const response = await adminService.getWordsPage<WordItem>(wordPage, 20, {
        search: wordQuery.trim(),
        missingQuestions: onlyMissingQuestions,
        sortBy: "updatedAt",
        sortDirection: "desc",
      });
      setWords(response.items);
      setWordPagination(response.pagination);
      setSelectedWord((current) => {
        if (!current) return response.items[0] || null;
        return response.items.find((word) => word.id === current.id) || current;
      });
    } catch (error) {
      console.error("Không thể tải từ vựng", error);
      const message = getErrorMessage(error, "Không thể tải danh sách từ vựng");
      setWordsError(message);
      toast.error(message);
    } finally {
      setLoadingWords(false);
    }
  }, [onlyMissingQuestions, wordPage, wordQuery]);

  const fetchQuestions = useCallback(async () => {
    if (!selectedWord) {
      setQuestions([]);
      setQuestionsPagination(null);
      setQuestionsError("");
      return;
    }

    setLoadingQuestions(true);
    setQuestionsError("");
    try {
      const response = await adminService.getQuestionsByWordPage<QuestionItem>(selectedWord.id, questionsPage, 10, {
        search: questionQuery.trim(),
        type: questionTypeFilter,
        status: questionStatusFilter,
      });
      setQuestions(response.items);
      setQuestionsPagination(response.pagination);
    } catch (error) {
      console.error("Không thể tải câu hỏi", error);
      const message = getErrorMessage(error, "Không thể tải danh sách câu hỏi");
      setQuestionsError(message);
      toast.error(message);
    } finally {
      setLoadingQuestions(false);
    }
  }, [questionQuery, questionStatusFilter, questionTypeFilter, questionsPage, selectedWord]);

  useEffect(() => {
    void Promise.resolve().then(fetchWords);
  }, [fetchWords]);

  useEffect(() => {
    void Promise.resolve().then(fetchQuestions);
  }, [fetchQuestions]);

  const questionTypeStats = useMemo(() => {
    return questionTypes.map((type) => ({
      type,
      count: questions.filter((question) => question.questionType === type).length,
    }));
  }, [questions]);

  function selectWord(word: WordItem) {
    setSelectedWord(word);
    setQuestionsPage(1);
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
    if (!selectedWord) return;
    setEditingQuestion(null);
    setForm({
      ...emptyForm,
      questionText: `What is the correct meaning of "${selectedWord.term}"?`,
      correctAnswer: selectedWord.meaning,
      options: [selectedWord.meaning, "", "", ""],
    });
    setShowForm(true);
  }

  function openEditForm(question: QuestionItem) {
    setEditingQuestion(question);
    setForm({
      questionType: question.questionType,
      questionText: question.questionText,
      options: parseOptions(question.optionsJson),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      status: question.status || "Published",
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
      status: form.status,
    };
  }

  async function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedWord) return;

    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingQuestion) {
        await adminService.updateQuestion(editingQuestion.id, payload);
        toast.success("Đã cập nhật câu hỏi");
      } else {
        await adminService.createQuestion(payload);
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
      await adminService.deleteQuestion(deleteTarget.id);
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

  async function importQuestions(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkImporting(true);
    setBulkResult(null);
    try {
      const csv = await file.text();
      const result = await adminService.bulkImportQuestions(csv);
      setBulkResult(result);
      toast.success(`Đã nhập ${result.success} câu hỏi`);
      await Promise.all([fetchQuestions(), fetchWords()]);
    } catch (error) {
      console.error("Không thể nhập câu hỏi", error);
      toast.error(getErrorMessage(error, "Nhập dữ liệu CSV thất bại"));
    } finally {
      setBulkImporting(false);
      event.target.value = "";
    }
  }

  function downloadTemplate() {
    const sampleWordId = selectedWord?.id ? String(selectedWord.id) : "1";
    const rows = [
      ["wordId", "questionType", "questionText", "correctAnswer", "optionsJson", "explanation", "status"],
      [
        sampleWordId,
        "MCQ",
        selectedWord ? `What is the correct meaning of ${selectedWord.term}?` : "What is the correct meaning?",
        selectedWord?.meaning || "correct answer",
        JSON.stringify([selectedWord?.meaning || "correct answer", "distractor 1", "distractor 2", "distractor 3"]),
        "Optional explanation",
        "Published",
      ],
    ];
    downloadText(rows.map((row) => row.map(toCsvCell).join(",")).join("\n"), "question-import-template.csv");
  }

  return (
    <>
      <Topbar title="Quản lý câu hỏi" subtitle="Tạo, sửa, lọc, nhập dữ liệu và duyệt câu hỏi theo từng từ vựng." role="admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Câu hỏi của từ đã chọn" value={compactNumber(selectedQuestionCount)} change={selectedWord?.term || "Chưa chọn từ vựng"} icon={FileQuestion} tone="blue" />
          <KpiCard label="Đã xuất bản trên trang" value={compactNumber(publishedCount)} change={`${draftLikeCount} mục nháp/chờ duyệt`} icon={Check} tone="emerald" />
          <KpiCard label="Kết quả từ vựng" value={compactNumber(wordPagination?.total)} change={onlyMissingQuestions ? "Chỉ từ chưa có câu hỏi" : "Số kết quả tìm kiếm"} icon={ListChecks} tone="violet" />
          <KpiCard label="Kết quả nhập dữ liệu" value={bulkResult ? compactNumber(bulkResult.success) : "0"} change={bulkResult ? `${bulkResult.failed} dòng lỗi` : "Sẵn sàng nhập CSV"} icon={Upload} tone={bulkResult?.failed ? "rose" : "amber"} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <AdminPanel
            title="Từ vựng"
            description="Chọn một từ để quản lý bộ câu hỏi tương ứng."
            action={
              <ToolbarButton onClick={() => void fetchWords()}>
                <RefreshCw className={`h-4 w-4 ${loadingWords ? "animate-spin" : ""}`} />
                Làm mới
              </ToolbarButton>
            }
          >
            <div className="space-y-3">
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
                <Search className="h-4 w-4 shrink-0 text-slate-600" />
                <input
                  value={wordQuery}
                  onChange={(event) => {
                    setWordQuery(event.target.value);
                    setWordPage(1);
                  }}
                  placeholder="Tìm từ hoặc nghĩa"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-600 dark:text-slate-200"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyMissingQuestions}
                  onChange={(event) => {
                    setOnlyMissingQuestions(event.target.checked);
                    setWordPage(1);
                  }}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Hiển thị từ chưa có câu hỏi
              </label>

              <div className="max-h-[650px] space-y-2 overflow-y-auto pr-1">
                {loadingWords && words.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Đang tải từ vựng...
                  </div>
                ) : wordsError ? (
                  <InlineError message={wordsError} onRetry={() => void fetchWords()} />
                ) : words.length === 0 ? (
                  <EmptyState icon={HelpCircle} title="Không tìm thấy từ vựng" description="Hãy thử từ khóa khác hoặc bỏ bộ lọc từ chưa có câu hỏi." />
                ) : (
                  words.map((word) => (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => selectWord(word)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selectedWord?.id === word.id
                          ? "border-blue-400 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950 dark:text-white">{word.term}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{word.meaning}</p>
                        </div>
                        <StatusBadge tone={Number(word.questionCount || 0) > 0 ? "emerald" : "amber"}>{Number(word.questionCount || 0)}</StatusBadge>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{word.partOfSpeechName ? adminLabel(word.partOfSpeechName) : "Chưa có loại từ"}</p>
                    </button>
                  ))
                )}
              </div>

              {wordPagination && (
                <PaginationBar
                  pagination={wordPagination}
                  loading={loadingWords}
                  onPageChange={(page) => setWordPage(page)}
                />
              )}
            </div>
          </AdminPanel>

          <div className="space-y-5">
            <AdminPanel
              title={selectedWord ? selectedWord.term : "Chưa chọn từ vựng"}
              description={selectedWord ? selectedWord.meaning : "Hãy chọn một từ vựng trước khi tạo câu hỏi."}
              action={
                <div className="flex flex-wrap gap-2">
                  <ToolbarButton onClick={downloadTemplate}>
                    <Download className="h-4 w-4" />
                    CSV mẫu
                  </ToolbarButton>
                  <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white">
                    <Upload className="h-4 w-4" />
                    {bulkImporting ? "Đang nhập..." : "Nhập CSV"}
                    <input type="file" accept=".csv,text/csv,text/plain" className="hidden" disabled={bulkImporting} onChange={importQuestions} />
                  </label>
                  <ToolbarButton active onClick={openCreateForm}>
                    <Plus className="h-4 w-4" />
                    Câu hỏi mới
                  </ToolbarButton>
                </div>
              }
            >
              {bulkResult && (
                <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  Đã nhập {bulkResult.success} dòng, lỗi {bulkResult.failed} dòng.
                  {bulkResult.errors?.length ? (
                    <div className="mt-2 max-h-24 overflow-auto text-xs text-rose-500">
                      {bulkResult.errors.slice(0, 5).map((error) => (
                        <p key={`${error.row}-${error.message}`}>Dòng {error.row}: {error.message}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {showForm && selectedWord && (
                <form onSubmit={saveQuestion} className="mb-5 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{editingQuestion ? "Sửa câu hỏi" : "Tạo câu hỏi"}</h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Gắn với từ {selectedWord.term}</p>
                    </div>
                    <IconButton label="Đóng biểu mẫu" onClick={resetForm}><X className="h-4 w-4" /></IconButton>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Field label="Loại câu hỏi">
                      <Select value={form.questionType} onChange={(value) => setForm((current) => ({ ...current, questionType: value as QuestionType }))}>
                        {questionTypes.map((type) => <option key={type} value={type}>{adminLabel(type)}</option>)}
                      </Select>
                    </Field>
                    <Field label="Trạng thái">
                      <Select value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value as ContentStatus }))}>
                        {statusOptions.map((status) => <option key={status} value={status}>{adminLabel(status)}</option>)}
                      </Select>
                    </Field>
                    <Field label="Đáp án đúng">
                      <Input value={form.correctAnswer} onChange={(event) => setForm((current) => ({ ...current, correctAnswer: event.target.value }))} className="h-10 rounded-md" required />
                    </Field>
                  </div>

                  <Field label="Nội dung câu hỏi">
                    <Textarea
                      value={form.questionText}
                      onChange={(event) => setForm((current) => ({ ...current, questionText: event.target.value }))}
                      className="min-h-24 rounded-md"
                      required
                    />
                  </Field>

                  {form.questionType === "MCQ" && (
                    <Field label="Các lựa chọn">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {form.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-xs font-semibold text-slate-500 dark:border-white/10">{String.fromCharCode(65 + index)}</span>
                            <Input value={option} onChange={(event) => updateOption(index, event.target.value)} className="h-10 rounded-md" />
                            <button type="button" onClick={() => setForm((current) => ({ ...current, correctAnswer: option }))} className="h-10 rounded-md border border-slate-200 px-2 text-xs text-slate-500 dark:border-white/10">Chọn</button>
                            {form.options.length > 2 && <IconButton label="Xóa lựa chọn" tone="rose" onClick={() => removeOption(index)}><X className="h-4 w-4" /></IconButton>}
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" onClick={addOption} className="mt-2 h-9 rounded-md">Thêm lựa chọn</Button>
                    </Field>
                  )}

                  <Field label="Giải thích">
                    <Textarea value={form.explanation} onChange={(event) => setForm((current) => ({ ...current, explanation: event.target.value }))} className="min-h-20 rounded-md" />
                  </Field>

                  <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                    <Button type="button" variant="ghost" onClick={resetForm} className="rounded-md">Hủy</Button>
                    <Button type="submit" disabled={saving} className="rounded-md bg-blue-600 hover:bg-blue-700">
                      {saving ? "Đang lưu..." : editingQuestion ? "Cập nhật câu hỏi" : "Tạo câu hỏi"}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
                  <Search className="h-4 w-4 shrink-0 text-slate-600" />
                  <input
                    value={questionQuery}
                    onChange={(event) => {
                      setQuestionQuery(event.target.value);
                      setQuestionsPage(1);
                    }}
                    placeholder="Tìm nội dung, đáp án hoặc giải thích"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-600 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <Select value={questionTypeFilter} onChange={(value) => { setQuestionTypeFilter(value); setQuestionsPage(1); }}>
                    <option value="">Tất cả loại câu hỏi</option>
                    {questionTypes.map((type) => <option key={type} value={type}>{adminLabel(type)}</option>)}
                  </Select>
                  <Select value={questionStatusFilter} onChange={(value) => { setQuestionStatusFilter(value); setQuestionsPage(1); }}>
                    <option value="">Tất cả trạng thái</option>
                    {statusOptions.map((status) => <option key={status} value={status}>{adminLabel(status)}</option>)}
                  </Select>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {questionTypeStats.filter((item) => item.count > 0).map((item) => (
                  <StatusBadge key={item.type} tone="slate">{adminLabel(item.type)}: {item.count}</StatusBadge>
                ))}
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Câu hỏi</th>
                      <th className="px-4 py-3 font-medium">Loại</th>
                      <th className="px-4 py-3 font-medium">Đáp án</th>
                      <th className="px-4 py-3 font-medium">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {loadingQuestions ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                          Đang tải câu hỏi...
                        </td>
                      </tr>
                    ) : questionsError ? (
                      <tr><td colSpan={5}><InlineError message={questionsError} onRetry={() => void fetchQuestions()} /></td></tr>
                    ) : !selectedWord ? (
                      <tr><td colSpan={5}><EmptyState icon={HelpCircle} title="Chọn một từ vựng" description="Danh sách câu hỏi được tải theo từng từ vựng." /></td></tr>
                    ) : questions.length === 0 ? (
                      <tr><td colSpan={5}><EmptyState icon={FileQuestion} title="Chưa có câu hỏi" description="Hãy tạo thủ công hoặc nhập từ tệp CSV." /></td></tr>
                    ) : questions.map((question) => (
                      <tr key={question.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="px-4 py-4">
                          <p className="max-w-xl font-medium text-slate-950 dark:text-white">{question.questionText}</p>
                          <QuestionOptions optionsJson={question.optionsJson} />
                          {question.explanation && <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{question.explanation}</p>}
                        </td>
                        <td className="px-4 py-4"><StatusBadge tone="blue">{adminLabel(question.questionType)}</StatusBadge></td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{question.correctAnswer}</td>
                        <td className="px-4 py-4">
                          <StatusBadge tone={statusTone[question.status || "Published"]}>{adminLabel(question.status || "Published")}</StatusBadge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <IconButton label="Sửa câu hỏi" onClick={() => openEditForm(question)}><Edit2 className="h-4 w-4" /></IconButton>
                            <IconButton label="Xóa câu hỏi" tone="rose" onClick={() => setDeleteTarget(question)}><Trash2 className="h-4 w-4" /></IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {questionsPagination && (
                <div className="mt-4">
                  <PaginationBar pagination={questionsPagination} loading={loadingQuestions} onPageChange={(page) => setQuestionsPage(page)} />
                </div>
              )}
            </AdminPanel>
          </div>
        </div>
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Xóa câu hỏi?"
          description="Câu hỏi sẽ bị xóa và tự động được gỡ khỏi các mini test liên quan. Thao tác này không thể hoàn tác."
          busy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void deleteQuestion()}
        />
      </AdminPage>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
    >
      {children}
    </select>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="py-12 text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-10 text-center text-sm text-rose-500">
      <p>{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10">
        Thử lại
      </button>
    </div>
  );
}

function PaginationBar({ pagination, loading, onPageChange }: { pagination: PaginationMeta; loading: boolean; onPageChange: (page: number) => void }) {
  return (
    <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
      <span>Trang {pagination.page} / {pagination.totalPages} - {pagination.total} bản ghi</span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" disabled={pagination.page <= 1 || loading} onClick={() => onPageChange(Math.max(1, pagination.page - 1))} className="rounded-md">Trước</Button>
        <Button type="button" variant="ghost" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))} className="rounded-md">Sau</Button>
      </div>
    </div>
  );
}

function QuestionOptions({ optionsJson }: { optionsJson?: string }) {
  const options = parseOptions(optionsJson).filter(Boolean);
  if (!options.length) return null;

  return (
    <div className="mt-2 flex max-w-xl flex-wrap gap-1.5">
      {options.map((option, index) => (
        <span key={`${option}-${index}`} className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          {String.fromCharCode(65 + index)}. {option}
        </span>
      ))}
    </div>
  );
}
