"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { creatorService, type ContentStatus } from "@/src/services/creator.service";
import {
  CreatorErrorState,
  CreatorHeader,
  CreatorLoadingState,
  CreatorPage,
  CreatorPanel,
  CreatorStatusBadge,
  ToolbarButton,
} from "@/src/components/creator/CreatorPrimitives";
import { contentTypeLabel, getCreatorErrorMessage } from "@/src/lib/creator-utils";

type SummaryItem = { EntityType: string; ContentStatus: ContentStatus; Total: number };

export default function CreatorAnalyticsPage() {
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSummary(await creatorService.getContentSummary());
    } catch (loadError) {
      setError(getCreatorErrorMessage(loadError, "Không thể tải phân tích nội dung"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const grouped = useMemo(() => summary.reduce<Record<string, SummaryItem[]>>((result, item) => {
    result[item.EntityType] = [...(result[item.EntityType] || []), item];
    return result;
  }, {}), [summary]);

  return (
    <CreatorPage>
      <CreatorHeader title="Phân tích nội dung" description="Theo dõi tỷ lệ nội dung ở từng trạng thái kiểm duyệt." action={<ToolbarButton onClick={() => void load()}><RefreshCw className="h-4 w-4" />Làm mới</ToolbarButton>} />
      {loading ? <CreatorLoadingState label="Đang tải phân tích..." /> : error ? <CreatorErrorState description={error} onRetry={() => void load()} /> : Object.keys(grouped).length === 0 ? (
        <CreatorPanel><div className="py-14 text-center"><BarChart3 className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm text-slate-500">Chưa có dữ liệu phân tích. Hãy tạo nội dung trước.</p></div></CreatorPanel>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(grouped).map(([type, items]) => {
            const total = items.reduce((sum, item) => sum + Number(item.Total || 0), 0);
            return (
              <CreatorPanel key={type}>
                <div className="flex items-center justify-between"><h2 className="font-semibold">{contentTypeLabel(type)}</h2><span className="text-2xl font-semibold">{total}</span></div>
                <div className="mt-5 space-y-4">{items.map((item) => { const percent = total ? Math.round((item.Total / total) * 100) : 0; return <div key={item.ContentStatus}><div className="flex items-center justify-between gap-3"><CreatorStatusBadge status={item.ContentStatus} /><span className="text-sm font-medium">{item.Total} · {percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-blue-500" style={{ width: `${percent}%` }} /></div></div>; })}</div>
              </CreatorPanel>
            );
          })}
        </div>
      )}
    </CreatorPage>
  );
}
