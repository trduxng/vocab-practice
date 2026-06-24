'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { creatorService, TopicCategory, TopicPayload, Topic } from '@/src/services/creator.service';
import { Plus, Pencil, Trash2, Send, Loader2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

const statusBadge: Record<string, string> = {
  Draft: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  PendingReview: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const statusLabels: Record<string, string> = {
  Draft: 'Bản nháp',
  PendingReview: 'Chờ duyệt',
  Published: 'Đã xuất bản',
  Rejected: 'Bị từ chối',
  Archived: 'Đã lưu trữ',
};

export default function CreatorTopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [form, setForm] = useState<TopicPayload>({ topicName: '', topicCode: '', description: '', topicCategoryId: undefined, displayOrder: 0 });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([creatorService.getTopics(), creatorService.getTopicCategories()]);
      setTopics(t);
      setCategories(c);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ topicName: '', topicCode: '', description: '', topicCategoryId: undefined, displayOrder: 0 });
    setShowForm(true);
  };

  const openEdit = (t: Topic) => {
    setEditing(t);
    setForm({ topicName: t.name, topicCode: t.code, description: t.description || '', topicCategoryId: t.categoryId || undefined, displayOrder: t.displayOrder });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.topicName.trim() || !form.topicCode.trim()) {
      toast.error('Tên và mã chủ đề là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await creatorService.updateTopic(editing.id, form);
        toast.success('Cập nhật thành công');
      } else {
        await creatorService.createTopic(form);
        toast.success('Tạo chủ đề thành công');
      }
      setShowForm(false);
      await loadData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa chủ đề này? (Chỉ xóa được bản nháp)')) return;
    try {
      await creatorService.deleteTopic(id);
      toast.success('Đã xóa');
      await loadData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa');
    }
  };

  const handleSubmitReview = async (id: number) => {
    try {
      await creatorService.submitTopicForReview(id);
      toast.success('Đã gửi duyệt');
      await loadData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi duyệt');
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Chủ đề</h1>
          <p className="text-slate-600 text-sm mt-1">Tạo và quản lý các chủ đề nội dung</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Tạo mới
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Sửa chủ đề' : 'Tạo chủ đề mới'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Tên chủ đề *</label>
                <Input value={form.topicName} onChange={(e) => setForm({ ...form, topicName: e.target.value })} placeholder="Ví dụ: Business English" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Mã chủ đề *</label>
                <Input value={form.topicCode} onChange={(e) => setForm({ ...form, topicCode: e.target.value })} placeholder="Ví dụ: BIZ_ENG" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Danh mục</label>
                <select
                  value={form.topicCategoryId || ''}
                  onChange={(e) => setForm({ ...form, topicCategoryId: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none"
                  placeholder="Mô tả ngắn về chủ đề..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Thứ tự hiển thị</label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
                {saving && <Loader2 className="animate-spin h-4 w-4" />} {editing ? 'Cập nhật' : 'Tạo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Tên</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Mã</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Danh mục</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {topics.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">Chưa có chủ đề nào. Hãy tạo mới!</td></tr>
              ) : topics.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.code}</td>
                  <td className="px-4 py-3 text-slate-500">{t.categoryName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[t.contentStatus] || ''}`}>
                      {statusLabels[t.contentStatus] || t.contentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/creator/topics/${t.id}`)}
                        title="Mở chi tiết"
                        className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      {(t.contentStatus === 'Draft' || t.contentStatus === 'Rejected') && (
                        <button onClick={() => handleSubmitReview(t.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500">
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(t)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {t.contentStatus === 'Draft' && (
                        <button onClick={() => handleDelete(t.id)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
