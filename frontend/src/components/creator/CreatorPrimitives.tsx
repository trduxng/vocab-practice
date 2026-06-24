"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import {
  AdminErrorState as CreatorErrorState,
  AdminLoadingState as CreatorLoadingState,
  AdminPage as CreatorPage,
  AdminPanel as CreatorPanel,
  ConfirmDialog,
  StatusBadge,
  TableShell,
  ToolbarButton,
} from "@/src/components/admin/AdminPrimitives";
import type { ContentStatus } from "@/src/services/creator.service";

export {
  CreatorErrorState,
  CreatorLoadingState,
  CreatorPage,
  CreatorPanel,
  ConfirmDialog,
  TableShell,
  ToolbarButton,
};

const tones: Record<ContentStatus, "slate" | "amber" | "emerald" | "rose"> = {
  Draft: "slate",
  PendingReview: "amber",
  Published: "emerald",
  Rejected: "rose",
  Archived: "slate",
};

const labels: Record<ContentStatus, string> = {
  Draft: "Bản nháp",
  PendingReview: "Chờ duyệt",
  Published: "Đã xuất bản",
  Rejected: "Bị từ chối",
  Archived: "Đã lưu trữ",
};

export function CreatorStatusBadge({ status }: { status: ContentStatus }) {
  return <StatusBadge tone={tones[status] || "slate"}>{labels[status] || status}</StatusBadge>;
}

export function CreatorHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function CreatorModal({
  open,
  title,
  description,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className={`max-h-[94vh] w-full ${maxWidth} overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950">
          <div>
            <h2 className="font-semibold text-slate-950 dark:text-white">{title}</h2>
            {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CreatorPagination<T>({
  pagination,
  loading,
  onPageChange,
}: {
  pagination: { page: number; totalPages: number; total: number };
  loading?: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Trang {pagination.page}/{Math.max(1, pagination.totalPages)} &middot; {pagination.total} bản ghi
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading || pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 px-3 disabled:opacity-50 dark:border-white/10"
        >
          <ChevronLeft className="h-4 w-4" /> Trước
        </button>
        <button
          type="button"
          disabled={loading || pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 px-3 disabled:opacity-50 dark:border-white/10"
        >
          Sau <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
