"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileQuestion,
  FileText,
  History,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

type EntityType = "Topic" | "Word" | "Question" | "MiniTest";
type FilterType = "All" | EntityType;
type Tone = "slate" | "blue" | "emerald" | "amber" | "rose" | "violet";

type PendingItem = {
  entityType: EntityType;
  entityId: number;
  title: string;
  status: "PendingReview";
  creatorId: number;
  creatorName: string;
  createdAt: string;
};

type ReviewLog = {
  id: number;
  oldStatus?: string | null;
  newStatus: string;
  comment?: string | null;
  createdAt: string;
  actionByName: string;
};

const filterTypes: FilterType[] = ["All", "Topic", "Word", "Question", "MiniTest"];

const typeTone: Record<EntityType, Tone> = {
  Topic: "blue",
  Word: "emerald",
  Question: "amber",
  MiniTest: "violet",
};

const typeLabel: Record<FilterType, string> = {
  All: "Tất cả",
  Topic: "Chủ đề",
  Word: "Từ vựng",
  Question: "Câu hỏi",
  MiniTest: "Mini test",
};

const typeIcon = {
  Topic: Layers3,
  Word: FileText,
  Question: FileQuestion,
  MiniTest: ShieldCheck,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getErrorMessage(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { message?: string } } };
  return responseError.response?.data?.message || fallback;
}

export default function AdminContentReviewPage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<PendingItem | null>(null);
  const [logs, setLogs] = useState<ReviewLog[]>([]);
  const [logTarget, setLogTarget] = useState<PendingItem | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);

  async function loadContent(options: { quiet?: boolean } = {}) {
    if (options.quiet) setRefreshing(true);
    try {
      const data = await adminService.getPendingContent();
      setItems(data as PendingItem[]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách chờ duyệt"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadContent();
  }, []);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.All += 1;
        acc[item.entityType] += 1;
        return acc;
      },
      { All: 0, Topic: 0, Word: 0, Question: 0, MiniTest: 0 } as Record<FilterType, number>
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesType = typeFilter === "All" || item.entityType === typeFilter;
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.creatorName.toLowerCase().includes(normalizedQuery) ||
        String(item.entityId).includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [items, query, typeFilter]);

  async function approve(item: PendingItem) {
    const key = `${item.entityType}-${item.entityId}-approve`;
    setBusyKey(key);
    try {
      await adminService.approveContent(item.entityType, item.entityId);
      toast.success(`Đã duyệt ${typeLabel[item.entityType].toLowerCase()}`);
      await loadContent({ quiet: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Duyệt nội dung thất bại"));
    } finally {
      setBusyKey(null);
    }
  }

  async function reject() {
    if (!rejectTarget) return;

    const key = `${rejectTarget.entityType}-${rejectTarget.entityId}-reject`;
    setBusyKey(key);
    try {
      await adminService.rejectContent(rejectTarget.entityType, rejectTarget.entityId, rejectReason.trim() || undefined);
      toast.success("Đã từ chối nội dung");
      setRejectTarget(null);
      setRejectReason("");
      await loadContent({ quiet: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Từ chối nội dung thất bại"));
    } finally {
      setBusyKey(null);
    }
  }

  async function archive(item: PendingItem) {
    if (!window.confirm(`Lưu trữ "${item.title}"?`)) return;

    const key = `${item.entityType}-${item.entityId}-archive`;
    setBusyKey(key);
    try {
      await adminService.archiveContent(item.entityType, item.entityId);
      toast.success("Đã lưu trữ nội dung");
      await loadContent({ quiet: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Lưu trữ nội dung thất bại"));
    } finally {
      setBusyKey(null);
    }
  }

  async function viewLogs(item: PendingItem) {
    setLogTarget(item);
    setLogs([]);
    setLogsLoading(true);
    try {
      const data = await adminService.getReviewLogs(item.entityType, item.entityId);
      setLogs(data as ReviewLog[]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải lịch sử duyệt"));
    } finally {
      setLogsLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Duyệt nội dung" subtitle="Phê duyệt, từ chối hoặc lưu trữ nội dung do Creator gửi lên." role="admin" userName="Admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Đang chờ" value={String(counts.All)} change="Nội dung cần xử lý" icon={Clock3} tone="amber" />
          <KpiCard label="Từ vựng" value={String(counts.Word)} change="Word pending" icon={FileText} tone="emerald" />
          <KpiCard label="Câu hỏi" value={String(counts.Question)} change="Question pending" icon={FileQuestion} tone="blue" />
          <KpiCard label="Bài học/test" value={String(counts.Topic + counts.MiniTest)} change="Topic và mini test" icon={Layers3} tone="violet" />
        </div>

        <AdminPanel
          title="Hàng đợi duyệt"
          description="Chỉ hiển thị nội dung có trạng thái PendingReview."
          action={
            <ToolbarButton onClick={() => void loadContent({ quiet: true })}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Làm mới
            </ToolbarButton>
          }
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterTypes.map((type) => (
                <ToolbarButton key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>
                  {typeLabel[type]}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">{counts[type]}</span>
                </ToolbarButton>
              ))}
            </div>

            <div className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 lg:w-80 dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tiêu đề, người tạo, ID"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14 text-slate-500 dark:text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tải nội dung chờ duyệt...
            </div>
          ) : (
            <TableShell>
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nội dung</th>
                    <th className="px-4 py-3 font-medium">Loại</th>
                    <th className="px-4 py-3 font-medium">Người tạo</th>
                    <th className="px-4 py-3 font-medium">Ngày gửi</th>
                    <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                        Không có nội dung phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const Icon = typeIcon[item.entityType];
                      const rowBusy = busyKey?.startsWith(`${item.entityType}-${item.entityId}-`);

                      return (
                        <tr key={`${item.entityType}-${item.entityId}`} className="hover:bg-slate-50 dark:hover:bg-white/5">
                          <td className="px-4 py-4">
                            <p className="max-w-md truncate font-medium text-slate-950 dark:text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {item.entityType} #{item.entityId}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge tone={typeTone[item.entityType]}>
                              <Icon className="mr-1.5 h-3.5 w-3.5" />
                              {typeLabel[item.entityType]}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-slate-400" />
                              <div>
                                <p>{item.creatorName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">User #{item.creatorId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-slate-400" />
                              {formatDate(item.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => void approve(item)}
                                disabled={rowBusy}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectTarget(item);
                                  setRejectReason("");
                                }}
                                disabled={rowBusy}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                              >
                                <XCircle className="h-4 w-4" />
                                Từ chối
                              </button>
                              <button
                                type="button"
                                onClick={() => void archive(item)}
                                disabled={rowBusy}
                                title="Lưu trữ"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:text-slate-950 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void viewLogs(item)}
                                title="Xem lịch sử"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </TableShell>
          )}
        </AdminPanel>

        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setRejectTarget(null)}>
            <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">Từ chối nội dung</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{rejectTarget.title}</p>
              </div>
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={4}
                placeholder="Nhập lý do để Creator biết cần chỉnh gì"
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              />
              <div className="mt-4 flex justify-end gap-2">
                <ToolbarButton onClick={() => setRejectTarget(null)}>Hủy</ToolbarButton>
                <button
                  type="button"
                  onClick={() => void reject()}
                  disabled={busyKey?.endsWith("-reject")}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-rose-600 bg-rose-600 px-3 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        )}

        {logTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setLogTarget(null)}>
            <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Lịch sử duyệt</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{logTarget.title}</p>
                </div>
                <History className="h-5 w-5 text-slate-400" />
              </div>

              <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8 text-sm text-slate-500 dark:text-slate-400">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải lịch sử...
                  </div>
                ) : logs.length === 0 ? (
                  <p className="rounded-md border border-slate-200 px-3 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    Chưa có lịch sử duyệt.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="rounded-md border border-slate-200 p-3 dark:border-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-950 dark:text-white">
                          {log.oldStatus || "None"} → {log.newStatus}
                        </p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(log.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bởi {log.actionByName}</p>
                      {log.comment && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{log.comment}</p>}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <ToolbarButton onClick={() => setLogTarget(null)}>Đóng</ToolbarButton>
              </div>
            </div>
          </div>
        )}
      </AdminPage>
    </>
  );
}
