"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Topbar from "@/src/components/shared/Topbar";
import { AdminErrorState, AdminPage, ConfirmDialog, StatusBadge, TableShell } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";

interface TopicCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm = {
  name: "",
  code: "",
  description: "",
  iconUrl: "",
  displayOrder: 0,
  isActive: true,
};

export default function AdminTopicCategoriesPage() {
  const [items, setItems] = useState<TopicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TopicCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TopicCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getTopicCategories<TopicCategory>();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Không thể tải danh mục chủ đề từ máy chủ.");
      toast.error("Không thể tải danh mục chủ đề");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(category: TopicCategory) {
    setEditing(category);
    setForm({
      name: category.name,
      code: category.code,
      description: category.description || "",
      iconUrl: category.iconUrl || "",
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Tên và mã danh mục là bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description,
        iconUrl: form.iconUrl,
        displayOrder: Math.max(1, form.displayOrder),
        isActive: form.isActive,
      };

      if (editing) {
        await adminService.updateTopicCategory(editing.id, payload);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await adminService.createTopicCategory(payload);
        toast.success("Tạo danh mục thành công");
      }

      setShowForm(false);
      await load();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Không thể lưu danh mục");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteTopicCategory(deleteTarget.id);
      toast.success("Đã tắt danh mục chủ đề");
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error("Không thể xóa danh mục");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <Topbar title="Danh mục chủ đề" subtitle="Quản lý các nhóm danh mục dùng để phân loại chủ đề học." role="admin" />
      <AdminPage>
      <div className="flex items-center justify-end">
        <Button onClick={openCreate} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Tạo mới
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? "Sửa danh mục" : "Tạo danh mục"}</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Đóng">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Tên danh mục *">
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </Field>
              <Field label="Mã danh mục *">
                <Input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
              </Field>
              <Field label="Mô tả">
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={2} className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-800" />
              </Field>
              <Field label="Đường dẫn biểu tượng">
                <Input value={form.iconUrl} onChange={(event) => setForm({ ...form, iconUrl: event.target.value })} />
              </Field>
              <Field label="Thứ tự hiển thị">
                <Input type="number" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="rounded" />
                Đang hoạt động
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Cập nhật" : "Tạo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <AdminErrorState description={error} onRetry={() => void load()} />
      ) : (
      <TableShell>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Tên</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Mã</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Thứ tự</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Chưa có danh mục nào</td></tr>
              ) : items.map((category) => (
                <tr key={category.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{category.code}</td>
                  <td className="px-4 py-3 text-slate-500">{category.displayOrder}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={category.isActive ? "emerald" : "slate"}>{category.isActive ? "Đang hoạt động" : "Đã tắt"}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => openEdit(category)} title="Sửa" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(category)} title="Tắt danh mục" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </TableShell>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Tắt danh mục chủ đề?"
        description={`Danh mục "${deleteTarget?.name || ""}" sẽ bị tắt và các chủ đề liên quan được bỏ liên kết danh mục.`}
        confirmLabel="Tắt danh mục"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
      </AdminPage>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase text-slate-500">{label}</label>
      {children}
    </div>
  );
}
