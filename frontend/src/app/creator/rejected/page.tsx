'use client';
import React, { useEffect, useState } from 'react';
import { creatorService } from '@/src/services/creator.service';
import { XCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem { id: number; name: string; type: string; createdAt: string; }

export default function CreatorRejectedPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [topics, words, questions, tests] = await Promise.all([
        creatorService.getTopics({ status: 'Rejected' }),
        creatorService.getWords({ status: 'Rejected' }),
        creatorService.getQuestions({ status: 'Rejected' }),
        creatorService.getMiniTests({ status: 'Rejected' }),
      ]);
      const all: ContentItem[] = [
        ...topics.map((t: any) => ({ id: t.id, name: t.name, type: 'Topic', createdAt: t.createdAt })),
        ...words.map((w: any) => ({ id: w.id, name: w.term, type: 'Word', createdAt: w.createdAt })),
        ...questions.map((q: any) => ({ id: q.id, name: q.questionText?.substring(0, 60), type: 'Question', createdAt: q.createdAt })),
        ...tests.map((m: any) => ({ id: m.id, name: m.title, type: 'MiniTest', createdAt: m.createdAt })),
      ];
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(all);
    } catch { toast.error('Không thể tải'); } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleResubmit = async (item: ContentItem) => {
    try {
      if (item.type === 'Topic') await creatorService.submitTopicForReview(item.id);
      else if (item.type === 'Word') await creatorService.submitWordForReview(item.id);
      else if (item.type === 'Question') await creatorService.submitQuestionForReview(item.id);
      else if (item.type === 'MiniTest') await creatorService.submitMiniTestForReview(item.id);
      toast.success('Đã gửi lại duyệt');
      await loadAll();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><XCircle className="h-6 w-6 text-red-500" /> Bị từ chối</h1>
        <p className="text-slate-500 text-sm mt-1">Nội dung bị Admin từ chối — hãy chỉnh sửa và gửi lại</p>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Không có nội dung nào bị từ chối 🎉</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 shrink-0">{item.type}</span>
                  <span className="truncate font-medium">{item.name || '—'}</span>
                </div>
                <button onClick={() => handleResubmit(item)} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-medium transition-colors">
                  <Send className="h-3.5 w-3.5" /> Gửi lại
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
