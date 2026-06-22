'use client';
import React, { useEffect, useState } from 'react';
import { creatorService } from '@/src/services/creator.service';
import { BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryItem { EntityType: string; ContentStatus: string; Total: number; }

export default function CreatorAnalyticsPage() {
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setSummary(await creatorService.getContentSummary()); }
      catch { toast.error('Không thể tải'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  const grouped: Record<string, SummaryItem[]> = {};
  summary.forEach((s) => { if (!grouped[s.EntityType]) grouped[s.EntityType] = []; grouped[s.EntityType].push(s); });

  const statusColors: Record<string, string> = {
    Draft: 'bg-slate-400', PendingReview: 'bg-amber-400', Published: 'bg-emerald-400', Rejected: 'bg-red-400', Archived: 'bg-gray-400',
  };

  const statusLabels: Record<string, string> = {
    Draft: 'Bản nháp',
    PendingReview: 'Chờ duyệt',
    Published: 'Đã xuất bản',
    Rejected: 'Bị từ chối',
    Archived: 'Đã lưu trữ',
  };

  const typeLabels: Record<string, string> = {
    Topic: 'Chủ đề',
    Word: 'Từ vựng',
    Question: 'Câu hỏi',
    MiniTest: 'Bài test',
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-500" /> Phân tích nội dung</h1>
        <p className="text-slate-500 text-sm mt-1">Thống kê hiệu quả tạo nội dung của bạn</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(grouped).map(([type, items]) => {
          const total = items.reduce((s, i) => s + i.Total, 0);
          return (
            <div key={type} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{typeLabels[type] || type}</h3>
                <span className="text-2xl font-bold">{total}</span>
              </div>
              {/* Simple bar chart */}
              <div className="space-y-2">
                {items.map((item) => {
                  const pct = total > 0 ? Math.round((item.Total / total) * 100) : 0;
                  return (
                    <div key={item.ContentStatus} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{statusLabels[item.ContentStatus] || item.ContentStatus}</span>
                        <span className="font-medium">{item.Total} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${statusColors[item.ContentStatus] || 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-12 text-centertext-slate-500">Chưa có dữ liệu phân tích. Hãy tạo nội dung trước!</div>
      )}
    </div>
  );
}
