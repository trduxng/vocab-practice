'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { creatorService, WordPayload } from '@/src/services/creator.service';
import { Plus, Pencil, Trash2, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

interface Word {
  id: number;
  term: string;
  meaning: string;
  phonetic: string;
  partOfSpeechId: number;
  partOfSpeechName: string;
  contentStatus: string;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  Draft: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  PendingReview: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function CreatorWordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Word | null>(null);
  const [form, setForm] = useState<WordPayload>({ term: '', meaning: '', phonetic: '', partOfSpeechId: 1, topicIds: [], examples: [] });
  const [saving, setSaving] = useState(false);
  const [exampleInput, setExampleInput] = useState({ sentence: '', meaning: '' });

  const loadData = useCallback(async () => {
    try {
      const data = await creatorService.getWords();
      setWords(data);
    } catch (err: any) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ term: '', meaning: '', phonetic: '', partOfSpeechId: 1, topicIds: [], examples: [] });
    setShowForm(true);
  };

  const openEdit = (w: Word) => {
    setEditing(w);
    setForm({ term: w.term, meaning: w.meaning, phonetic: w.phonetic || '', partOfSpeechId: w.partOfSpeechId });
    setShowForm(true);
  };

  const addExample = () => {
    if (!exampleInput.sentence.trim()) return;
    setForm({ ...form, examples: [...(form.examples || []), { ...exampleInput }] });
    setExampleInput({ sentence: '', meaning: '' });
  };

  const removeExample = (idx: number) => {
    setForm({ ...form, examples: (form.examples || []).filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form.term.trim() || !form.meaning.trim()) {
      toast.error('Từ và nghĩa là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await creatorService.updateWord(editing.id, form);
        toast.success('Cập nhật thành công');
      } else {
        await creatorService.createWord(form);
        toast.success('Tạo từ vựng thành công');
      }
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa từ vựng này?')) return;
    try {
      await creatorService.deleteWord(id);
      toast.success('Đã xóa');
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa');
    }
  };

  const handleSubmitReview = async (id: number) => {
    try {
      await creatorService.submitWordForReview(id);
      toast.success('Đã gửi duyệt');
      await loadData();
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
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Từ vựng</h1>
          <p className="text-slate-500 text-sm mt-1">Tạo và quản lý từ vựng của bạn</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Tạo mới</Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Sửa từ vựng' : 'Tạo từ vựng mới'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Từ (Term) *</label>
                <Input value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} placeholder="example" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Nghĩa *</label>
                <Input value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="ví dụ" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Phiên âm</label>
                <Input value={form.phonetic} onChange={(e) => setForm({ ...form, phonetic: e.target.value })} placeholder="/ɪɡˈzæm.pəl/" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Loại từ (PartOfSpeechID)</label>
                <Input type="number" value={form.partOfSpeechId} onChange={(e) => setForm({ ...form, partOfSpeechId: Number(e.target.value) })} className="mt-1" />
              </div>

              {/* Examples (chỉ khi tạo mới) */}
              {!editing && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Câu ví dụ</label>
                  {(form.examples || []).map((ex, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-white/5 rounded-lg px-3 py-2">
                      <span className="flex-1">{ex.sentence}</span>
                      <button onClick={() => removeExample(idx)} className="text-red-400"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input value={exampleInput.sentence} onChange={(e) => setExampleInput({ ...exampleInput, sentence: e.target.value })} placeholder="Câu ví dụ" className="flex-1 text-xs" />
                    <Input value={exampleInput.meaning} onChange={(e) => setExampleInput({ ...exampleInput, meaning: e.target.value })} placeholder="Nghĩa" className="w-32 text-xs" />
                    <Button type="button" variant="outline" size="sm" onClick={addExample}>+</Button>
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
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Từ</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Nghĩa</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Phiên âm</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Loại từ</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {words.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Chưa có từ vựng nào</td></tr>
              ) : words.map((w) => (
                <tr key={w.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium">{w.term}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{w.meaning}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{w.phonetic || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{w.partOfSpeechName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[w.contentStatus] || ''}`}>{w.contentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {(w.contentStatus === 'Draft' || w.contentStatus === 'Rejected') && (
                        <button onClick={() => handleSubmitReview(w.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><Send className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => openEdit(w)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Pencil className="h-4 w-4" /></button>
                      {w.contentStatus === 'Draft' && (
                        <button onClick={() => handleDelete(w.id)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
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
