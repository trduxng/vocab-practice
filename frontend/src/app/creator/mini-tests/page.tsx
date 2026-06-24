'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { creatorService, MiniTestPayload, MiniTest, Topic } from '@/src/services/creator.service';
import { Plus, Pencil, Trash2, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

const statusBadge: Record<string,string> = { Draft:'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300', PendingReview:'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', Published:'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', Rejected:'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
const statusLabels: Record<string, string> = { Draft: 'Bản nháp', PendingReview: 'Chờ duyệt', Published: 'Đã xuất bản', Rejected: 'Bị từ chối' };

export default function CreatorMiniTestsPage() {
  const [items, setItems] = useState<MiniTest[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MiniTest|null>(null);
  const [form, setForm] = useState<MiniTestPayload>({ title:'', description:'', topicId:0, questionIds:[] });
  const [qidsInput, setQidsInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [testsRes, topicsRes] = await Promise.all([
        creatorService.getMiniTests(),
        creatorService.getTopics()
      ]);
      setItems(testsRes);
      setTopics(topicsRes);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title:'', description:'', topicId: topics[0]?.id || 0, questionIds:[] });
    setQidsInput('');
    setShowForm(true);
  };
  const openEdit = (t: MiniTest) => {
    setEditing(t);
    setForm({ title:t.title, description:t.description||'', topicId: t.topicId || 0 });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Tiêu đề bắt buộc'); return; }
    if (!form.topicId) { toast.error('Vui lòng chọn một chủ đề'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!editing && qidsInput.trim()) { payload.questionIds = qidsInput.split(',').map(s => Number(s.trim())).filter(n => n > 0); }
      if (editing) { await creatorService.updateMiniTest(editing.id, payload); toast.success('Cập nhật OK'); }
      else { await creatorService.createMiniTest(payload); toast.success('Tạo OK'); }
      setShowForm(false); await load();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) { toast.error(e.response?.data?.message||'Lỗi'); } finally { setSaving(false); }
  };
  const handleDelete = async (id:number) => { if (!confirm('Xóa bài test?')) return; try { await creatorService.deleteMiniTest(id); toast.success('Đã xóa'); await load(); } catch { toast.error('Lỗi'); } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (id:number) => { try { await creatorService.submitMiniTestForReview(id); toast.success('Đã gửi duyệt'); await load(); } catch (e:any) { toast.error(e.response?.data?.message||'Lỗi'); } };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Quản lý Bài test</h1><p className="text-slate-600 text-sm mt-1">Tạo và quản lý mini tests</p></div>
        <Button onClick={openCreate} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Tạo mới</Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-slate-200 dark:border-white/10" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{editing?'Sửa':'Tạo'} bài test</h2><button onClick={()=>setShowForm(false)}><X className="h-5 w-5 text-slate-500"/></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Tiêu đề *</label><Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="mt-1"/></div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Chủ đề (Topic) *</label>
                <select
                  value={form.topicId || ''}
                  onChange={(e) => setForm({ ...form, topicId: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Mô tả</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none"/></div>
              {!editing && <div><label className="text-xs font-semibold text-slate-500 uppercase">Question IDs (phân cách dấu phẩy)</label><Input value={qidsInput} onChange={e=>setQidsInput(e.target.value)} placeholder="1,2,3" className="mt-1"/></div>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>setShowForm(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">{saving&&<Loader2 className="animate-spin h-4 w-4"/>}{editing?'Cập nhật':'Tạo'}</Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Chủ đề</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Số câu</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
            </tr></thead>
            <tbody>{items.length===0?(
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">Chưa có bài test nào</td></tr>
            ):items.map(t=>(
              <tr key={t.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium">{t.title}</td>
                <td className="px-4 py-3 text-slate-500">{t.topicName||'—'}</td>
                <td className="px-4 py-3 text-slate-500">{t.totalQuestions}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[t.contentStatus]||''}`}>{statusLabels[t.contentStatus] || t.contentStatus}</span></td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  {(t.contentStatus==='Draft'||t.contentStatus==='Rejected')&&<button onClick={()=>handleSubmit(t.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><Send className="h-4 w-4"/></button>}
                  <button onClick={()=>openEdit(t)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Pencil className="h-4 w-4"/></button>
                  {t.contentStatus==='Draft'&&<button onClick={()=>handleDelete(t.id)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4"/></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
