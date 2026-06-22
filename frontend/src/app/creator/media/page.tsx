"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileAudio, FileImage, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  creatorService,
  type CreatorMedia,
  type MediaPayload,
} from "@/src/services/creator.service";
import {
  ConfirmDialog,
  CreatorErrorState,
  CreatorHeader,
  CreatorLoadingState,
  CreatorModal,
  CreatorPage,
  CreatorPanel,
  TableShell,
} from "@/src/components/creator/CreatorPrimitives";
import { formatCreatorDate, getCreatorErrorMessage } from "@/src/lib/creator-utils";

const emptyForm: MediaPayload = { mediaType: "Image", fileUrl: "", fileName: "", mimeType: "", fileSizeBytes: null, altText: "", transcript: "" };

export default function CreatorMediaPage() {
  const [items, setItems] = useState<CreatorMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<MediaPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CreatorMedia | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await creatorService.getMedia());
    } catch (loadError) {
      setError(getCreatorErrorMessage(loadError, "Không thể tải thư viện media"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function saveMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const url = new URL(form.fileUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported protocol");
    } catch {
      toast.error("URL media phải hợp lệ và sử dụng HTTP hoặc HTTPS");
      return;
    }
    setSaving(true);
    try {
      await creatorService.createMedia({ ...form, fileUrl: form.fileUrl.trim(), fileName: form.fileName?.trim(), altText: form.altText?.trim(), transcript: form.transcript?.trim() });
      toast.success("Đã thêm media vào thư viện");
      setFormOpen(false);
      setForm(emptyForm);
      await load();
    } catch (saveError) {
      toast.error(getCreatorErrorMessage(saveError, "Không thể thêm media"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteMedia() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await creatorService.deleteMedia(deleteTarget.id);
      toast.success("Đã xóa media");
      setDeleteTarget(null);
      await load();
    } catch (deleteError) {
      toast.error(getCreatorErrorMessage(deleteError, "Không thể xóa media"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <CreatorPage>
      <CreatorHeader title="Thư viện media" description="Đăng ký URL hình ảnh hoặc âm thanh đã được lưu trên dịch vụ tệp của hệ thống." action={<Button onClick={() => setFormOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Thêm media</Button>} />
      <CreatorPanel><p className="text-sm text-slate-600 dark:text-slate-400">Trang này quản lý metadata và URL media. Việc tải file nhị phân cần được xử lý bởi dịch vụ lưu trữ/CDN riêng, vì backend hiện không cung cấp endpoint upload multipart.</p></CreatorPanel>
      {loading ? <CreatorLoadingState label="Đang tải thư viện media..." /> : error ? <CreatorErrorState description={error} onRetry={() => void load()} /> : (
        <CreatorPanel>
          <TableShell><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500 dark:border-white/10 dark:bg-white/5"><tr><th className="px-4 py-3">Media</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">MIME</th><th className="px-4 py-3">Ngày tạo</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-white/10">{!items.length ? <tr><td colSpan={5} className="px-4 py-14 text-center text-slate-500">Chưa có media nào.</td></tr> : items.map((item) => { const Icon = item.mediaType.includes("Audio") ? FileAudio : FileImage; return <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5"><td className="px-4 py-4"><div className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 text-slate-400" /><div><p className="font-medium">{item.fileName || `Media #${item.id}`}</p><p className="mt-1 max-w-lg truncate text-xs text-slate-500">{item.fileUrl}</p><p className="mt-1 text-xs text-slate-400">{item.altText || item.transcript || "Chưa có mô tả"}</p></div></div></td><td className="px-4 py-4">{item.mediaType}</td><td className="px-4 py-4 text-slate-500">{item.mimeType || "Chưa xác định"}</td><td className="px-4 py-4 text-slate-500">{formatCreatorDate(item.createdAt)}</td><td className="px-4 py-4"><div className="flex justify-end gap-1"><a href={item.fileUrl} target="_blank" rel="noreferrer" title="Mở media" className="rounded-md p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"><ExternalLink className="h-4 w-4" /></a><button type="button" onClick={() => setDeleteTarget(item)} title="Xóa" className="rounded-md p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button></div></td></tr>; })}</tbody></table></TableShell>
        </CreatorPanel>
      )}
      <CreatorModal open={formOpen} title="Thêm media" description="Nhập URL tệp đã tải lên dịch vụ lưu trữ." onClose={() => setFormOpen(false)}>
        <form onSubmit={saveMedia} className="space-y-4 p-5">
          <Field label="Loại media"><select value={form.mediaType} onChange={(event) => setForm({ ...form, mediaType: event.target.value as MediaPayload["mediaType"] })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">{["Image", "AudioUK", "AudioUS", "ExampleAudio", "QuestionAudio", "QuestionImage"].map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>
          <Field label="URL tệp *"><Input type="url" value={form.fileUrl} maxLength={1000} onChange={(event) => setForm({ ...form, fileUrl: event.target.value })} placeholder="https://cdn.example.com/media/file.mp3" /></Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Tên tệp"><Input value={form.fileName || ""} maxLength={255} onChange={(event) => setForm({ ...form, fileName: event.target.value })} /></Field><Field label="MIME type"><Input value={form.mimeType || ""} maxLength={100} onChange={(event) => setForm({ ...form, mimeType: event.target.value })} placeholder="image/png" /></Field></div>
          <Field label="Văn bản thay thế"><Input value={form.altText || ""} maxLength={500} onChange={(event) => setForm({ ...form, altText: event.target.value })} /></Field>
          <Field label="Bản chép âm"><textarea value={form.transcript || ""} maxLength={2000} rows={4} onChange={(event) => setForm({ ...form, transcript: event.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950" /></Field>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10"><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button><Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Thêm media"}</Button></div>
        </form>
      </CreatorModal>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Xóa media?" description="Media chỉ có thể xóa khi chưa được liên kết với nội dung." busy={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={() => void deleteMedia()} />
    </CreatorPage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-xs font-semibold uppercase text-slate-500">{label}</label>{children}</div>;
}
