'use client';
import React, { useEffect, useState } from 'react';
import apiClient from '@/src/lib/api-client';
import { Check, X, Archive, Loader2, Eye } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { toast } from 'sonner';

interface PendingItem { entityType: string; entityId: number; title: string; status: string; creatorId: number; creatorName: string; createdAt: string; }
interface ReviewLog { id: number; actionType: string; notes: string; actionAt: string; actionByName: string; }

const typeBadge: Record<string,string> = { Topic:'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', Word:'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', Question:'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', MiniTest:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };

export default function AdminContentReviewPage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<PendingItem|null>(null);
  const [logs, setLogs] = useState<ReviewLog[]>([]);
  const [logTarget, setLogTarget] = useState<PendingItem|null>(null);

  const load = async () => {
    try { const res = await apiClient.get('/admin/content-review/pending'); setItems(res.data); }
    catch { toast.error('Không thể tải'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const approve = async (item: PendingItem) => {
    try { await apiClient.post(`/admin/content-review/${item.entityType}/${item.entityId}/approve`); toast.success(`Đã duyệt ${item.entityType}`); await load(); }
    catch (e:any) { toast.error(e.response?.data?.message||'Lỗi'); }
  };

  const reject = async () => {
    if (!rejectTarget) return;
    try { await apiClient.post(`/admin/content-review/${rejectTarget.entityType}/${rejectTarget.entityId}/reject`, { reason: rejectReason }); toast.success('Đã từ chối'); setRejectTarget(null); setRejectReason(''); await load(); }
    catch (e:any) { toast.error(e.response?.data?.message||'Lỗi'); }
  };

  const archive = async (item: PendingItem) => {
    if (!confirm('Lưu trữ nội dung này?')) return;
    try { await apiClient.post(`/admin/content-review/${item.entityType}/${item.entityId}/archive`); toast.success('Đã lưu trữ'); await load(); }
    catch (e:any) { toast.error(e.response?.data?.message||'Lỗi'); }
  };

  const viewLogs = async (item: PendingItem) => {
    try { const res = await apiClient.get(`/admin/content-review/${item.entityType}/${item.entityId}/logs`); setLogs(res.data); setLogTarget(item); }
    catch { toast.error('Lỗi tải log'); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Duyệt nội dung</h1><p className="text-slate-500 text-sm mt-1">Phê duyệt hoặc từ chối nội dung từ Creator</p></div>

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setRejectTarget(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-slate-200 dark:border-white/10" onClick={e=>e.stopPropagation()}>
            <h2 className="text-lg font-bold">Từ chối: {rejectTarget.title}</h2>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3} placeholder="Lý do từ chối..." className="w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none"/>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setRejectTarget(null)} className="rounded-xl">Hủy</Button>
              <Button onClick={reject} className="rounded-xl bg-red-600 hover:bg-red-500 text-white">Từ chối</Button>
            </div>
          </div>
        </div>
      )}

      {/* Log modal */}
      {logTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setLogTarget(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto space-y-3 shadow-2xl border border-slate-200 dark:border-white/10" onClick={e=>e.stopPropagation()}>
            <h2 className="text-lg font-bold">Lịch sử: {logTarget.title}</h2>
            {logs.length===0?<p className="text-slate-400 text-sm">Chưa có log</p>:logs.map(l=>(
              <div key={l.id} className="border-b border-slate-100 dark:border-white/5 pb-2 text-sm">
                <div className="flex justify-between"><span className="font-medium">{l.actionType}</span><span className="text-xs text-slate-400">{new Date(l.actionAt).toLocaleString('vi-VN')}</span></div>
                <p className="text-slate-500 text-xs">bởi {l.actionByName}</p>
                {l.notes&&<p className="text-slate-600 dark:text-slate-400 text-xs mt-1 italic">{l.notes}</p>}
              </div>
            ))}
            <Button variant="outline" onClick={()=>setLogTarget(null)} className="rounded-xl w-full mt-2">Đóng</Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        {items.length===0?(
          <div className="p-12 text-center text-slate-400">Không có nội dung nào chờ duyệt 🎉</div>
        ):(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Loại</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Tiêu đề</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Người tạo</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Ngày</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Thao tác</th>
              </tr></thead>
              <tbody>{items.map(item=>(
                <tr key={`${item.entityType}-${item.entityId}`} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge[item.entityType]||''}`}>{item.entityType}</span></td>
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3 text-slate-500">{item.creatorName}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                    <button onClick={()=>approve(item)} title="Duyệt" className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600"><Check className="h-4 w-4"/></button>
                    <button onClick={()=>{setRejectTarget(item);setRejectReason('');}} title="Từ chối" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><X className="h-4 w-4"/></button>
                    <button onClick={()=>archive(item)} title="Lưu trữ" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"><Archive className="h-4 w-4"/></button>
                    <button onClick={()=>viewLogs(item)} title="Xem log" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"><Eye className="h-4 w-4"/></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
