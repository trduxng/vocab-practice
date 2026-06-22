'use client';
import React, { useEffect, useState } from 'react';
import { creatorService } from '@/src/services/creator.service';
import { Edit3, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem { id: number; name?: string; term?: string; title?: string; questionText?: string; contentStatus: string; createdAt: string; type: string; }

export default function CreatorDraftsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const typeLabels: Record<string, string> = {
    Topic: 'Chủ đề',
    Word: 'Từ vựng',
    Question: 'Câu hỏi',
    MiniTest: 'Bài test',
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [topics, words, questions, tests] = await Promise.all([
        creatorService.getTopics({ status: 'Draft' }),
        creatorService.getWords({ status: 'Draft' }),
        creatorService.getQuestions({ status: 'Draft' }),
        creatorService.getMiniTests({ status: 'Draft' }),
      ]);
      const all: ContentItem[] = [
        ...topics.map((t: any) => ({ ...t, name: t.name, type: 'Topic' })),
        ...words.map((w: any) => ({ ...w, name: w.term, type: 'Word' })),
        ...questions.map((q: any) => ({ ...q, name: q.questionText?.substring(0, 60), type: 'Question' })),
        ...tests.map((m: any) => ({ ...m, name: m.title, type: 'MiniTest' })),
      ];
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(all);
    } catch { toast.error('Không thể tải dữ liệu'); } finally { setLoading(false); }
  };

  const handleSubmit = async (item: ContentItem) => {
    try {
      if (item.type === 'Topic') await creatorService.submitTopicForReview(item.id);
      else if (item.type === 'Word') await creatorService.submitWordForReview(item.id);
      else if (item.type === 'Question') await creatorService.submitQuestionForReview(item.id);
      else if (item.type === 'MiniTest') await creatorService.submitMiniTestForReview(item.id);
      toast.success('Đã gửi duyệt');
      await loadAll();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Lỗi'); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Edit3 className="h-6 w-6 text-slate-400" /> Bản nháp</h1>
        <p className="text-slate-500 text-sm mt-1">Tất cả nội dung đang ở trạng thái Draft</p>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Không có bản nháp nào</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 shrink-0">{typeLabels[item.type] || item.type}</span>
                  <span className="truncate font-medium">{item.name || '—'}</span>
                </div>
                <button onClick={() => handleSubmit(item)} title="Gửi duyệt" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-medium transition-colors">
                  <Send className="h-3.5 w-3.5" /> Gửi duyệt
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
