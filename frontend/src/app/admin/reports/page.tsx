"use client";

import { useEffect, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { adminService } from "@/src/services/admin.service";
import { CheckCircle2, FileWarning, Gavel, MessageSquareWarning, ScrollText, ShieldAlert, UserX } from "lucide-react";

type ContentStatus = "Published" | "Draft" | "PendingReview" | "Rejected" | "Archived";
type Tone = "slate" | "blue" | "emerald" | "amber" | "rose" | "violet";

type ModerationData = {
  summary?: {
    openReports?: number;
    restrictedUsers?: number;
    reportedContent?: number;
    resolvedThisWeek?: number;
  };
  reports?: Array<{
    id: string;
    target: string;
    type: string;
    status: ContentStatus;
    receivedAt: string;
    reporterId: number;
    severityScore: number;
  }>;
  actionLogs?: Array<{
    id: number;
    type: string;
    entityId: number;
    oldStatus?: ContentStatus;
    newStatus: ContentStatus;
    comment?: string;
    createdAt: string;
    actor: string;
  }>;
};

const statusTone: Record<ContentStatus, Tone> = {
  Published: "emerald",
  Draft: "amber",
  PendingReview: "blue",
  Rejected: "rose",
  Archived: "slate",
};

function compactNumber(value?: number | null) {
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

function formatDate(value?: string) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function severity(score?: number): { label: string; tone: Tone } {
  if (Number(score || 0) >= 4) return { label: "High", tone: "rose" };
  if (Number(score || 0) >= 2) return { label: "Medium", tone: "amber" };
  return { label: "Low", tone: "blue" };
}

export default function ReportsPage() {
  const [selectedAction, setSelectedAction] = useState("Review content");
  const [data, setData] = useState<ModerationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchModeration() {
      try {
        const response = await adminService.getModeration();
        if (!cancelled) setData(response);
      } catch (error) {
        console.error("Failed to fetch moderation data", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchModeration();
    return () => {
      cancelled = true;
    };
  }, []);

  const reports = data?.reports || [];
  const actionLogs = data?.actionLogs || [];

  return (
    <>
      <Topbar title="Reports and moderation" subtitle="Real review queue from content status and ContentReviewLogs." role="admin" userName="Admin" />
      <AdminPage>
        {loading ? (
          <AdminPanel>
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Loading moderation data...</div>
          </AdminPanel>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Open reviews" value={compactNumber(data?.summary?.openReports)} change="ContentReviewLogs pending" trend="down" icon={FileWarning} tone="rose" />
              <KpiCard label="Restricted users" value={compactNumber(data?.summary?.restrictedUsers)} change="Inactive accounts" trend="down" icon={UserX} tone="amber" />
              <KpiCard label="Flagged content" value={compactNumber(data?.summary?.reportedContent)} change="Non-published content" trend="down" icon={MessageSquareWarning} tone="blue" />
              <KpiCard label="Resolved this week" value={compactNumber(data?.summary?.resolvedThisWeek)} change="Published by reviewers" icon={CheckCircle2} tone="emerald" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <TableShell>
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <tr><th className="px-4 py-3 font-medium">Item</th><th className="px-4 py-3 font-medium">Target</th><th className="px-4 py-3 font-medium">Reporter</th><th className="px-4 py-3 font-medium">Severity</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Handling</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {reports.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No content is waiting for moderation.</td></tr>
                    ) : reports.map((report) => {
                      const severityInfo = severity(report.severityScore);
                      return (
                        <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                          <td className="px-4 py-4"><p className="font-medium text-slate-950 dark:text-white">{report.id}</p><p className="text-xs text-slate-500 dark:text-slate-400">Created · {formatDate(report.receivedAt)}</p></td>
                          <td className="px-4 py-4"><p className="text-slate-800 dark:text-slate-200">{report.target}</p><p className="text-xs text-slate-500 dark:text-slate-400">{report.type}</p></td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">User #{report.reporterId}</td>
                          <td className="px-4 py-4"><StatusBadge tone={severityInfo.tone}>{severityInfo.label}</StatusBadge></td>
                          <td className="px-4 py-4"><StatusBadge tone={statusTone[report.status] || "slate"}>{report.status}</StatusBadge></td>
                          <td className="px-4 py-4"><div className="flex gap-2"><ToolbarButton><Gavel className="h-4 w-4" />Review</ToolbarButton><ToolbarButton><CheckCircle2 className="h-4 w-4" />Resolve</ToolbarButton></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableShell>

              <div className="space-y-5">
                <AdminPanel title="Resolution templates" description="Choose a handling mode for the selected item." action={<ShieldAlert className="h-4 w-4 text-slate-400" />}>
                  <div className="grid grid-cols-1 gap-2">
                    {["Review content", "Request changes", "Publish content", "Archive content"].map((action) => (
                      <button key={action} onClick={() => setSelectedAction(action)} className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${selectedAction === action ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-200 text-slate-600 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"}`}>{action}</button>
                    ))}
                  </div>
                </AdminPanel>
                <AdminPanel title="Review logs" description="Immutable content review actions.">
                  <div className="space-y-3">
                    {actionLogs.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No review log entries yet.</p>
                    ) : actionLogs.map((log) => <div key={log.id} className="flex gap-3 rounded-md border border-slate-200 p-3 dark:border-white/10"><ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><p className="text-sm text-slate-600 dark:text-slate-300">{log.actor} changed {log.type} #{log.entityId} from {log.oldStatus || "None"} to {log.newStatus}. {log.comment || ""}</p></div>)}
                  </div>
                </AdminPanel>
              </div>
            </div>
          </>
        )}
      </AdminPage>
    </>
  );
}
