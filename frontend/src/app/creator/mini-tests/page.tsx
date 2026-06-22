"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Edit3, Plus, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  creatorService,
  type CreatorMiniTest,
  type CreatorPage as CreatorPageData,
  type CreatorQuestion,
  type CreatorTopic,
  type MiniTestPayload,
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
} from "@/src/components/creator/CreatorPrimitives";
import { formatCreatorDate, getCreatorErrorMessage } from "@/src/lib/creator-utils";
import { adminLabel } from "@/src/lib/admin-i18n";

type FormState = { title: string; description: string; topicId: string; questionIds: number[] };
const emptyForm: FormState = { title: "", description: "", topicId: "", questionIds: [] };
const emptyPage: CreatorPageData<CreatorMiniTest> = { data: [], total: 0, page: 1, pageSize: 12, totalPages: 1 };

export default function CreatorMiniTestsPage() {
  const [result, setResult] = useState(emptyPage);
  const [topics, setTopics] = useState<CreatorTopic[]>([]);
  const [questions, setQuestions] = useState<CreatorQuestion[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreatorMiniTest | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CreatorMiniTest | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tests, topicItems, questionItems] = await Promise.all([
        creatorService.getMiniTestsPage({ page, pageSize: 12, search: search.trim(), status }),
        creatorService.getTopics({ pageSize: 100 }),
        creatorService.getQuestions({ pageSize: 100, status: "Published" }),
      ]);
      setResult(tests);
      setTopics(topicItems.filter((topic) => topic.contentStatus !== "Archived"));
      setQuestions(questionItems);
    } catch (loadError) {
      setError(getCreatorErrorMessage(loadError, "Không thể tải mini test"));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const filteredQuestions = useMemo(() => {
    const query = questionSearch.trim().toLowerCase();
    if (!query) return questions;
    return questions.filter((question) => `${question.questionText} ${question.wordTerm} ${question.questionType}`.toLowerCase().includes(query));
  }, [questionSearch, questions]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setQuestionSearch("");
    setFormOpen(true);
  }

  function openEdit(test: CreatorMiniTest) {
    setEditing(test);
    setForm({ title: test.title, description: test.description || "", topicId: test.topicId ? String(test.topicId) : "", questionIds: test.questionIds || [] });
    setQuestionSearch("");
    setFormOpen(true);
  }

  function toggleQuestion(id: number) {
    setForm((current) => ({ ...current, questionIds: current.questionIds.includes(id) ? current.questionIds.filter((item) => item !== id) : [...current.questionIds, id] }));
  }

  async function saveTest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.title.trim().length < 3) {
      toast.error("Tiêu đề cần ít nhất 3 ký tự");
      return;
    }
    if (!form.questionIds.length) {
      toast.error("Mini test cần ít nhất một câu hỏi đã xuất bản");
      return;
    }
    setSaving(true);
    try {
      const payload: MiniTestPayload = { title: form.title.trim(), description: form.description.trim(), topicId: form.topicId ? Number(form.topicId) : null, questionIds: form.questionIds };
      if (editing) {
        await creatorService.updateMiniTest(editing.id, payload);
        toast.success("Cập nhật mini test thành công");
      } else {
        await creatorService.createMiniTest(payload);
        toast.success("Tạo mini test thành công");
      }
      setFormOpen(false);
      await load();
    } catch (saveError) {
      toast.error(getCreatorErrorMessage(saveError, "Không thể lưu mini test"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteTest() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await creatorService.deleteMiniTest(deleteTarget.id);
      toast.success("Đã xóa bản nháp mini test");
      setDeleteTarget(null);
      await load();
    } catch (deleteError) {
      toast.error(getCreatorErrorMessage(deleteError, "Không thể xóa mini test"));
    } finally {
      setBusyId(null);
    }
  }

  async function submitReview(test: CreatorMiniTest) {
    setBusyId(test.id);
    try {
      await creatorService.submitMiniTestForReview(test.id);
      toast.success("Đã gửi mini test để duyệt");
      await load();
    } catch (submitError) {
      toast.error(getCreatorErrorMessage(submitError, "Không thể gửi duyệt"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <CreatorPage>
      <CreatorHeader title="Quản lý mini test" description="Tạo bài kiểm tra từ các câu hỏi đã được Admin xuất bản." action={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Tạo mini test</Button>} />
      <CreatorPanel><div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_200px]"><div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5"><Search className="h-4 w-4 text-slate-500" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm tiêu đề hoặc mô tả" className="w-full bg-transparent text-sm outline-none" /></div><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"><option value="">Tất cả trạng thái</option>{["Draft", "PendingReview", "Published", "Rejected", "Archived"].map((item) => <option key={item} value={item}>{item}</option>)}</select></div></CreatorPanel>

      {error ? <CreatorErrorState description={error} onRetry={() => void load()} /> : loading && !result.data.length ? <CreatorLoadingState label="Đang tải mini test..." /> : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.data.map((test) => {
              const editable = test.contentStatus === "Draft" || test.contentStatus === "Rejected";
              return <CreatorPanel key={test.id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-950 dark:text-white">{test.title}</h2><p className="mt-1 text-xs text-slate-500">{test.topicName || "Tổng hợp"} · {test.totalQuestions} câu hỏi</p></div><CreatorStatusBadge status={test.contentStatus} /></div><p className="mt-4 line-clamp-2 min-h-10 text-sm text-slate-600 dark:text-slate-400">{test.description || "Chưa có mô tả."}</p>{test.rejectionReason && <p className="mt-3 text-xs text-rose-500">Lý do: {test.rejectionReason}</p>}<p className="mt-4 text-xs text-slate-400">{formatCreatorDate(test.updatedAt || test.createdAt)}</p><div className="mt-4 flex justify-end gap-1 border-t border-slate-200 pt-3 dark:border-white/10">{editable && <button type="button" disabled={busyId === test.id} onClick={() => void submitReview(test)} title="Gửi duyệt" className="rounded-md p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-500/10"><Send className="h-4 w-4" /></button>}{editable && <button type="button" onClick={() => openEdit(test)} title="Chỉnh sửa" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"><Edit3 className="h-4 w-4" /></button>}{test.contentStatus === "Draft" && <button type="button" onClick={() => setDeleteTarget(test)} title="Xóa" className="rounded-md p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>}</div></CreatorPanel>;
            })}
            {!result.data.length && <CreatorPanel><p className="py-12 text-center text-slate-500">Chưa có mini test phù hợp.</p></CreatorPanel>}
          </div>
          <CreatorPanel><CreatorPagination pagination={result} loading={loading} onPageChange={setPage} /></CreatorPanel>
        </>
      )}

      <CreatorModal open={formOpen} title={editing ? "Chỉnh sửa mini test" : "Tạo mini test"} description="Chỉ các câu hỏi đã xuất bản mới có thể đưa vào bài test." onClose={() => setFormOpen(false)} maxWidth="max-w-4xl">
        <form onSubmit={saveTest} className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Tiêu đề *"><Input value={form.title} maxLength={255} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field><Field label="Chủ đề"><select value={form.topicId} onChange={(event) => setForm({ ...form, topicId: event.target.value })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"><option value="">Không gắn chủ đề</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></Field></div>
          <Field label="Mô tả"><textarea value={form.description} maxLength={1000} rows={3} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" /></Field>
          <Field label={`Câu hỏi đã chọn: ${form.questionIds.length}`}><div className="mb-3 flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5"><Search className="h-4 w-4 text-slate-500" /><input value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder="Lọc câu hỏi" className="w-full bg-transparent text-sm outline-none" /></div><div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto rounded-md border border-slate-200 p-3 md:grid-cols-2 dark:border-white/10">{filteredQuestions.map((question) => { const selected = form.questionIds.includes(question.id); return <button type="button" key={question.id} onClick={() => toggleQuestion(question.id)} className={`flex items-start gap-3 rounded-md border p-3 text-left ${selected ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-slate-200 dark:border-white/10"}`}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>{selected && <Check className="h-3 w-3" />}</span><span><span className="line-clamp-2 text-sm font-medium">{question.questionText}</span><span className="mt-1 block text-xs text-slate-500">{question.wordTerm} · {adminLabel(question.questionType)}</span></span></button>; })}{!filteredQuestions.length && <p className="col-span-full py-10 text-center text-sm text-slate-500">Chưa có câu hỏi đã xuất bản.</p>}</div></Field>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10"><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button><Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo mini test"}</Button></div>
        </form>
      </CreatorModal>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Xóa bản nháp mini test?" description={`Mini test "${deleteTarget?.title || ""}" sẽ bị xóa vĩnh viễn.`} busy={busyId === deleteTarget?.id} onCancel={() => setDeleteTarget(null)} onConfirm={() => void deleteTest()} />
    </CreatorPage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-xs font-semibold uppercase text-slate-500">{label}</label>{children}</div>;
}
