'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { creatorService, QuestionPayload, Question } from '@/src/services/creator.service';
import { Plus, Pencil, Trash2, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

const statusBadge: Record<string,string> = { Draft:'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300', PendingReview:'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', Published:'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', Rejected:'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
const statusLabels: Record<string, string> = { Draft: 'Bản nháp', PendingReview: 'Chờ duyệt', Published: 'Đã xuất bản', Rejected: 'Bị từ chối' };
const qTypes = ['MultipleChoice','FillInBlank','TrueFalse','Matching','Listening'];

export default function CreatorQuestionsPage() {
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Question|null>(null);
  const [form, setForm] = useState<QuestionPayload>({ wordId:0, questionType:'MultipleChoice', questionText:'', optionsJson:'[]', correctAnswer:'', explanation:'' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await creatorService.getQuestions()); } catch { toast.error('Không thể tải'); } finally { setLoading(false); }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ wordId:0, questionType:'MultipleChoice', questionText:'', optionsJson:'[]', correctAnswer:'', explanation:'' }); setShowForm(true); };
  const openEdit = (q: Question) => { setEditing(q); setForm({ wordId:q.wordId, questionType:q.questionType, questionText:q.questionText, optionsJson:q.optionsJson||'[]', correctAnswer:q.correctAnswer, explanation:q.explanation||'' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.questionText.trim()||!form.correctAnswer.trim()) { toast.error('Nội dung và đáp án bắt buộc'); return; }
    setSaving(true);
    try {
      if (editing) { await creatorService.updateQuestion(editing.id, form); toast.success('Cập nhật OK'); }
      else { await creatorService.createQuestion(form); toast.success('Tạo OK'); }
      setShowForm(false); await load();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) { toast.error(e.response?.data?.message||'Lỗi'); } finally { setSaving(false); }
  };
  const handleDelete = async (id:number) => { if (!confirm('Xóa?')) return; try { await creatorService.deleteQuestion(id); toast.success('Đã xóa'); await load(); } catch { toast.error('Lỗi'); } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (id:number) => { try { await creatorService.submitQuestionForReview(id); toast.success('Đã gửi duyệt'); await load(); } catch (e:any) { toast.error(e.response?.data?.message||'Lỗi'); } };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Quản lý Câu hỏi</h1><p className="text-slate-600 text-sm mt-1">Tạo và quản lý câu hỏi kiểm tra</p></div>
        <Button onClick={openCreate} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Tạo mới</Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 dark:border-white/10" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{editing?'Sửa':'Tạo'} câu hỏi</h2><button onClick={()=>setShowForm(false)}><X className="h-5 w-5 text-slate-500"/></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Word ID *</label><Input type="number" value={form.wordId} onChange={e=>setForm({...form,wordId:Number(e.target.value)})} className="mt-1"/></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Loại</label>
                <select value={form.questionType} onChange={e=>setForm({...form,questionType:e.target.value})} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                  {qTypes.map(t=><option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Nội dung *</label><textarea value={form.questionText} onChange={e=>setForm({...form,questionText:e.target.value})} rows={3} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none"/></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Options JSON</label><textarea value={form.optionsJson} onChange={e=>setForm({...form,optionsJson:e.target.value})} rows={2} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono resize-none" placeholder='["A","B","C","D"]'/></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Đáp án đúng *</label><Input value={form.correctAnswer} onChange={e=>setForm({...form,correctAnswer:e.target.value})} className="mt-1"/></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Giải thích</label><textarea value={form.explanation} onChange={e=>setForm({...form,explanation:e.target.value})} rows={2} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none"/></div>
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
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Câu hỏi</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Từ</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Loại</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
            </tr></thead>
            <tbody>{items.length===0?(
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">Chưa có câu hỏi nào</td></tr>
            ):items.map(q=>(
              <tr key={q.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium max-w-xs truncate">{q.questionText}</td>
                <td className="px-4 py-3 text-slate-500">{q.wordTerm||'—'}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500">{q.questionType}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[q.contentStatus]||''}`}>{statusLabels[q.contentStatus] || q.contentStatus}</span></td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  {(q.contentStatus==='Draft'||q.contentStatus==='Rejected')&&<button onClick={()=>handleSubmit(q.id)} title="Gửi duyệt" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><Send className="h-4 w-4"/></button>}
                  <button onClick={()=>openEdit(q)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Pencil className="h-4 w-4"/></button>
                  {q.contentStatus==='Draft'&&<button onClick={()=>handleDelete(q.id)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4"/></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
