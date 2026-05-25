"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { DataTable, type DataTableColumn } from "@/src/modules/admin/components/DataTable";
import { adminService, type PaginationMeta } from "@/src/services/admin.service";
import { Activity, Database, Eye, History, RefreshCw, Search, ShieldCheck, UserRound } from "lucide-react";

type AuditLog = {
  id: number;
  adminId?: number | null;
  adminName?: string | null;
  adminEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  details?: string | null;
  createdAt: string;
};

const defaultPagination: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

function formatDate(value?: string) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function compactNumber(value?: number | null) {
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

function formatDetails(details?: string | null) {
  if (!details) return "No details";
  try {
    return JSON.stringify(JSON.parse(details), null, 2);
  } catch {
    return details;
  }
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [entityType, setEntityType] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  async function loadAuditLogs(page = pagination.page) {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogsPage<AuditLog>({
        page,
        limit: pagination.limit,
        search: debouncedQuery || undefined,
        entityType: entityType || undefined,
      });
      setLogs(data.items);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
      setLogs([]);
      setPagination(defaultPagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAuditLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, entityType]);

  const entityTypes = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.entityType).filter(Boolean))).sort();
  }, [logs]);

  const columns = useMemo<DataTableColumn<AuditLog>[]>(
    () => [
      {
        key: "action",
        header: "Action",
        cell: (log) => (
          <div>
            <p className="font-medium text-slate-950 dark:text-white">{log.action}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">#{log.id}</p>
          </div>
        ),
      },
      {
        key: "entity",
        header: "Entity",
        cell: (log) => (
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-400" />
            <div>
              <p>{log.entityType}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">ID {log.entityId || "N/A"}</p>
            </div>
          </div>
        ),
      },
      {
        key: "admin",
        header: "Actor",
        cell: (log) => (
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-slate-400" />
            <div>
              <p>{log.adminName || "System"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{log.adminEmail || `User #${log.adminId || "N/A"}`}</p>
            </div>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Time",
        cell: (log) => <span className="text-slate-600 dark:text-slate-300">{formatDate(log.createdAt)}</span>,
      },
      {
        key: "details",
        header: "",
        className: "text-right",
        cell: (log) => (
          <button
            type="button"
            onClick={() => setSelectedLog(log)}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 px-2.5 text-sm font-medium text-slate-700 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
          >
            <Eye className="h-4 w-4" />
            View
          </button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Topbar title="Audit logs" subtitle="Admin actions, moderation events, and operational changes." role="admin" userName="Admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Total events" value={compactNumber(pagination.total)} change="AdminAuditLogs" icon={History} tone="blue" />
          <KpiCard label="Loaded page" value={String(logs.length)} change={`Page ${pagination.page}`} icon={Activity} tone="emerald" />
          <KpiCard label="Entity types" value={String(entityTypes.length)} change="Current result set" icon={ShieldCheck} tone="violet" />
        </div>

        <AdminPanel
          title="Audit trail"
          description="Server-side paginated audit events from AdminAuditLogs."
          action={
            <ToolbarButton onClick={() => void loadAuditLogs(pagination.page)}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </ToolbarButton>
          }
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 lg:w-96 dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search action, entity, admin, details"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500 dark:text-slate-200"
              />
            </div>
            <select
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">All entities</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <DataTable
            columns={columns}
            rows={logs}
            getRowId={(log) => log.id}
            loading={loading}
            emptyTitle="No audit events"
            emptyDescription="No admin actions match the current filters."
            pagination={pagination}
            onPageChange={(page) => void loadAuditLogs(page)}
          />
        </AdminPanel>

        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
            <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">{selectedLog.action}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {selectedLog.entityType} #{selectedLog.entityId || "N/A"} · {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
                <StatusBadge tone="blue">Audit #{selectedLog.id}</StatusBadge>
              </div>
              <pre className="max-h-[55vh] overflow-auto rounded-md border border-slate-200 bg-slate-100 p-4 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {formatDetails(selectedLog.details)}
              </pre>
              <div className="mt-4 flex justify-end">
                <ToolbarButton onClick={() => setSelectedLog(null)}>Close</ToolbarButton>
              </div>
            </div>
          </div>
        )}
      </AdminPage>
    </>
  );
}
