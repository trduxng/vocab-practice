"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Loader2, Search } from "lucide-react";
import type { PaginationMeta } from "@/src/services/admin.service";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
};

export type DataTableSort = {
  key: string;
  direction: "asc" | "desc";
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  emptyTitle = "No records found",
  emptyDescription,
  searchValue,
  searchPlaceholder = "Search",
  onSearchChange,
  sort,
  onSortChange,
  selectedIds = [],
  onSelectedIdsChange,
  pagination,
  onPageChange,
  bulkActions,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  selectedIds?: Array<string | number>;
  onSelectedIdsChange?: (ids: Array<string | number>) => void;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  bulkActions?: ReactNode;
}) {
  const selectedSet = new Set(selectedIds.map(String));
  const rowIds = rows.map(getRowId);
  const allVisibleSelected = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(String(id)));
  const canSelect = Boolean(onSelectedIdsChange);

  function toggleAll() {
    if (!onSelectedIdsChange) return;
    if (allVisibleSelected) {
      onSelectedIdsChange(selectedIds.filter((id) => !rowIds.map(String).includes(String(id))));
      return;
    }

    const next = new Map(selectedIds.map((id) => [String(id), id]));
    rowIds.forEach((id) => next.set(String(id), id));
    onSelectedIdsChange(Array.from(next.values()));
  }

  function toggleRow(id: string | number) {
    if (!onSelectedIdsChange) return;
    if (selectedSet.has(String(id))) {
      onSelectedIdsChange(selectedIds.filter((selectedId) => String(selectedId) !== String(id)));
      return;
    }
    onSelectedIdsChange([...selectedIds, id]);
  }

  function toggleSort(key: string) {
    if (!onSortChange) return;
    const direction = sort?.key === key && sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ key, direction });
  }

  return (
    <div className="space-y-3">
      {(onSearchChange || bulkActions) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {onSearchChange && (
            <div className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 md:w-80 dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                value={searchValue || ""}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500 dark:text-slate-200"
              />
            </div>
          )}
          {selectedIds.length > 0 && bulkActions && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>{selectedIds.length} selected</span>
              {bulkActions}
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <tr>
                {canSelect && (
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300" />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={column.key} className={`px-4 py-3 font-medium ${column.className || ""}`}>
                    {column.sortable ? (
                      <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-1 hover:text-slate-950 dark:hover:text-white">
                        {column.header}
                        <ChevronsUpDown className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (canSelect ? 1 : 0)} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading records...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (canSelect ? 1 : 0)} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{emptyTitle}</p>
                    {emptyDescription && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{emptyDescription}</p>}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const id = getRowId(row);
                  return (
                    <tr key={String(id)} className="hover:bg-slate-100 dark:hover:bg-white/5">
                      {canSelect && (
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedSet.has(String(id))} onChange={() => toggleRow(id)} className="h-4 w-4 rounded border-slate-300" />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${column.className || ""}`}>
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 px-3 font-medium disabled:opacity-50 dark:border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 px-3 font-medium disabled:opacity-50 dark:border-white/10"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
