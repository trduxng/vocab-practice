'use client';
import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/src/lib/api-client';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

interface TopicCategory { id: number; name: string; code: string; description: string; iconUrl: string; displayOrder: number; isActive: boolean; }

export default function AdminTopicCategoriesPage() {
  const [items, setItems] = useState<TopicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TopicCategory|null>(null);
  const [form, setForm] = useState({ name:'', code:'', description:'', iconUrl:'', displayOrder:0, isActive:true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const res = await apiClient.get('/creator/topic-categories'); setItems(res.data); }
    catch { toast.error('Không thể tải'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name:'', code:'', description:'', iconUrl:'', displayOrder:0, isActive:true }); setShowForm(true); };
  const openEdit = (c: TopicCategory) => { setEditing(c); setForm({ name:c.name, code:c.code, description:c.description||'', iconUrl:c.iconUrl||'', displayOrder:c.displayOrder, isActive:c.isActive }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()||!form.code.trim()) { toast.error('Tên và mã bắt buộc'); return; }
    setSaving(true);
    try {
      const payload = { categoryName:form.name, categoryCode:form.code, description:form.description, iconUrl:form.iconUrl, displayOrder:form.displayOrder, isActive:form.isActive };
      if (editing) { await apiClient.put(`/admin/topic-categories/${editing.id}`, payload); toast.success('Cập nhật OK'); }
      else { await apiClient.post('/admin/topic-categories', payload); toast.success('Tạo OK'); }
      setShowForm(false); await load();
    } catch (e:any) { toast.error(e.response?.data?.message||'Lỗi'); } finally { setSaving(false); }
  };
  const handleDelete = async (id:number) => { if (!confirm('Xóa danh mục?')) return; try { await apiClient.delete(`/admin/topic-categories/${id}`); toast.success('Đã xóa'); await load(); } catch { toast.error('Lỗi'); } };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Danh mục Chủ đề</h1><p className="text-slate-500 text-sm mt-1">Quản lý Topic Categories (chỉ Admin)</p></div>
        <Button onClick={openCreate} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Tạo mới</Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-slate-200 dark:border-white/10" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{editing?'Sửa':'Tạo'} danh mục</h2><button onClick={()=>setShowForm(false)}><X className="h-5 w-5 text-slate-400"/></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Tên *</label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1"/></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Mã *</label><Input value={form.code} onChange={e=>setForm({...form,code:e.target.value})} className="mt-1"/></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Mô tả</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none"/></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Icon URL</label><Input value={form.iconUrl} onChange={e=>setForm({...form,iconUrl:e.target.value})} className="mt-1"/></div>
              <div><label className="text-xs font-semibold text-slate-500 uppercase">Thứ tự</label><Input type="number" value={form.displayOrder} onChange={e=>setForm({...form,displayOrder:Number(e.target.value)})} className="mt-1"/></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} className="rounded"/> Kích hoạt</label>
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
            <thead><tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Tên</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Mã</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thứ tự</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
            </tr></thead>
            <tbody>{items.length===0?(
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">Chưa có danh mục nào</td></tr>
            ):items.map(c=>(
              <tr key={c.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.code}</td>
                <td className="px-4 py-3 text-slate-500">{c.displayOrder}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive?'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300':'bg-slate-200 text-slate-600'}`}>{c.isActive?'Active':'Inactive'}</span></td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  <button onClick={()=>openEdit(c)} title="Sửa" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Pencil className="h-4 w-4"/></button>
                  <button onClick={()=>handleDelete(c.id)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4"/></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
