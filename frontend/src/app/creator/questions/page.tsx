"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit3, Plus, Search, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  creatorService,
  type CreatorPage as CreatorPageData,
  type CreatorQuestion,
  type CreatorWord,
  type QuestionPayload,
  type QuestionType,
} from "@/src/services/creator.service";
import {
  ConfirmDialog,
  CreatorErrorState,
  CreatorHeader,
  CreatorLoadingState,
  CreatorModal,
  CreatorPage,
  CreatorPagination,
  CreatorPanel,
  CreatorStatusBadge,
  TableShell,
} from "@/src/components/creator/CreatorPrimitives";
import { formatCreatorDate, getCreatorErrorMessage } from "@/src/lib/creator-utils";
import { adminLabel } from "@/src/lib/admin-i18n";

type QuestionForm = Omit<QuestionPayload, "optionsJson"> & { options: string[] };
const questionTypes: QuestionType[] = ["MCQ", "FillBlank", "DragDrop", "Dictation", "FlashcardCheck"];
const emptyForm: QuestionForm = { wordId: 0, questionType: "MCQ", questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" };
const emptyPage: CreatorPageData<CreatorQuestion> = { data: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };

function parseOptions(value?: string) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function CreatorQuestionsPage() {
  const [result, setResult] = useState(emptyPage);
  const [words, setWords] = useState<CreatorWord[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreatorQuestion | null>(null);
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CreatorQuestion | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [questions, wordItems] = await Promise.all([
        creatorService.getQuestionsPage({ page, pageSize: 20, search: search.trim(), status }),
        creatorService.getWords({ pageSize: 100 }),
      ]);
      setResult(questions);
      setWords(wordItems.filter((word) => word.contentStatus !== "Archived"));
    } catch (loadError) {
      setError(getCreatorErrorMessage(loadError, "Không thể tải danh sách câu hỏi"));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, wordId: words[0]?.id || 0 });
    setFormOpen(true);
  }

  function openEdit(question: CreatorQuestion) {
    const options = parseOptions(question.optionsJson);
    setEditing(question);
    setForm({
      wordId: question.wordId,
      questionType: question.questionType,
      questionText: question.questionText,
      options: options.length ? options : ["", "", "", ""],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
    });
    setFormOpen(true);
  }

  function updateOption(index: number, value: string) {
    setForm((current) => {
      const previousValue = current.options[index];
      return {
        ...current,
        options: current.options.map((option, itemIndex) => itemIndex === index ? value : option),
        correctAnswer: current.correctAnswer === previousValue ? value : current.correctAnswer,
      };
    });
  }

  function removeOption(index: number) {
    setForm((current) => {
      const removedValue = current.options[index];
      return {
        ...current,
        options: current.options.filter((_, itemIndex) => itemIndex !== index),
        correctAnswer: current.correctAnswer === removedValue ? "" : current.correctAnswer,
      };
    });
  }

  async function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawOptions = form.options.map((option) => option.trim()).filter(Boolean);
    const options = [...new Set(rawOptions)];
    if (!form.wordId || form.questionText.trim().length < 5 || !form.correctAnswer.trim()) {
      toast.error("Vui lòng chọn từ, nhập câu hỏi ít nhất 5 ký tự và đáp án");
      return;
    }
    if (form.questionType === "MCQ" && options.length < 2) {
      toast.error("Câu trắc nghiệm cần ít nhất hai lựa chọn");
      return;
    }
    if (form.questionType === "MCQ" && options.length !== rawOptions.length) {
      toast.error("Các lựa chọn trắc nghiệm không được trùng nhau");
      return;
    }
    if (form.questionType === "MCQ" && !options.includes(form.correctAnswer.trim())) {
      toast.error("Đáp án đúng phải trùng với một lựa chọn");
      return;
    }
    setSaving(true);
    try {
      const payload: QuestionPayload = {
        wordId: form.wordId,
        questionType: form.questionType,
        questionText: form.questionText.trim(),
        optionsJson: JSON.stringify(form.questionType === "MCQ" ? options : []),
        correctAnswer: form.correctAnswer.trim(),
        explanation: form.explanation?.trim(),
      };
      if (editing) {
        await creatorService.updateQuestion(editing.id, payload);
        toast.success("Cập nhật câu hỏi thành công");
      } else {
        await creatorService.createQuestion(payload);
        toast.success("Tạo câu hỏi thành công");
      }
      setFormOpen(false);
      await load();
    } catch (saveError) {
      toast.error(getCreatorErrorMessage(saveError, "Không thể lưu câu hỏi"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await creatorService.deleteQuestion(deleteTarget.id);
      toast.success("Đã xóa bản nháp câu hỏi");
      setDeleteTarget(null);
      await load();
    } catch (deleteError) {
      toast.error(getCreatorErrorMessage(deleteError, "Không thể xóa câu hỏi"));
    } finally {
      setBusyId(null);
    }
  }

  async function submitReview(question: CreatorQuestion) {
    setBusyId(question.id);
    try {
      await creatorService.submitQuestionForReview(question.id);
      toast.success("Đã gửi câu hỏi để duyệt");
      await load();
    } catch (submitError) {
      toast.error(getCreatorErrorMessage(submitError, "Không thể gửi duyệt"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <CreatorPage>
      <CreatorHeader title="Quản lý câu hỏi" description="Tạo câu hỏi theo đúng loại được hệ thống học và Admin hỗ trợ." action={<Button onClick={openCreate} disabled={!words.length} className="gap-2"><Plus className="h-4 w-4" />Tạo câu hỏi</Button>} />
      <CreatorPanel><div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_200px]"><div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5"><Search className="h-4 w-4 text-slate-500" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm câu hỏi, đáp án hoặc từ vựng" className="w-full bg-transparent text-sm outline-none" /></div><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"><option value="">Tất cả trạng thái</option>{["Draft", "PendingReview", "Published", "Rejected", "Archived"].map((item) => <option key={item} value={item}>{item}</option>)}</select></div></CreatorPanel>

      {error ? <CreatorErrorState description={error} onRetry={() => void load()} /> : loading && !result.data.length ? <CreatorLoadingState label="Đang tải câu hỏi..." /> : (
        <CreatorPanel>
          <TableShell><table className="w-full min-w-[950px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500 dark:border-white/10 dark:bg-white/5"><tr><th className="px-4 py-3">Câu hỏi</th><th className="px-4 py-3">Từ</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-white/10">
            {!result.data.length ? <tr><td colSpan={6} className="px-4 py-14 text-center text-slate-500">Chưa có câu hỏi phù hợp.</td></tr> : result.data.map((question) => {
              const editable = question.contentStatus === "Draft" || question.contentStatus === "Rejected";
              return <tr key={question.id} className="hover:bg-slate-50 dark:hover:bg-white/5"><td className="px-4 py-4"><p className="max-w-lg font-medium text-slate-950 dark:text-white">{question.questionText}</p><p className="mt-1 text-xs text-slate-500">Đáp án: {question.correctAnswer}</p>{question.rejectionReason && <p className="mt-2 text-xs text-rose-500">Lý do: {question.rejectionReason}</p>}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300">{question.wordTerm || `#${question.wordId}`}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300">{adminLabel(question.questionType)}</td><td className="px-4 py-4"><CreatorStatusBadge status={question.contentStatus} /></td><td className="px-4 py-4 text-slate-500">{formatCreatorDate(question.updatedAt || question.createdAt)}</td><td className="px-4 py-4"><div className="flex justify-end gap-1">{editable && <button type="button" disabled={busyId === question.id} onClick={() => void submitReview(question)} title="Gửi duyệt" className="rounded-md p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-500/10"><Send className="h-4 w-4" /></button>}{editable && <button type="button" onClick={() => openEdit(question)} title="Chỉnh sửa" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"><Edit3 className="h-4 w-4" /></button>}{question.contentStatus === "Draft" && <button type="button" onClick={() => setDeleteTarget(question)} title="Xóa" className="rounded-md p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>}</div></td></tr>;
            })}
          </tbody></table></TableShell>
          <div className="mt-4"><CreatorPagination pagination={result} loading={loading} onPageChange={setPage} /></div>
        </CreatorPanel>
      )}

      <CreatorModal open={formOpen} title={editing ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi"} onClose={() => setFormOpen(false)} maxWidth="max-w-3xl">
        <form onSubmit={saveQuestion} className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Từ vựng *"><select value={form.wordId || ""} onChange={(event) => setForm({ ...form, wordId: Number(event.target.value) })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"><option value="">Chọn từ vựng</option>{words.map((word) => <option key={word.id} value={word.id}>{word.term} — {word.meaning}</option>)}</select></Field>
            <Field label="Loại câu hỏi"><select value={form.questionType} onChange={(event) => setForm({ ...form, questionType: event.target.value as QuestionType })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">{questionTypes.map((type) => <option key={type} value={type}>{adminLabel(type)}</option>)}</select></Field>
          </div>
          <Field label="Nội dung câu hỏi *"><textarea value={form.questionText} maxLength={2000} rows={4} onChange={(event) => setForm({ ...form, questionText: event.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" /></Field>
          {form.questionType === "MCQ" && <Field label="Các lựa chọn"><div className="space-y-2">{form.options.map((option, index) => <div key={index} className="flex gap-2"><Input value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Lựa chọn ${index + 1}`} />{form.options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="p-2 text-rose-500"><X className="h-4 w-4" /></button>}</div>)}<Button type="button" variant="outline" onClick={() => setForm((current) => ({ ...current, options: [...current.options, ""] }))}>Thêm lựa chọn</Button></div></Field>}
          <Field label="Đáp án đúng *">
            {form.questionType === "MCQ" ? (
              <select value={form.correctAnswer} onChange={(event) => setForm({ ...form, correctAnswer: event.target.value })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
                <option value="">Chọn đáp án đúng</option>
                {form.options.map((option, index) => option.trim() && <option key={`${index}-${option}`} value={option.trim()}>{option.trim()}</option>)}
              </select>
            ) : (
              <Input value={form.correctAnswer} maxLength={500} onChange={(event) => setForm({ ...form, correctAnswer: event.target.value })} />
            )}
          </Field>
          <Field label="Giải thích"><textarea value={form.explanation || ""} maxLength={2000} rows={3} onChange={(event) => setForm({ ...form, explanation: event.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" /></Field>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10"><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button><Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo câu hỏi"}</Button></div>
        </form>
      </CreatorModal>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Xóa bản nháp câu hỏi?" description="Câu hỏi sẽ bị xóa vĩnh viễn. Nếu đang được dùng trong mini test, hệ thống sẽ yêu cầu gỡ liên kết trước." busy={busyId === deleteTarget?.id} onCancel={() => setDeleteTarget(null)} onConfirm={() => void deleteQuestion()} />
    </CreatorPage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-xs font-semibold uppercase text-slate-500">{label}</label>{children}</div>;
}
