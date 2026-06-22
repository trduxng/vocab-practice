"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit3, Plus, Search, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { categoriesService } from "@/src/services/categories.service";
import {
  creatorService,
  type CreatorPage as CreatorPageData,
  type CreatorTopic,
  type CreatorWord,
  type WordPayload,
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

type PartOfSpeech = { id: number; name: string };
const emptyForm: WordPayload = { term: "", meaning: "", phonetic: "", partOfSpeechId: 0, topicIds: [], examples: [] };
const emptyPage: CreatorPageData<CreatorWord> = { data: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };

export default function CreatorWordsPage() {
  const [result, setResult] = useState(emptyPage);
  const [topics, setTopics] = useState<CreatorTopic[]>([]);
  const [partsOfSpeech, setPartsOfSpeech] = useState<PartOfSpeech[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreatorWord | null>(null);
  const [form, setForm] = useState<WordPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CreatorWord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [words, topicItems, posItems] = await Promise.all([
        creatorService.getWordsPage({ page, pageSize: 20, search: search.trim(), status }),
        creatorService.getTopics({ pageSize: 100 }),
        categoriesService.getPartOfSpeeches(),
      ]);
      setResult(words);
      setTopics(topicItems.filter((topic) => topic.contentStatus !== "Archived"));
      setPartsOfSpeech(posItems);
    } catch (loadError) {
      setError(getCreatorErrorMessage(loadError, "Không thể tải danh sách từ vựng"));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, partOfSpeechId: partsOfSpeech[0]?.id || 0 });
    setFormOpen(true);
  }

  function openEdit(word: CreatorWord) {
    setEditing(word);
    setForm({
      term: word.term,
      meaning: word.meaning,
      phonetic: word.phonetic || "",
      partOfSpeechId: word.partOfSpeechId,
      topicIds: word.topicIds || [],
      examples: (word.examples || []).map((example) => ({ sentence: example.sentence, meaning: example.meaning || "" })),
    });
    setFormOpen(true);
  }

  function toggleTopic(topicId: number) {
    setForm((current) => ({
      ...current,
      topicIds: current.topicIds?.includes(topicId)
        ? current.topicIds.filter((id) => id !== topicId)
        : [...(current.topicIds || []), topicId],
    }));
  }

  async function saveWord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.term.trim() || !form.meaning.trim() || !form.partOfSpeechId) {
      toast.error("Từ, nghĩa và loại từ là bắt buộc");
      return;
    }
    setSaving(true);
    try {
      const payload: WordPayload = {
        ...form,
        term: form.term.trim(),
        meaning: form.meaning.trim(),
        phonetic: form.phonetic?.trim(),
        examples: (form.examples || []).map((item) => ({ sentence: item.sentence.trim(), meaning: item.meaning?.trim() })).filter((item) => item.sentence),
      };
      if (editing) {
        await creatorService.updateWord(editing.id, payload);
        toast.success("Cập nhật từ vựng thành công");
      } else {
        await creatorService.createWord(payload);
        toast.success("Tạo từ vựng thành công");
      }
      setFormOpen(false);
      await load();
    } catch (saveError) {
      toast.error(getCreatorErrorMessage(saveError, "Không thể lưu từ vựng"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteWord() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await creatorService.deleteWord(deleteTarget.id);
      toast.success("Đã xóa bản nháp từ vựng");
      setDeleteTarget(null);
      await load();
    } catch (deleteError) {
      toast.error(getCreatorErrorMessage(deleteError, "Không thể xóa từ vựng"));
    } finally {
      setBusyId(null);
    }
  }

  async function submitReview(word: CreatorWord) {
    setBusyId(word.id);
    try {
      await creatorService.submitWordForReview(word.id);
      toast.success("Đã gửi từ vựng để duyệt");
      await load();
    } catch (submitError) {
      toast.error(getCreatorErrorMessage(submitError, "Không thể gửi duyệt"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <CreatorPage>
      <CreatorHeader title="Quản lý từ vựng" description="Tạo từ, gắn chủ đề và bổ sung ví dụ trước khi gửi duyệt." action={<Button onClick={openCreate} disabled={!partsOfSpeech.length} className="gap-2"><Plus className="h-4 w-4" />Tạo từ vựng</Button>} />
      <CreatorPanel>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_200px]">
          <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm từ, nghĩa hoặc phiên âm" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
            <option value="">Tất cả trạng thái</option>
            {["Draft", "PendingReview", "Published", "Rejected", "Archived"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </CreatorPanel>

      {error ? <CreatorErrorState description={error} onRetry={() => void load()} /> : loading && !result.data.length ? <CreatorLoadingState label="Đang tải từ vựng..." /> : (
        <CreatorPanel>
          <TableShell>
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500 dark:border-white/10 dark:bg-white/5">
                <tr><th className="px-4 py-3">Từ vựng</th><th className="px-4 py-3">Loại từ</th><th className="px-4 py-3">Chủ đề</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {!result.data.length ? <tr><td colSpan={6} className="px-4 py-14 text-center text-slate-500">Chưa có từ vựng phù hợp.</td></tr> : result.data.map((word) => {
                  const editable = word.contentStatus === "Draft" || word.contentStatus === "Rejected";
                  return (
                    <tr key={word.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-4"><p className="font-medium text-slate-950 dark:text-white">{word.term}</p><p className="mt-1 max-w-md text-xs text-slate-500">{word.phonetic || "Chưa có phiên âm"} · {word.meaning}</p>{word.rejectionReason && <p className="mt-2 text-xs text-rose-500">Lý do: {word.rejectionReason}</p>}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{word.partOfSpeechName || "Chưa xác định"}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{word.topics?.map((topic) => topic.name).join(", ") || "Chưa gắn chủ đề"}</td>
                      <td className="px-4 py-4"><CreatorStatusBadge status={word.contentStatus} /></td>
                      <td className="px-4 py-4 text-slate-500">{formatCreatorDate(word.updatedAt || word.createdAt)}</td>
                      <td className="px-4 py-4"><div className="flex justify-end gap-1">
                        {editable && <button type="button" disabled={busyId === word.id} onClick={() => void submitReview(word)} title="Gửi duyệt" className="rounded-md p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-500/10"><Send className="h-4 w-4" /></button>}
                        {editable && <button type="button" onClick={() => openEdit(word)} title="Chỉnh sửa" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"><Edit3 className="h-4 w-4" /></button>}
                        {word.contentStatus === "Draft" && <button type="button" onClick={() => setDeleteTarget(word)} title="Xóa" className="rounded-md p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>}
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableShell>
          <div className="mt-4"><CreatorPagination pagination={result} loading={loading} onPageChange={setPage} /></div>
        </CreatorPanel>
      )}

      <CreatorModal open={formOpen} title={editing ? "Chỉnh sửa từ vựng" : "Tạo từ vựng"} onClose={() => setFormOpen(false)} maxWidth="max-w-3xl">
        <form onSubmit={saveWord} className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Từ vựng *"><Input value={form.term} maxLength={200} onChange={(event) => setForm({ ...form, term: event.target.value })} /></Field>
            <Field label="Phiên âm"><Input value={form.phonetic || ""} maxLength={255} onChange={(event) => setForm({ ...form, phonetic: event.target.value })} /></Field>
          </div>
          <Field label="Nghĩa *"><textarea value={form.meaning} maxLength={1000} onChange={(event) => setForm({ ...form, meaning: event.target.value })} rows={3} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" /></Field>
          <Field label="Loại từ *"><select value={form.partOfSpeechId || ""} onChange={(event) => setForm({ ...form, partOfSpeechId: Number(event.target.value) })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"><option value="">Chọn loại từ</option>{partsOfSpeech.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="Chủ đề"><div className="grid max-h-36 grid-cols-1 gap-2 overflow-y-auto rounded-md border border-slate-200 p-3 sm:grid-cols-2 dark:border-white/10">{topics.map((topic) => <label key={topic.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.topicIds?.includes(topic.id) || false} onChange={() => toggleTopic(topic.id)} />{topic.name}</label>)}</div></Field>
          <Field label="Câu ví dụ">
            <div className="space-y-3">
              {(form.examples || []).map((example, index) => (
                <div key={index} className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-[1fr_1fr_auto] dark:border-white/10">
                  <Input value={example.sentence} placeholder="Câu ví dụ" onChange={(event) => setForm((current) => ({ ...current, examples: current.examples?.map((item, itemIndex) => itemIndex === index ? { ...item, sentence: event.target.value } : item) }))} />
                  <Input value={example.meaning || ""} placeholder="Nghĩa" onChange={(event) => setForm((current) => ({ ...current, examples: current.examples?.map((item, itemIndex) => itemIndex === index ? { ...item, meaning: event.target.value } : item) }))} />
                  <button type="button" onClick={() => setForm((current) => ({ ...current, examples: current.examples?.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-md p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setForm((current) => ({ ...current, examples: [...(current.examples || []), { sentence: "", meaning: "" }] }))}>Thêm ví dụ</Button>
            </div>
          </Field>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10"><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button><Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo từ vựng"}</Button></div>
        </form>
      </CreatorModal>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Xóa bản nháp từ vựng?" description={`Từ "${deleteTarget?.term || ""}" sẽ bị xóa vĩnh viễn. Từ đang được dùng bởi câu hỏi sẽ không thể xóa.`} busy={busyId === deleteTarget?.id} onCancel={() => setDeleteTarget(null)} onConfirm={() => void deleteWord()} />
    </CreatorPage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-xs font-semibold uppercase text-slate-500">{label}</label>{children}</div>;
}
