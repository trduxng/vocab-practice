'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { creatorService, TopicCategory, TopicPayload, Topic, WordPayload } from '@/src/services/creator.service';
import { aiService } from '@/src/services/ai.service';
import { Plus, Pencil, Trash2, Send, Loader2, X, ExternalLink, RotateCcw, Copy, History, AlertTriangle } from 'lucide-react';
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
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<TopicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [form, setForm] = useState<TopicPayload>({ topicName: '', topicCode: '', description: '', topicCategoryId: undefined, displayOrder: 0 });
  const [draftWords, setDraftWords] = useState<WordPayload[]>([]);
  const [saving, setSaving] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedTopicLogs, setSelectedTopicLogs] = useState<any[]>([]);
  const [selectedTopicName, setSelectedTopicName] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerConfirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: () => {
        options.onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      isDestructive: options.isDestructive,
    });
  };


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

  useEffect(() => {
    if (searchParams.get('draft') !== '1') return;

    const draftRaw = window.localStorage.getItem('creator.topicDraft');
    if (!draftRaw) return;

    try {
      const draft = JSON.parse(draftRaw) as Partial<TopicPayload>;
      setEditing(null);
      setForm({
        topicName: draft.topicName || '',
        topicCode: draft.topicCode || '',
        description: draft.description || '',
        topicCategoryId: draft.topicCategoryId,
        displayOrder: draft.displayOrder ?? 0,
      });
      setDraftWords((draft as { suggestedWords?: WordPayload[] }).suggestedWords || []);
      setShowForm(true);
    } catch {
      // ignore bad draft
    } finally {
      window.localStorage.removeItem('creator.topicDraft');
    }
  }, [searchParams]);

  const openCreate = () => {
    setEditing(null);
    setForm({ topicName: '', topicCode: '', description: '', topicCategoryId: undefined, displayOrder: 0 });
    setDraftWords([]);
    setShowForm(true);
  };

  const openEdit = (t: Topic) => {
    setEditing(t);
    setForm({ topicName: t.name, topicCode: t.code, description: t.description || '', topicCategoryId: t.categoryId || undefined, displayOrder: t.displayOrder });
    setShowForm(true);
  };

  const applyAiSuggestion = (suggestion: { topicName: string; topicCode: string; description?: string; suggestedWords?: WordPayload[] }) => {
    setForm((current) => ({
      ...current,
      topicName: current.topicName.trim() || suggestion.topicName,
      topicCode: current.topicCode.trim() || suggestion.topicCode,
      description: suggestion.description || current.description,
    }));
    if (suggestion.suggestedWords && suggestion.suggestedWords.length > 0) {
      setDraftWords(suggestion.suggestedWords);
    }
  };

  const handleSuggestTopicContent = async () => {
    const topicName = form.topicName.trim();
    if (!topicName) {
      toast.error('Vui lòng nhập tên chủ đề trước khi dùng AI');
      return;
    }

    setGeneratingDraft(true);
    try {
      const suggestion = await aiService.suggestTopicContent({
        topicName,
        description: (form.description || '').trim() || undefined,
        targetWordCount: 15,
        topicCategoryId: form.topicCategoryId,
      });

      applyAiSuggestion(suggestion as { topicName: string; topicCode: string; description?: string; suggestedWords?: WordPayload[] });
      toast.success('AI đã gợi ý nội dung cho chủ đề');
    } catch (error) {
      console.error('Không thể lấy gợi ý chủ đề từ AI', error);
      toast.error('Không thể tạo gợi ý AI');
    } finally {
      setGeneratingDraft(false);
    }
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
        const createdTopic = await creatorService.createTopic(form);
        if (!createdTopic?.id) {
          throw new Error('Tạo chủ đề xong nhưng không nhận được TopicID');
        }

        if (draftWords.length > 0) {
          const words = draftWords.map((word) => ({
            term: word.term,
            meaning: word.meaning || `Từ liên quan đến ${form.topicName}`,
            phonetic: word.phonetic,
            partOfSpeechId: word.partOfSpeechId || 1,
            topicIds: [createdTopic.id],
            examples: word.examples,
            mediaIds: word.mediaIds,
          }));
          await creatorService.bulkCreateWords({ words, conflictStrategy: 'skip' });
        }
        toast.success('Tạo chủ đề thành công');
      }
      setShowForm(false);
      setDraftWords([]);
      await loadData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    triggerConfirm({
      title: 'Xóa chủ đề',
      message: 'Bạn có chắc chắn muốn xóa chủ đề này? Hành động này sẽ xóa vĩnh viễn chủ đề và không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await creatorService.deleteTopic(id);
          toast.success('Đã xóa chủ đề');
          await loadData();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Không thể xóa');
        }
      }
    });
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

  const handleWithdraw = (id: number) => {
    triggerConfirm({
      title: 'Thu hồi yêu cầu duyệt',
      message: 'Bạn có chắc chắn muốn thu hồi yêu cầu duyệt cho chủ đề này? Trạng thái sẽ trở về Bản nháp.',
      confirmText: 'Thu hồi',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await creatorService.withdrawTopic(id);
          toast.success('Đã thu hồi yêu cầu duyệt');
          await loadData();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Không thể thu hồi');
        }
      }
    });
  };

  const handleDuplicate = (id: number) => {
    triggerConfirm({
      title: 'Sao chép chủ đề',
      message: 'Bạn có muốn sao chép chủ đề này cùng toàn bộ từ vựng và câu hỏi bên trong không?',
      confirmText: 'Sao chép',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await creatorService.duplicateTopic(id);
          toast.success('Sao chép chủ đề thành công');
          await loadData();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Không thể sao chép');
        }
      }
    });
  };

  const handleViewLogs = async (id: number, name: string) => {
    setLoadingLogs(true);
    setSelectedTopicName(name);
    setSelectedTopicLogs([]);
    setShowLogs(true);
    try {
      const logs = await creatorService.getTopicReviewLogs(id);
      setSelectedTopicLogs(logs);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải lịch sử duyệt');
      setShowLogs(false);
    } finally {
      setLoadingLogs(false);
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
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSuggestTopicContent}
                  disabled={generatingDraft}
                  className="rounded-xl gap-2"
                >
                  {generatingDraft && <Loader2 className="animate-spin h-4 w-4" />}
                  Gợi ý AI
                </Button>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-500" /></button>
              </div>
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
              {draftWords.length > 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase text-slate-500">Từ vựng AI sẽ được tạo cùng topic</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {draftWords.slice(0, 12).map((word) => (
                      <span key={word.term} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                        {word.term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                      {t.contentStatus === 'PendingReview' && (
                        <button onClick={() => handleWithdraw(t.id)} title="Thu hồi yêu cầu duyệt" className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      {(t.contentStatus === 'Draft' || t.contentStatus === 'Rejected') && (
                        <button onClick={() => handleSubmitReview(t.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500">
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(t)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDuplicate(t.id)} title="Sao chép chủ đề" className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-500">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleViewLogs(t.id, t.name)} title="Xem lịch sử phê duyệt" className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-500">
                        <History className="h-4 w-4" />
                      </button>
                      {(t.contentStatus === 'Draft' || t.contentStatus === 'PendingReview') && (
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

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowLogs(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-xl space-y-4 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3 dark:border-white/10">
              <h2 className="text-lg font-bold">Lịch sử phê duyệt: {selectedTopicName}</h2>
              <button onClick={() => setShowLogs(false)}><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 py-2">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
              ) : selectedTopicLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Chưa có lịch sử phê duyệt cho chủ đề này.</div>
              ) : (
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6 py-2">
                  {selectedTopicLogs.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500" />
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{log.actionByName || 'Hệ thống'}</span>
                        <span>{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono">Trạng thái:</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge[log.newStatus] || ''}`}>
                          {statusLabels[log.newStatus] || log.newStatus}
                        </span>
                      </div>
                      {log.comment && (
                        <div className="mt-2 text-sm p-3 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-white/5">
                          "{log.comment}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-3 border-t dark:border-white/10">
              <Button onClick={() => setShowLogs(false)} className="rounded-xl">Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${confirmDialog.isDestructive ? 'bg-red-50 text-red-500 dark:bg-red-950/30' : 'bg-blue-50 text-blue-500 dark:bg-blue-950/30'}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{confirmDialog.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} className="rounded-xl">
                {confirmDialog.cancelText || 'Hủy'}
              </Button>
              <Button 
                variant={confirmDialog.isDestructive ? 'destructive' : 'default'} 
                onClick={confirmDialog.onConfirm} 
                className="rounded-xl"
              >
                {confirmDialog.confirmText || 'Xác nhận'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
