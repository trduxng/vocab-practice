'use client';
import React, { useEffect, useState } from 'react';
import { creatorService } from '@/src/services/creator.service';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem { id: number; name: string; type: string; createdAt: string; }

export default function CreatorPendingPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const typeLabels: Record<string, string> = {
    Topic: 'Chủ đề',
    Word: 'Từ vựng',
    Question: 'Câu hỏi',
    MiniTest: 'Bài test',
  };

  useEffect(() => {
    (async () => {
      try {
        const [topics, words, questions, tests] = await Promise.all([
          creatorService.getTopics({ status: 'PendingReview' }),
          creatorService.getWords({ status: 'PendingReview' }),
          creatorService.getQuestions({ status: 'PendingReview' }),
          creatorService.getMiniTests({ status: 'PendingReview' }),
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
    })();
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Clock className="h-6 w-6 text-amber-500" /> Chờ duyệt</h1>
        <p className="text-slate-500 text-sm mt-1">Nội dung đang chờ Admin phê duyệt</p>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Không có nội dung nào đang chờ duyệt</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shrink-0">{typeLabels[item.type] || item.type}</span>
                  <span className="truncate font-medium">{item.name || '—'}</span>
                </div>
                <span className="text-xs text-slate-500 shrink-0">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
