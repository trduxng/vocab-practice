"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Flag,
  MessageSquareReply,
  Search,
  ShieldAlert,
} from "lucide-react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminErrorState, AdminPage, AdminPanel, IconButton, KpiCard, StatusBadge, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { adminService, type PaginationMeta } from "@/src/services/admin.service";
import { Button } from "@/src/components/ui/button";
import { adminLabel, formatAdminDate } from "@/src/lib/admin-i18n";

type ReportStatus = "Open" | "InReview" | "Resolved" | "Rejected";
type ReportPriority = "Low" | "Normal" | "High" | "Urgent";
type ReportType = "WordIncorrect" | "AudioIssue" | "AnswerIncorrect" | "Typo" | "Other";
type EntityType = "Word" | "Question" | "Audio" | "General";

type ContentReport = {
  id: number;
  reporterName?: string;
  reporterEmail?: string;
  entityType: EntityType;
  wordId?: number | null;
  wordTerm?: string | null;
  wordMeaning?: string | null;
  questionId?: number | null;
  questionText?: string | null;
  correctAnswer?: string | null;
  reportType: ReportType;
  title: string;
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  adminResponse?: string | null;
  resolvedByName?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const statuses: Array<ReportStatus | ""> = ["", "Open", "InReview", "Resolved", "Rejected"];
const reportTypes: Array<ReportType | ""> = ["", "WordIncorrect", "AudioIssue", "AnswerIncorrect", "Typo", "Other"];
const entityTypes: Array<EntityType | ""> = ["", "Word", "Question", "Audio", "General"];
const priorities: Array<ReportPriority | ""> = ["", "Low", "Normal", "High", "Urgent"];

const statusTone: Record<ReportStatus, "blue" | "amber" | "emerald" | "rose"> = {
  Open: "blue",
  InReview: "amber",
  Resolved: "emerald",
  Rejected: "rose",
};

const priorityTone: Record<ReportPriority, "slate" | "blue" | "amber" | "rose"> = {
  Low: "slate",
  Normal: "blue",
  High: "amber",
  Urgent: "rose",
};

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { response?: { data?: { message?: unknown } } };
  return typeof apiError.response?.data?.message === "string" ? apiError.response.data.message : fallback;
}

function formatDate(value?: string | null) {
  return formatAdminDate(value);
}

function compactNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function contentLink(report: ContentReport) {
  if (report.entityType === "Word" || report.wordId) return "/admin/words";
  if (report.entityType === "Question" || report.questionId) return "/admin/questions";
  return "/admin/content-review";
}

export default function AdminReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [reportType, setReportType] = useState("");
  const [entityType, setEntityType] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<{ status: ReportStatus; priority: ReportPriority; adminResponse: string }>({
    status: "InReview",
    priority: "Normal",
    adminResponse: "",
  });

  const pageSize = 20;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.getReportsPage<ContentReport>({
        page,
        limit: pageSize,
        search: search.trim(),
        status,
        reportType,
        entityType,
        priority,
      });
      setReports(data.items);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Không thể tải báo cáo", error);
      toast.error(getErrorMessage(error, "Không thể tải danh sách báo cáo"));
      setError(getErrorMessage(error, "Không thể tải danh sách báo cáo"));
    } finally {
      setLoading(false);
    }
  }, [entityType, page, priority, reportType, search, status]);

  useEffect(() => {
    void Promise.resolve().then(fetchReports);
  }, [fetchReports]);

  function selectReport(report: ContentReport) {
    setSelectedReport(report);
    setForm({
      status: report.status,
      priority: report.priority,
      adminResponse: report.adminResponse || "",
    });
  }

  const counts = useMemo(() => {
    return reports.reduce(
      (acc, report) => {
        acc.total += 1;
        if (report.status === "Open") acc.open += 1;
        if (report.status === "InReview") acc.inReview += 1;
        if (report.priority === "Urgent" || report.priority === "High") acc.highPriority += 1;
        return acc;
      },
      { total: 0, open: 0, inReview: 0, highPriority: 0 }
    );
  }, [reports]);

  async function updateReport() {
    if (!selectedReport) return;
    setSaving(true);
    try {
      await adminService.updateReport(selectedReport.id, form);
      toast.success("Đã cập nhật báo cáo");
      setSelectedReport({ ...selectedReport, ...form, updatedAt: new Date().toISOString() });
      await fetchReports();
    } catch (error) {
      console.error("Không thể cập nhật báo cáo", error);
      toast.error(getErrorMessage(error, "Không thể cập nhật báo cáo"));
    } finally {
      setSaving(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setReportType("");
    setEntityType("");
    setPriority("");
    setPage(1);
  }

  return (
    <>
      <Topbar title="Báo cáo và phản hồi" subtitle="Xử lý báo cáo của học viên về từ vựng, âm thanh và đáp án." role="admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Báo cáo đã tải" value={mounted ? compactNumber(counts.total) : String(counts.total)} change={`${pagination?.total ?? counts.total} tổng cộng`} icon={Flag} tone="blue" />
          <KpiCard label="Mới" value={mounted ? compactNumber(counts.open) : String(counts.open)} change="Cần phân loại" icon={ShieldAlert} tone="amber" />
          <KpiCard label="Đang xem xét" value={mounted ? compactNumber(counts.inReview) : String(counts.inReview)} change="Đang được xử lý" icon={MessageSquareReply} tone="violet" />
          <KpiCard label="Ưu tiên cao" value={mounted ? compactNumber(counts.highPriority) : String(counts.highPriority)} change="Mức cao hoặc khẩn cấp" icon={AlertTriangle} tone="rose" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <AdminPanel title="Báo cáo của học viên" description="Lọc và chọn báo cáo cần xem xét.">
            <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(4,160px)_auto]">
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 dark:border-white/10 dark:bg-white/5">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm tiêu đề, người dùng hoặc nội dung"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500 dark:text-slate-200"
                />
              </div>
              <Select value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={statuses} label="Tất cả trạng thái" />
              <Select value={reportType} onChange={(value) => { setReportType(value); setPage(1); }} options={reportTypes} label="Tất cả loại báo cáo" />
              <Select value={entityType} onChange={(value) => { setEntityType(value); setPage(1); }} options={entityTypes} label="Tất cả đối tượng" />
              <Select value={priority} onChange={(value) => { setPriority(value); setPage(1); }} options={priorities} label="Tất cả mức ưu tiên" />
              <ToolbarButton onClick={resetFilters}>Đặt lại</ToolbarButton>
            </div>

            {error ? (
              <AdminErrorState description={error} onRetry={() => void fetchReports()} />
            ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Báo cáo</th>
                    <th className="px-4 py-3 font-medium">Nội dung</th>
                    <th className="px-4 py-3 font-medium">Người báo cáo</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 font-medium">Ưu tiên</th>
                    <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Đang tải báo cáo...</td></tr>
                  ) : reports.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Không có báo cáo phù hợp với bộ lọc hiện tại.</td></tr>
                  ) : reports.map((report) => (
                    <tr key={report.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 ${selectedReport?.id === report.id ? "bg-blue-50/70 dark:bg-blue-500/10" : ""}`}>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950 dark:text-white">{report.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{report.description}</p>
                        <p className="mt-1 text-xs text-slate-400">{adminLabel(report.reportType)}{mounted ? ` - ${formatDate(report.createdAt)}` : ''}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <p>{report.wordTerm || report.questionText || adminLabel(report.entityType)}</p>
                        <p className="mt-1 text-xs text-slate-500">{report.wordId ? `Từ vựng #${report.wordId}` : ""} {report.questionId ? `Câu hỏi #${report.questionId}` : ""}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <p>{report.reporterName || "Học viên"}</p>
                        <p className="text-xs text-slate-500">{report.reporterEmail}</p>
                      </td>
                      <td className="px-4 py-4"><StatusBadge tone={statusTone[report.status]}>{adminLabel(report.status)}</StatusBadge></td>
                      <td className="px-4 py-4"><StatusBadge tone={priorityTone[report.priority]}>{adminLabel(report.priority)}</StatusBadge></td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton label="Xem báo cáo" onClick={() => selectReport(report)}><Edit3 className="h-4 w-4" /></IconButton>
                          <IconButton label="Mở nội dung" onClick={() => window.location.assign(contentLink(report))}><ExternalLink className="h-4 w-4" /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            {pagination && (
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
                <span>Trang {pagination.page} / {pagination.totalPages} - {mounted ? compactNumber(pagination.total) : pagination.total} báo cáo</span>
                <div className="flex items-center gap-2">
                  <ToolbarButton onClick={() => setPage((current) => Math.max(1, current - 1))}>Trước</ToolbarButton>
                  <ToolbarButton onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}>Sau</ToolbarButton>
                </div>
              </div>
            )}
          </AdminPanel>

          <AdminPanel
            title="Phản hồi xử lý"
            description={selectedReport ? `Báo cáo #${selectedReport.id}` : "Chọn một báo cáo để phản hồi."}
            action={selectedReport ? <StatusBadge tone={statusTone[selectedReport.status]}>{adminLabel(selectedReport.status)}</StatusBadge> : null}
          >
            {!selectedReport ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Chưa chọn báo cáo.</p>
            ) : (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Vấn đề được báo cáo</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedReport.description}</p>
                  </div>
                  {selectedReport.questionText && (
                    <div className="rounded-md border border-slate-200 p-3 text-sm dark:border-white/10">
                      <p className="font-medium text-slate-950 dark:text-white">{selectedReport.questionText}</p>
                      <p className="mt-1 text-xs text-slate-500">Đáp án đúng: {selectedReport.correctAnswer || "Không có"}</p>
                    </div>
                  )}
                  {selectedReport.wordTerm && (
                    <div className="rounded-md border border-slate-200 p-3 text-sm dark:border-white/10">
                      <p className="font-medium text-slate-950 dark:text-white">{selectedReport.wordTerm}</p>
                      <p className="mt-1 text-xs text-slate-500">{selectedReport.wordMeaning}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Trạng thái">
                    <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ReportStatus }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
                      {statuses.filter(Boolean).map((item) => <option key={item} value={item}>{adminLabel(item)}</option>)}
                    </select>
                  </Field>
                  <Field label="Mức ưu tiên">
                    <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as ReportPriority }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950">
                      {priorities.filter(Boolean).map((item) => <option key={item} value={item}>{adminLabel(item)}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Phản hồi cho học viên / ghi chú nội bộ">
                  <textarea
                    value={form.adminResponse}
                    onChange={(event) => setForm((current) => ({ ...current, adminResponse: event.target.value }))}
                    maxLength={2000}
                    rows={6}
                    className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-slate-950"
                    placeholder="Mô tả nội dung đã sửa, lý do từ chối hoặc phần cần kiểm tra thêm."
                  />
                  <p className="text-right text-xs text-slate-400">{form.adminResponse.length}/2000</p>
                </Field>

                <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                  <Button type="button" disabled={saving} onClick={updateReport} className="rounded-md bg-blue-600 hover:bg-blue-700">
                    {saving ? "Đang lưu..." : "Lưu phản hồi"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setForm((current) => ({ ...current, status: "Resolved" }))} className="rounded-md">
                    <CheckCircle2 className="h-4 w-4" /> Đánh dấu đã xử lý
                  </Button>
                </div>

                {selectedReport.resolvedByName && (
                  <p className="text-xs text-slate-500">
                    Lần xử lý gần nhất bởi {selectedReport.resolvedByName}{mounted ? ` lúc ${formatDate(selectedReport.resolvedAt)}` : ''}
                  </p>
                )}
              </div>
            )}
          </AdminPanel>
        </div>
      </AdminPage>
    </>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: readonly string[]; label: string }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
      <option value="">{label}</option>
      {options.filter(Boolean).map((option) => <option key={option} value={option}>{adminLabel(option)}</option>)}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      {children}
    </div>
  );
}
