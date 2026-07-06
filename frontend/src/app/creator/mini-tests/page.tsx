"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Edit3, FileText, ListChecks, Loader2, Plus, Search, Send, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { aiService } from "@/src/services/ai.service";
import { creatorService, MiniTest, Question, Topic } from "@/src/services/creator.service";

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

const statusTone: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  PendingReview: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  Published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
  Rejected: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300",
  Archived: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

const statusLabel: Record<string, string> = {
  Draft: "Bản nháp",
  PendingReview: "Chờ duyệt",
  Published: "Đã xuất bản",
  Rejected: "Bị từ chối",
  Archived: "Đã lưu trữ",
  MCQ: "Trắc nghiệm",
  FillBlank: "Điền khuyết",
  Matching: "Ghép nối",
};

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  return typeof apiError.response?.data?.message === "string" ? apiError.response.data.message : fallback;
}

export default function CreatorMiniTestsPage() {
  const [tests, setTests] = useState<MiniTest[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [referencesLoading, setReferencesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MiniTest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MiniTest | null>(null);
  const [form, setForm] = useState<TestForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [questionFilter, setQuestionFilter] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const selectedTopic = useMemo(
    () => topics.find((topic) => String(topic.id) === form.topicId) || null,
    [form.topicId, topics],
  );

  const loadTests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await creatorService.getMiniTests({
        search: search.trim(),
        status,
        topicId: topicFilter,
        pageSize: 100,
      });
      setTests(data);
    } catch (error) {
      console.error("Không thể tải mini tests", error);
      toast.error(getErrorMessage(error, "Không thể tải danh sách mini test"));
    } finally {
      setLoading(false);
    }
  }, [search, status, topicFilter]);

  const loadQuestions = useCallback(async (topicId?: number) => {
    setReferencesLoading(true);
    try {
      const data = await creatorService.getQuestions({ pageSize: 100, topicId });
      setQuestions(data);
    } catch (error) {
      console.error("Không thể tải câu hỏi", error);
      toast.error(getErrorMessage(error, "Không thể tải ngân hàng câu hỏi"));
    } finally {
      setReferencesLoading(false);
    }
  }, []);

  const loadReferences = useCallback(async () => {
    setReferencesLoading(true);
    try {
      const [topicData, questionData] = await Promise.all([
        creatorService.getTopics({ pageSize: 100 }),
        creatorService.getQuestions({ pageSize: 100 }),
      ]);
      setTopics(topicData);
      setQuestions(questionData);
    } catch (error) {
      console.error("Không thể tải dữ liệu tham chiếu", error);
      toast.error(getErrorMessage(error, "Không thể tải chủ đề hoặc câu hỏi"));
    } finally {
      setReferencesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTests();
  }, [loadTests]);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  const filteredQuestions = useMemo(() => {
    const query = questionFilter.trim().toLowerCase();
    if (!query) return questions;
    return questions.filter((question) =>
      `${question.questionText} ${question.questionType} ${question.wordTerm}`.toLowerCase().includes(query),
    );
  }, [questionFilter, questions]);

  function openCreate() {
    const firstTopicId = topics[0]?.id ? String(topics[0].id) : "";
    setEditing(null);
    setForm({ ...emptyForm, topicId: firstTopicId });
    setQuestionFilter("");
    setFormOpen(true);
    void loadQuestions(firstTopicId ? Number(firstTopicId) : undefined);
  }

  function openEdit(test: MiniTest) {
    setEditing(test);
    setForm({
      title: test.title,
      description: test.description || "",
      topicId: test.topicId ? String(test.topicId) : "",
      selectedQuestionIds: test.questionIds || [],
    });
    setQuestionFilter("");
    setFormOpen(true);
    void loadQuestions(test.topicId || undefined);
  }

  function closeForm() {
    if (saving || aiLoading) return;
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

  async function handleTopicChange(value: string) {
    setForm((current) => ({ ...current, topicId: value, selectedQuestionIds: [] }));
    await loadQuestions(value ? Number(value) : undefined);
  }

  async function suggestWithAi() {
    if (!selectedTopic) {
      toast.error("Chọn chủ đề trước khi dùng AI");
      return;
    }
    setAiLoading(true);
    try {
      const questionCount = Math.max(5, form.selectedQuestionIds.length || 10);
      const suggestion = await aiService.suggestMiniTestContent({
        topicName: selectedTopic.name,
        description: form.description || selectedTopic.description || undefined,
        questionCount,
        titleHint: form.title || undefined,
      });
      const publishedQuestions = await creatorService.getQuestions({
        topicId: Number(form.topicId),
        status: "Published",
        pageSize: questionCount,
      });
      const fallbackQuestions = publishedQuestions.length > 0
        ? publishedQuestions
        : await creatorService.getQuestions({ topicId: Number(form.topicId), pageSize: questionCount });

      setQuestions(fallbackQuestions);
      setForm((current) => ({
        ...current,
        title: current.title.trim() || suggestion.title,
        description: suggestion.description || current.description,
        selectedQuestionIds: fallbackQuestions.slice(0, questionCount).map((question) => question.id),
      }));
      toast.success("AI đã tạo draft và tự chọn câu hỏi theo topic");
    } catch (error) {
      console.error("Không thể tạo draft mini test", error);
      toast.error(getErrorMessage(error, "Không thể tạo draft AI"));
    } finally {
      setAiLoading(false);
    }
  }

  async function saveTest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    if (title.length < 3) {
      toast.error("Tiêu đề mini test cần ít nhất 3 ký tự");
      return;
    }
    if (!form.topicId) {
      toast.error("Vui lòng chọn chủ đề");
      return;
    }
    if (form.selectedQuestionIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 câu hỏi");
      return;
    }

    const payload = {
      title,
      description: form.description.trim(),
      topicId: Number(form.topicId),
      questionIds: form.selectedQuestionIds,
    };

    setSaving(true);
    try {
      if (editing) {
        await creatorService.updateMiniTest(editing.id, payload);
        toast.success("Cập nhật mini test thành công");
      } else {
        await creatorService.createMiniTest(payload);
        toast.success("Tạo mini test thành công");
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadTests();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể lưu mini test"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteTest() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await creatorService.deleteMiniTest(deleteTarget.id);
      toast.success("Xóa mini test thành công");
      setDeleteTarget(null);
      await loadTests();
    } catch (error) {
      toast.error(getErrorMessage(error, "Xóa mini test thất bại"));
    } finally {
      setBusyId(null);
    }
  }

  async function submitForReview(test: MiniTest) {
    setBusyId(test.id);
    try {
      await creatorService.submitMiniTestForReview(test.id);
      toast.success("Đã gửi mini test để duyệt");
      await loadTests();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể gửi duyệt"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý bài test</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Tạo mini test thật bằng cách chọn câu hỏi và gửi duyệt cho admin.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Tạo mini test
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(240px,1fr)_200px_200px]">
          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-white/10 dark:bg-slate-950">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tiêu đề, mô tả hoặc chủ đề" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
            <option value="">Tất cả chủ đề</option>
            {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
            <option value="">Tất cả trạng thái</option>
            {["Draft", "PendingReview", "Published", "Rejected"].map((item) => <option key={item} value={item}>{statusLabel[item]}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-500" /> Đang tải mini test...
        </div>
      ) : tests.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center dark:border-white/10 dark:bg-white/5">
          <FileText className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-semibold">Chưa có mini test phù hợp</p>
          <p className="mt-1 text-sm text-slate-500">Tạo bài test đầu tiên hoặc thay đổi bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => (
            <div key={test.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  {(test.contentStatus === "Draft" || test.contentStatus === "Rejected") && (
                    <button type="button" disabled={busyId === test.id} onClick={() => void submitForReview(test)} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-500/10" title="Gửi duyệt">
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => openEdit(test)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" title="Sửa">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {(test.contentStatus === "Draft" || test.contentStatus === "PendingReview") && (
                    <button type="button" onClick={() => setDeleteTarget(test)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{test.title}</h2>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{test.description || "Không có mô tả."}</p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                <Badge>{test.topicName || "—"}</Badge>
                <Badge>{test.totalQuestions} câu hỏi</Badge>
                <Badge className={statusTone[test.contentStatus] || statusTone.Draft}>{statusLabel[test.contentStatus] || test.contentStatus}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" onClick={closeForm}>
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950">
              <div>
                <h2 className="font-semibold text-slate-950 dark:text-white">{editing ? "Chỉnh sửa mini test" : "Tạo mini test"}</h2>
                <p className="mt-1 text-xs text-slate-500">Chọn topic, dùng AI nếu cần, sau đó chọn câu hỏi để test có nội dung thật.</p>
              </div>
              <button type="button" onClick={closeForm} aria-label="Đóng"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={saveTest} className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Tiêu đề *">
                  <Input value={form.title} maxLength={255} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                </Field>
                <Field label="Chủ đề *">
                  <select value={form.topicId} onChange={(event) => void handleTopicChange(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
                    <option value="">Chọn chủ đề</option>
                    {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Mô tả">
                <Textarea value={form.description} maxLength={1000} rows={3} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                <p className="text-right text-xs text-slate-400">{form.description.length}/1000</p>
              </Field>
              <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/10 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">AI draft mini test</p>
                  <p className="text-xs text-blue-600/80 dark:text-blue-200/70">Gợi ý tiêu đề, mô tả và tự chọn câu hỏi Published theo topic.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => void suggestWithAi()} disabled={aiLoading || referencesLoading} className="gap-2 rounded-xl bg-white dark:bg-slate-950">
                  {aiLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Sparkles className="h-4 w-4" /> Gợi ý AI
                </Button>
              </div>
              <div>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <ListChecks className="h-4 w-4" /> Câu hỏi đã chọn: {form.selectedQuestionIds.length}
                  </label>
                  <div className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 sm:w-80 dark:border-white/10 dark:bg-white/5">
                    <Search className="h-4 w-4 text-slate-500" />
                    <input value={questionFilter} onChange={(event) => setQuestionFilter(event.target.value)} placeholder="Lọc câu hỏi..." className="w-full bg-transparent text-sm outline-none" />
                  </div>
                </div>
                <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2 dark:border-white/10 dark:bg-white/[0.03]">
                  {referencesLoading ? (
                    <div className="col-span-full flex items-center justify-center py-12 text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tải câu hỏi...</div>
                  ) : filteredQuestions.length === 0 ? (
                    <p className="col-span-full py-12 text-center text-sm text-slate-500">Không có câu hỏi phù hợp.</p>
                  ) : filteredQuestions.map((question) => {
                    const selected = form.selectedQuestionIds.includes(question.id);
                    return (
                      <button type="button" key={question.id} onClick={() => toggleQuestion(question.id)} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${selected ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]"}`}>
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 dark:border-white/20"}`}>{selected && <Check className="h-3 w-3" />}</span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-200">{question.questionText}</span>
                          <span className="mt-1 block text-xs text-slate-500">{question.wordTerm} · {statusLabel[question.questionType] || question.questionType} · {statusLabel[question.contentStatus] || question.contentStatus}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
                <Button type="submit" disabled={saving || referencesLoading} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Lưu thay đổi" : "Tạo mini test"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-950">
            <h2 className="text-lg font-semibold">Xóa mini test?</h2>
            <p className="mt-2 text-sm text-slate-500">Mini test “{deleteTarget.title}” sẽ bị xóa nếu đang ở trạng thái cho phép.</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
              <Button type="button" disabled={busyId === deleteTarget.id} onClick={() => void deleteTest()} className="gap-2 bg-rose-600 hover:bg-rose-700">
                {busyId === deleteTarget.id && <Loader2 className="h-4 w-4 animate-spin" />}
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
