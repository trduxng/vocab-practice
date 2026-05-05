"use client";

import { useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, TableShell, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { CheckCircle2, FileWarning, Gavel, MessageSquareWarning, ScrollText, ShieldAlert, UserX } from "lucide-react";

type ReportStatus = "Open" | "Investigating" | "Resolved";

const reports = [
  { id: "R-8041", target: "Duplicated Business Idioms", type: "Content", reason: "Copied content", reporter: "Maya Chen", severity: "High", status: "Open" as ReportStatus, received: "12 min ago" },
  { id: "R-8042", target: "Alex Brown", type: "User", reason: "Spam messages", reporter: "Sofia Patel", severity: "High", status: "Investigating" as ReportStatus, received: "34 min ago" },
  { id: "R-8043", target: "TOEIC Part 5 Grammar Drill", type: "Content", reason: "Incorrect answer key", reporter: "Nam Tran", severity: "Medium", status: "Open" as ReportStatus, received: "1 hr ago" },
  { id: "R-8037", target: "Starter Flashcards", type: "Content", reason: "Sensitive wording", reporter: "Automated review", severity: "Low", status: "Resolved" as ReportStatus, received: "Yesterday" },
];

const actionLogs = [
  "Admin suspended Alex Brown for 7 days",
  "Moderator restored IELTS Academic Word List",
  "Admin removed 12 duplicate cards from Business Idioms",
  "System escalated 3 copyright reports",
  "Moderator rejected appeal for spam violation",
];

const statusTone: Record<ReportStatus, "rose" | "amber" | "emerald"> = {
  Open: "rose",
  Investigating: "amber",
  Resolved: "emerald",
};

export default function ReportsPage() {
  const [selectedAction, setSelectedAction] = useState("Warn user");

  return (
    <>
      <Topbar title="Reports and moderation" subtitle="Review reported users, reported content, admin logs, and violation handling." role="admin" userName="Admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Open reports" value="124" change="+19 today" trend="down" icon={FileWarning} tone="rose" />
          <KpiCard label="Reported users" value="38" change="+6 pending" trend="down" icon={UserX} tone="amber" />
          <KpiCard label="Reported content" value="86" change="+13 pending" trend="down" icon={MessageSquareWarning} tone="blue" />
          <KpiCard label="Resolved this week" value="412" change="+22.4%" icon={CheckCircle2} tone="emerald" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <TableShell>
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                <tr><th className="px-4 py-3 font-medium">Report</th><th className="px-4 py-3 font-medium">Target</th><th className="px-4 py-3 font-medium">Reporter</th><th className="px-4 py-3 font-medium">Severity</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Handling</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-4 py-4"><p className="font-medium text-slate-950 dark:text-white">{report.id}</p><p className="text-xs text-slate-500 dark:text-slate-400">{report.reason} · {report.received}</p></td>
                    <td className="px-4 py-4"><p className="text-slate-800 dark:text-slate-200">{report.target}</p><p className="text-xs text-slate-500 dark:text-slate-400">{report.type}</p></td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{report.reporter}</td>
                    <td className="px-4 py-4"><StatusBadge tone={report.severity === "High" ? "rose" : report.severity === "Medium" ? "amber" : "blue"}>{report.severity}</StatusBadge></td>
                    <td className="px-4 py-4"><StatusBadge tone={statusTone[report.status]}>{report.status}</StatusBadge></td>
                    <td className="px-4 py-4"><div className="flex gap-2"><ToolbarButton><Gavel className="h-4 w-4" />Review</ToolbarButton><ToolbarButton><CheckCircle2 className="h-4 w-4" />Resolve</ToolbarButton></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>

          <div className="space-y-5">
            <AdminPanel title="Violation handling" description="Choose a resolution template for the selected report." action={<ShieldAlert className="h-4 w-4 text-slate-400" />}>
              <div className="grid grid-cols-1 gap-2">
                {["Warn user", "Temporarily ban", "Remove content", "Escalate to policy"].map((action) => (
                  <button key={action} onClick={() => setSelectedAction(action)} className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${selectedAction === action ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-200 text-slate-600 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"}`}>{action}</button>
                ))}
              </div>
            </AdminPanel>
            <AdminPanel title="Admin action logs" description="Immutable moderation actions.">
              <div className="space-y-3">
                {actionLogs.map((log) => <div key={log} className="flex gap-3 rounded-md border border-slate-200 p-3 dark:border-white/10"><ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><p className="text-sm text-slate-600 dark:text-slate-300">{log}</p></div>)}
              </div>
            </AdminPanel>
          </div>
        </div>
      </AdminPage>
    </>
  );
}
