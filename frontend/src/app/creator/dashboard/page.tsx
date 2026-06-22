'use client';

import React, { useEffect, useState } from 'react';
import { creatorService } from '@/src/services/creator.service';
import { BarChart3, BookOpen, FileQuestion, FileText, ListChecks, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  TotalTopics?: number;
  TotalWords?: number;
  TotalQuestions?: number;
  TotalMiniTests?: number;
  PublishedTopics?: number;
  PublishedWords?: number;
  DraftTopics?: number;
  PendingReviewTopics?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ContentSummaryItem {
  EntityType: string;
  ContentStatus: string;
  Total: number;
}

export default function CreatorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [summary, setSummary] = useState<ContentSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([
        creatorService.getDashboard(),
        creatorService.getContentSummary(),
      ]);
      setStats(s);
      setSummary(c);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  const cards = [
    { label: 'Chủ đề', value: stats.TotalTopics ?? 0, icon: BookOpen, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Từ vựng', value: stats.TotalWords ?? 0, icon: FileText, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Câu hỏi', value: stats.TotalQuestions ?? 0, icon: FileQuestion, color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Bài test', value: stats.TotalMiniTests ?? 0, icon: ListChecks, color: 'bg-purple-500/10 text-purple-500' },
  ];

  // Group summary by EntityType
  const grouped: Record<string, ContentSummaryItem[]> = {};
  summary.forEach((item) => {
    if (!grouped[item.EntityType]) grouped[item.EntityType] = [];
    grouped[item.EntityType].push(item);
  });

  const statusColors: Record<string, string> = {
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

  const typeLabels: Record<string, string> = {
    Topic: 'Chủ đề',
    Word: 'Từ vựng',
    Question: 'Câu hỏi',
    MiniTest: 'Bài test',
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bảng điều khiển Người tạo</h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan nội dung của bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-400" /> Chi tiết theo trạng thái
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-3">
              <h3 className="font-semibold text-sm">{typeLabels[type] || type}</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.ContentStatus} className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.ContentStatus] || ''}`}>
                      {statusLabels[item.ContentStatus] || item.ContentStatus}
                    </span>
                    <span className="text-sm font-bold">{item.Total}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
