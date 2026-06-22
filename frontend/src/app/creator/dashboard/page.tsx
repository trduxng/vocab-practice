"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, Clock3, FileQuestion, FileText, ListChecks, RefreshCw, XCircle } from "lucide-react";
import { creatorService } from "@/src/services/creator.service";
import {
  CreatorErrorState,
  CreatorHeader,
  CreatorLoadingState,
  CreatorPage,
  CreatorPanel,
  CreatorStatusBadge,
  ToolbarButton,
} from "@/src/components/creator/CreatorPrimitives";
import { getCreatorErrorMessage } from "@/src/lib/creator-utils";

type DashboardStats = {
  TotalTopics?: number;
  TotalWords?: number;
  TotalQuestions?: number;
  TotalMiniTests?: number;
  TotalDrafts?: number;
  TotalPendingReview?: number;
  TotalRejected?: number;
};

type SummaryItem = {
  EntityType: "Topic" | "Word" | "Question" | "MiniTest";
  ContentStatus: "Draft" | "PendingReview" | "Published" | "Rejected" | "Archived";
  Total: number;
};

export default function CreatorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboard, contentSummary] = await Promise.all([creatorService.getDashboard(), creatorService.getContentSummary()]);
      setStats(dashboard);
      setSummary(contentSummary);
    } catch (loadError) {
      setError(getCreatorErrorMessage(loadError, "Không thể tải dashboard Creator"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const grouped = useMemo(() => {
    return summary.reduce<Record<string, SummaryItem[]>>((result, item) => {
      result[item.EntityType] = [...(result[item.EntityType] || []), item];
      return result;
    }, {});
  }, [summary]);

  const cards = [
    { label: "Chủ đề", value: stats.TotalTopics || 0, icon: BookOpen, tone: "blue" },
    { label: "Từ vựng", value: stats.TotalWords || 0, icon: FileText, tone: "emerald" },
    { label: "Câu hỏi", value: stats.TotalQuestions || 0, icon: FileQuestion, tone: "amber" },
    { label: "Mini test", value: stats.TotalMiniTests || 0, icon: ListChecks, tone: "violet" },
  ] as const;

  return (
    <CreatorPage>
      <CreatorHeader title="Dashboard Creator" description="Tổng quan nội dung do bạn tạo và trạng thái kiểm duyệt." action={<ToolbarButton onClick={() => void load()}><RefreshCw className="h-4 w-4" />Làm mới</ToolbarButton>} />
      {loading ? <CreatorLoadingState label="Đang tải dashboard Creator..." /> : error ? <CreatorErrorState description={error} onRetry={() => void load()} /> : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{card.label}</p><card.icon className="h-5 w-5 text-slate-400" /></div><p className="mt-4 text-3xl font-semibold">{card.value.toLocaleString("vi-VN")}</p></div>)}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CreatorPanel><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Bản nháp</p><p className="mt-2 text-2xl font-semibold">{stats.TotalDrafts || 0}</p></div><FileText className="h-6 w-6 text-slate-400" /></div></CreatorPanel>
            <CreatorPanel><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Chờ duyệt</p><p className="mt-2 text-2xl font-semibold">{stats.TotalPendingReview || 0}</p></div><Clock3 className="h-6 w-6 text-amber-500" /></div></CreatorPanel>
            <CreatorPanel><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Bị từ chối</p><p className="mt-2 text-2xl font-semibold">{stats.TotalRejected || 0}</p></div><XCircle className="h-6 w-6 text-rose-500" /></div></CreatorPanel>
          </div>
          <CreatorPanel title="Chi tiết theo trạng thái" description="Số lượng từng loại nội dung trong quy trình kiểm duyệt." action={<BarChart3 className="h-4 w-4 text-slate-400" />}>
            {Object.keys(grouped).length === 0 ? <p className="py-10 text-center text-sm text-slate-500">Bạn chưa tạo nội dung nào.</p> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{Object.entries(grouped).map(([type, items]) => <div key={type} className="rounded-md border border-slate-200 p-4 dark:border-white/10"><h3 className="font-medium">{type}</h3><div className="mt-4 space-y-3">{items.map((item) => <div key={item.ContentStatus} className="flex items-center justify-between gap-3"><CreatorStatusBadge status={item.ContentStatus} /><span className="font-semibold">{item.Total}</span></div>)}</div></div>)}</div>}
          </CreatorPanel>
        </>
      )}
    </CreatorPage>
  );
}
