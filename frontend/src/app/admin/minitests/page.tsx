"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  Check,
  Edit3,
  FileText,
  ListChecks,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Topbar from "@/src/components/shared/Topbar";
import {
  AdminErrorState,
  AdminLoadingState,
  AdminPage,
  AdminPanel,
  ConfirmDialog,
  StatusBadge,
  ToolbarButton,
} from "@/src/components/admin/AdminPrimitives";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { adminService, type PaginationMeta } from "@/src/services/admin.service";
import { adminLabel } from "@/src/lib/admin-i18n";

type MiniTestItem = {
  id: number;
  title: string;
  description?: string;
  topicId?: number | null;
  topicName?: string;
  totalQuestions: number;
  status?: string;
  questionIds?: number[];
};

type TopicOption = { id: number; name: string };
type WordItem = { id: number; term: string };
type ApiQuestion = { id: number; questionText: string; questionType: string };
type QuestionItem = ApiQuestion & { term: string };
type TestForm = {
  title: string;
  description: string;
  topicId: string;
  selectedQuestionIds: number[];
};

const emptyForm: TestForm = {
  title: "",
  description: "",
  topicId: "",
  selectedQuestionIds: [],
};

const defaultPagination: PaginationMeta = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
};

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  return typeof apiError.response?.data?.message === "string" ? apiError.response.data.message : fallback;
}

export default function AdminMiniTestsPage() {
  const [tests, setTests] = useState<MiniTestItem[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [topicId, setTopicId] = useState("");
  const [questionFilter, setQuestionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [referencesLoading, setReferencesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MiniTestItem | null>(null);
  const [form, setForm] = useState<TestForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<MiniTestItem | null>(null);
  const pageSize = 12;

  const loadTests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getMiniTestsPage<MiniTestItem>(page, pageSize, {
        search: search.trim(),
        status,
        topicId,
      });
      setTests(data.items);
      setPagination(data.pagination);
    } catch (loadError) {
      console.error("Không thể tải mini test", loadError);
      setError(getErrorMessage(loadError, "Không thể tải danh sách mini test."));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, topicId]);

  const loadReferences = useCallback(async () => {
    setReferencesLoading(true);
    try {
      const [topicData, words] = await Promise.all([
        adminService.getTopicsPage<TopicOption>(1, 100, { status: "Published" }),
        adminService.getWords<WordItem>(1, 100),
      ]);
      setTopics(topicData.items);

      const questionGroups = await Promise.all(
        words.map(async (word) => {
          const items = await adminService.getQuestionsByWord<ApiQuestion>(word.id, 1, 100);
          return items.map((question) => ({ ...question, term: word.term }));
        }),
      );
      setQuestions(questionGroups.flat());
    } catch (loadError) {
      console.error("Không thể tải dữ liệu tham chiếu mini test", loadError);
      toast.error(getErrorMessage(loadError, "Không thể tải chủ đề hoặc ngân hàng câu hỏi"));
    } finally {
      setReferencesLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadTests);
  }, [loadTests]);

  useEffect(() => {
    void Promise.resolve().then(loadReferences);
  }, [loadReferences]);

  const filteredQuestions = useMemo(() => {
    const query = questionFilter.trim().toLowerCase();
    if (!query) return questions;
    return questions.filter((question) =>
      `${question.questionText} ${question.questionType} ${question.term}`.toLowerCase().includes(query),
    );
  }, [questionFilter, questions]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setQuestionFilter("");
    setFormOpen(true);
  }

  function openEdit(test: MiniTestItem) {
    setEditing(test);
    setForm({
      title: test.title,
      description: test.description || "",
      topicId: test.topicId ? String(test.topicId) : "",
      selectedQuestionIds: test.questionIds || [],
    });
    setQuestionFilter("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function toggleQuestion(id: number) {
    setForm((current) => ({
      ...current,
      selectedQuestionIds: current.selectedQuestionIds.includes(id)
        ? current.selectedQuestionIds.filter((questionId) => questionId !== id)
        : [...current.selectedQuestionIds, id],
    }));
  }

  async function saveTest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    if (title.length < 3) {
      toast.error("Tiêu đề mini test cần ít nhất 3 ký tự");
      return;
    }
    if (form.description.trim().length > 1000) {
      toast.error("Mô tả không được vượt quá 1.000 ký tự");
      return;
    }
    if (form.selectedQuestionIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 câu hỏi");
      return;
    }

    const payload = {
      title,
      description: form.description.trim(),
      topicId: form.topicId ? Number(form.topicId) : null,
      questionIds: form.selectedQuestionIds,
    };

    setSaving(true);
    try {
      if (editing) {
        await adminService.updateMiniTest(editing.id, payload);
        toast.success("Cập nhật mini test thành công");
      } else {
        await adminService.createMiniTest(payload);
        toast.success("Tạo mini test thành công");
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadTests();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, "Không thể lưu mini test"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteTest() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await adminService.deleteMiniTest(deleteTarget.id);
      toast.success("Xóa mini test thành công");
      setDeleteTarget(null);
      await loadTests();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, "Xóa mini test thất bại"));
    } finally {
      setBusyId(null);
    }
  }

  async function updateStatus(test: MiniTestItem, action: "publish" | "archive") {
    setBusyId(test.id);
    try {
      if (action === "publish") {
        await adminService.publishMiniTest(test.id);
        toast.success("Xuất bản mini test thành công");
      } else {
        await adminService.archiveMiniTest(test.id);
        toast.success("Lưu trữ mini test thành công");
      }
      await loadTests();
    } catch (statusError) {
      toast.error(getErrorMessage(statusError, "Không thể cập nhật trạng thái mini test"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Topbar title="Quản lý mini test" subtitle="Tạo, chỉnh sửa, xuất bản và quản lý ngân hàng câu hỏi của bài kiểm tra." role="admin" />
      <AdminPage>
        <AdminPanel>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(240px,1fr)_200px_200px_auto]">
            <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm tiêu đề, mô tả hoặc chủ đề"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select value={topicId} onChange={(event) => { setTopicId(event.target.value); setPage(1); }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
              <option value="">Tất cả chủ đề</option>
              {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
            </select>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
              <option value="">Tất cả trạng thái</option>
              {["Draft", "PendingReview", "Published", "Rejected", "Archived"].map((item) => <option key={item} value={item}>{adminLabel(item)}</option>)}
            </select>
            <Button type="button" onClick={openCreate} className="h-10 gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Tạo mini test
            </Button>
          </div>
        </AdminPanel>

        {error ? (
          <AdminErrorState description={error} onRetry={() => void loadTests()} />
        ) : loading && tests.length === 0 ? (
          <AdminLoadingState label="Đang tải danh sách mini test..." />
        ) : tests.length === 0 ? (
          <AdminPanel>
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              <p className="mt-3 text-sm font-semibold">Chưa có mini test phù hợp</p>
              <p className="mt-1 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc tạo bài kiểm tra đầu tiên.</p>
            </div>
          </AdminPanel>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tests.map((test) => (
                <AdminPanel key={test.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openEdit(test)} aria-label={`Sửa ${test.title}`} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {test.status === "Published" ? (
                        <button type="button" disabled={busyId === test.id} onClick={() => void updateStatus(test, "archive")} aria-label={`Lưu trữ ${test.title}`} className="rounded-md p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50 dark:hover:bg-amber-500/10">
                          <Archive className="h-4 w-4" />
                        </button>
                      ) : (
                        <button type="button" disabled={busyId === test.id} onClick={() => void updateStatus(test, "publish")} aria-label={`Xuất bản ${test.title}`} className="rounded-md p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:hover:bg-emerald-500/10">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => setDeleteTarget(test)} aria-label={`Xóa ${test.title}`} className="rounded-md p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{test.title}</h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{test.description || "Không có mô tả."}</p>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                    <StatusBadge tone="blue">{test.topicName || "Tổng hợp"}</StatusBadge>
                    <StatusBadge tone="violet">{test.totalQuestions} câu hỏi</StatusBadge>
                    <StatusBadge tone={test.status === "Published" ? "emerald" : test.status === "Archived" ? "slate" : "amber"}>{adminLabel(test.status || "Draft")}</StatusBadge>
                  </div>
                </AdminPanel>
              ))}
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.04]">
              <span>Hiển thị {tests.length} / {pagination.total} mini test</span>
              <div className="flex items-center gap-2">
                <ToolbarButton onClick={() => setPage((current) => Math.max(1, current - 1))}>Trước</ToolbarButton>
                <span>Trang {pagination.page}/{pagination.totalPages}</span>
                <ToolbarButton onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}>Sau</ToolbarButton>
              </div>
            </div>
          </>
        )}

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" onClick={closeForm}>
            <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950">
                <div>
                  <h2 className="font-semibold text-slate-950 dark:text-white">{editing ? "Chỉnh sửa mini test" : "Tạo mini test"}</h2>
                  <p className="mt-1 text-xs text-slate-500">Chọn ít nhất một câu hỏi trước khi lưu.</p>
                </div>
                <button type="button" onClick={closeForm} aria-label="Đóng"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={saveTest} className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Tiêu đề *">
                    <Input value={form.title} maxLength={255} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                  </Field>
                  <Field label="Chủ đề">
                    <select value={form.topicId} onChange={(event) => setForm((current) => ({ ...current, topicId: event.target.value }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
                      <option value="">Không gắn chủ đề</option>
                      {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Mô tả">
                  <Textarea value={form.description} maxLength={1000} rows={3} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                  <p className="text-right text-xs text-slate-400">{form.description.length}/1000</p>
                </Field>
                <div>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <ListChecks className="h-4 w-4" />
                      Câu hỏi đã chọn: {form.selectedQuestionIds.length}
                    </label>
                    <div className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 sm:w-80 dark:border-white/10 dark:bg-white/5">
                      <Search className="h-4 w-4 text-slate-500" />
                      <input value={questionFilter} onChange={(event) => setQuestionFilter(event.target.value)} placeholder="Lọc câu hỏi..." className="w-full bg-transparent text-sm outline-none" />
                    </div>
                  </div>
                  <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3 md:grid-cols-2 dark:border-white/10 dark:bg-white/[0.03]">
                    {referencesLoading ? (
                      <div className="col-span-full flex items-center justify-center py-12 text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tải câu hỏi...</div>
                    ) : filteredQuestions.length === 0 ? (
                      <p className="col-span-full py-12 text-center text-sm text-slate-500">Không có câu hỏi phù hợp.</p>
                    ) : filteredQuestions.map((question) => {
                      const selected = form.selectedQuestionIds.includes(question.id);
                      return (
                        <button type="button" key={question.id} onClick={() => toggleQuestion(question.id)} className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${selected ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]"}`}>
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 dark:border-white/20"}`}>{selected && <Check className="h-3 w-3" />}</span>
                          <span className="min-w-0">
                            <span className="line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-200">{question.questionText}</span>
                            <span className="mt-1 block text-xs text-slate-500">{question.term} · {adminLabel(question.questionType)}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                  <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
                  <Button type="submit" disabled={saving || referencesLoading} className="bg-blue-600 hover:bg-blue-700">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editing ? "Lưu thay đổi" : "Tạo mini test"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Xóa mini test?"
          description={`Mini test "${deleteTarget?.title || ""}" và lịch sử làm bài liên quan sẽ bị xóa. Thao tác này không thể hoàn tác.`}
          busy={busyId === deleteTarget?.id}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void deleteTest()}
        />
      </AdminPage>
    </>
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
