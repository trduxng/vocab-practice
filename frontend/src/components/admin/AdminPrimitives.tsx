import type { ElementType, ReactNode } from "react";
import { AlertCircle, ArrowDownRight, ArrowUpRight, Loader2, Trash2, X } from "lucide-react";

type Tone = "slate" | "blue" | "emerald" | "amber" | "rose" | "violet";

const toneClasses: Record<Tone, string> = {
  slate:
    "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
  blue:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  rose:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
  violet:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300",
};

export function AdminPage({ children }: { children: ReactNode }) {
  return <main className="flex-1 space-y-6 overflow-auto p-4 md:p-6">{children}</main>;
}

export function AdminPanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] ${className}`}
    >
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h2>}
            {description && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  change,
  trend = "up",
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: string;
  change: string;
  trend?: "up" | "down";
  icon: ElementType;
  tone?: Tone;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md border ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <div
        className={`mt-2 flex items-center gap-1 text-xs font-medium ${
          trend === "up" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"
        }`}
      >
        <TrendIcon className="h-3.5 w-3.5" />
        <span>{change}</span>
      </div>
    </div>
  );
}

export function StatusBadge({ children, tone = "slate" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function IconButton({
  children,
  onClick,
  label,
  tone = "slate",
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
  tone?: Tone;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

export function ToolbarButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
        active
          ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
          : "border-slate-200 bg-white text-slate-600 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminLoadingState({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

export function AdminErrorState({
  title = "Không thể tải dữ liệu",
  description = "Vui lòng kiểm tra kết nối và thử lại.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50/70 p-8 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
      <AlertCircle className="h-7 w-7 text-rose-500" />
      <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 max-w-lg text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 inline-flex h-9 items-center rounded-md border border-rose-300 bg-white px-3 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-slate-950 dark:text-rose-300">
          Thử lại
        </button>
      )}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xóa",
  busy = false,
  destructive = true,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Đóng" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-slate-300">
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-white disabled:opacity-50 ${destructive ? "bg-rose-600 hover:bg-rose-500" : "bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950"}`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : destructive ? <Trash2 className="h-4 w-4" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export const chartColors = {
  blue: "#2563eb",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  violet: "#7c3aed",
  slate: "#64748b",
};
