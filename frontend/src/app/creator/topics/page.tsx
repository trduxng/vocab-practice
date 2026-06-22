"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit3, Plus, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
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
import {
  creatorService,
  type CreatorPage as CreatorPageData,
  type CreatorTopic,
  type TopicCategory,
  type TopicPayload,
} from "@/src/services/creator.service";
import { formatCreatorDate, getCreatorErrorMessage } from "@/src/lib/creator-utils";

const emptyForm: TopicPayload = { topicName: "", topicCode: "", description: "", topicCategoryId: null };
const emptyPage: CreatorPageData<CreatorTopic> = { data: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };

export default function CreatorTopicsPage() {
  const [result, setResult] = useState(emptyPage);
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreatorTopic | null>(null);
  const [form, setForm] = useState<TopicPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CreatorTopic | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [topics, topicCategories] = await Promise.all([
        creatorService.getTopicsPage({ page, pageSize: 20, search: search.trim(), status }),
        creatorService.getTopicCategories(),
      ]);
      setResult(topics);
      setCategories(topicCategories);
    } catch (loadError) {
      setError(getCreatorErrorMessage(loadError, "Không thể tải danh sách chủ đề"));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(topic: CreatorTopic) {
    setEditing(topic);
    setForm({
      topicName: topic.name,
      topicCode: topic.code,
      description: topic.description || "",
      topicCategoryId: topic.categoryId || null,
    });
    setFormOpen(true);
  }

  async function saveTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.topicName.trim().length < 2 || form.topicCode.trim().length < 2) {
      toast.error("Tên và mã chủ đề cần ít nhất 2 ký tự");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        topicName: form.topicName.trim(),
        topicCode: form.topicCode.trim().toUpperCase().replace(/\s+/g, "_"),
        description: form.description?.trim(),
      };
      if (editing) {
        await creatorService.updateTopic(editing.id, payload);
        toast.success("Cập nhật chủ đề thành công");
      } else {
        await creatorService.createTopic(payload);
        toast.success("Tạo chủ đề thành công");
      }
      setFormOpen(false);
      await load();
    } catch (saveError) {
      toast.error(getCreatorErrorMessage(saveError, "Không thể lưu chủ đề"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteTopic() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await creatorService.deleteTopic(deleteTarget.id);
      toast.success("Đã xóa bản nháp chủ đề");
      setDeleteTarget(null);
      await load();
    } catch (deleteError) {
      toast.error(getCreatorErrorMessage(deleteError, "Không thể xóa chủ đề"));
    } finally {
      setBusyId(null);
    }
  }

  async function submitReview(topic: CreatorTopic) {
    setBusyId(topic.id);
    try {
      await creatorService.submitTopicForReview(topic.id);
      toast.success("Đã gửi chủ đề để duyệt");
      await load();
    } catch (submitError) {
      toast.error(getCreatorErrorMessage(submitError, "Không thể gửi duyệt"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <CreatorPage>
      <CreatorHeader
        title="Quản lý chủ đề"
        description="Tạo và quản lý các chủ đề do bạn sở hữu."
        action={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Tạo chủ đề</Button>}
      />

      <CreatorPanel>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_200px]">
          <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm tên, mã hoặc mô tả" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
            <option value="">Tất cả trạng thái</option>
            {["Draft", "PendingReview", "Published", "Rejected", "Archived"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </CreatorPanel>

      {error ? (
        <CreatorErrorState description={error} onRetry={() => void load()} />
      ) : loading && !result.data.length ? (
        <CreatorLoadingState label="Đang tải chủ đề..." />
      ) : (
        <CreatorPanel>
          <TableShell>
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500 dark:border-white/10 dark:bg-white/5">
                <tr><th className="px-4 py-3">Chủ đề</th><th className="px-4 py-3">Danh mục</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {!result.data.length ? (
                  <tr><td colSpan={5} className="px-4 py-14 text-center text-slate-500">Chưa có chủ đề phù hợp.</td></tr>
                ) : result.data.map((topic) => {
                  const editable = topic.contentStatus === "Draft" || topic.contentStatus === "Rejected";
                  return (
                    <tr key={topic.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950 dark:text-white">{topic.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{topic.code} · {topic.description || "Chưa có mô tả"}</p>
                        {topic.rejectionReason && <p className="mt-2 text-xs text-rose-500">Lý do: {topic.rejectionReason}</p>}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{topic.categoryName || "Chưa phân loại"}</td>
                      <td className="px-4 py-4"><CreatorStatusBadge status={topic.contentStatus} /></td>
                      <td className="px-4 py-4 text-slate-500">{formatCreatorDate(topic.updatedAt || topic.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          {editable && <button type="button" onClick={() => void submitReview(topic)} disabled={busyId === topic.id} title="Gửi duyệt" className="rounded-md p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-500/10"><Send className="h-4 w-4" /></button>}
                          {editable && <button type="button" onClick={() => openEdit(topic)} title="Chỉnh sửa" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"><Edit3 className="h-4 w-4" /></button>}
                          {topic.contentStatus === "Draft" && <button type="button" onClick={() => setDeleteTarget(topic)} title="Xóa" className="rounded-md p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableShell>
          <div className="mt-4"><CreatorPagination pagination={result} loading={loading} onPageChange={setPage} /></div>
        </CreatorPanel>
      )}

      <CreatorModal open={formOpen} title={editing ? "Chỉnh sửa chủ đề" : "Tạo chủ đề"} onClose={() => setFormOpen(false)}>
        <form onSubmit={saveTopic} className="space-y-4 p-5">
          <Field label="Tên chủ đề *"><Input value={form.topicName} maxLength={200} onChange={(event) => setForm({ ...form, topicName: event.target.value })} /></Field>
          <Field label="Mã chủ đề *"><Input value={form.topicCode} maxLength={50} onChange={(event) => setForm({ ...form, topicCode: event.target.value })} /></Field>
          <Field label="Danh mục">
            <select value={form.topicCategoryId || ""} onChange={(event) => setForm({ ...form, topicCategoryId: event.target.value ? Number(event.target.value) : null })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
              <option value="">Không phân loại</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <Field label="Mô tả"><textarea value={form.description || ""} maxLength={1000} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" /></Field>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo chủ đề"}</Button>
          </div>
        </form>
      </CreatorModal>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Xóa bản nháp chủ đề?" description={`Chủ đề "${deleteTarget?.name || ""}" sẽ bị xóa vĩnh viễn.`} busy={busyId === deleteTarget?.id} onCancel={() => setDeleteTarget(null)} onConfirm={() => void deleteTopic()} />
    </CreatorPage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-xs font-semibold uppercase text-slate-500">{label}</label>{children}</div>;
}
