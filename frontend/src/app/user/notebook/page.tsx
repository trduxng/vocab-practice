"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownAZ,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  SearchX,
  Star,
  Trash2,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/src/services/user.service";
import { useAuth } from "@/src/app/context/AuthContext";
import Topbar from "@/src/components/shared/Topbar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { generatePageNumbers } from "@/src/lib/pagination";
import { Skeleton } from "@/src/components/ui/skeleton";
import VocabularyPreviewDialog from "@/src/components/user/notebook/VocabularyPreviewDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

type NotebookEntry = {
  notebookId: number;
  wordId: number;
  term: string;
  meaning: string;
  phonetic?: string;
  partOfSpeechName?: string;
  personalNote?: string;
  isFavorite: boolean;
  masteryLevel: number;
  addedAt: string;
  updatedAt: string;
};

type FetchResult = {
  data: NotebookEntry[];
  total: number;
  totalPages: number;
};

export default function VocabularyNotebook() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editingEntry, setEditingEntry] = useState<NotebookEntry | null>(null);
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortBy, setSortBy] = useState("recent");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Debounce search input
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  // Fetch from server
  const fetchNotebook = useCallback(async (
    currentPage: number,
    currentSearch: string,
    currentSort: string,
  ) => {
    if (!user) return;
    setLoading(true);

    try {
      const result: FetchResult = await userService.getNotebook(
        currentPage,
        pageSize,
        currentSearch,
        currentSort,
      );
      setEntries(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotalItems(result.total || 0);
    } catch (error) {
      console.error("Failed to fetch notebook", error);
      toast.error("Không thể tải sổ tay từ vựng");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Re-fetch when page, debouncedSearch, sortBy, or refreshKey changes
  useEffect(() => {
    void fetchNotebook(page, debouncedSearch, sortBy);
  }, [page, debouncedSearch, sortBy, refreshKey, fetchNotebook]);

  // Close sort menu on outside click
  useEffect(() => {
    if (!sortMenuOpen) return;
    const handler = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortMenuOpen]);

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleFavorite = async (entry: NotebookEntry) => {
    try {
      await userService.updateNotebookEntry(entry.notebookId, {
        isFavorite: !entry.isFavorite,
      });
      setEntries((prev) =>
        prev.map((e) =>
          e.notebookId === entry.notebookId
            ? { ...e, isFavorite: !e.isFavorite }
            : e,
        ),
      );
      toast.success(
        entry.isFavorite ? "Đã bỏ yêu thích" : "Đã đánh dấu yêu thích",
      );
    } catch {
      toast.error("Không thể cập nhật");
    }
  };

  const handleDelete = async (entry: NotebookEntry) => {
    try {
      await userService.deleteNotebookEntry(entry.notebookId);
      setEntries((prev) => {
        const next = prev.filter((e) => e.notebookId !== entry.notebookId);
        if (next.length === 0 && page > 1) {
          setPage((p) => p - 1);
        }
        return next;
      });
      toast.success("Đã xóa khỏi sổ tay");
    } catch {
      toast.error("Không thể xóa");
    }
  };

  const exportCSV = useCallback(() => {
    const headers = ["Từ", "Nghĩa", "Phiên âm", "Từ loại", "Thành thạo", "Yêu thích", "Ghi chú", "Ngày thêm"];
    const rows = entries.map((e) => [
      `"${e.term.replace(/"/g, '""')}"`,
      `"${e.meaning.replace(/"/g, '""')}"`,
      `"${(e.phonetic || "").replace(/"/g, '""')}"`,
      `"${(e.partOfSpeechName || "").replace(/"/g, '""')}"`,
      e.masteryLevel,
      e.isFavorite ? "Có" : "Không",
      `"${(e.personalNote || "").replace(/"/g, '""')}"`,
      new Date(e.addedAt).toLocaleDateString("vi-VN"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `so_tay_tu_vung_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success("Đã xuất file CSV");
  }, [entries]);

  const handleSaveNote = async () => {
    if (!editingEntry) return;
    setSaving(true);
    try {
      await userService.updateNotebookEntry(editingEntry.notebookId, {
        personalNote: editNote,
      });
      setEntries((prev) =>
        prev.map((e) =>
          e.notebookId === editingEntry.notebookId
            ? { ...e, personalNote: editNote }
            : e,
        ),
      );
      setEditingEntry(null);
      toast.success("Đã lưu ghi chú");
    } catch {
      toast.error("Không thể lưu ghi chú");
    } finally {
      setSaving(false);
    }
  };

  const favoriteCount = entries.filter((e) => e.isFavorite).length;
  const pageSize = 10;
  const pageStart = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(page * pageSize, totalItems);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-mono">
        Đang xác thực...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
      <Topbar
        title="Sổ tay từ vựng"
        subtitle="Ghi chú và từ yêu thích của bạn"
        role="student"
        userName={user?.fullName}
      />

      <main className="flex-1 space-y-6 overflow-auto p-6">
        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm từ, nghĩa..."
              className="h-10 w-full rounded-xl border-slate-300 bg-white pl-10 pr-8 text-sm text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <SearchX className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/[0.04]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
                title="Chế độ lưới"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
                title="Chế độ danh sách"
              >
                <List size={14} />
              </button>
            </div>

            {/* Sort dropdown */}
            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => setSortMenuOpen((v) => !v)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:border-slate-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
              >
                <ArrowDownAZ size={14} />
                {sortLabels[sortBy]}
              </button>
              {sortMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setPage(1);
                        setSortMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                        sortBy === option.value
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <option.icon size={14} className="shrink-0 text-slate-400" />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
            >
              <Plus size={14} />
              Thêm từ
            </button>
            {entries.length > 0 && (
              <button
                onClick={exportCSV}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-blue-400"
              >
                <Download size={14} />
                CSV
              </button>
            )}
          </div>
        </div>

        {/* ── Stats bar ── */}
        {!loading && totalItems > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-slate-200 dark:bg-white/[0.04] dark:border-white/10">
              Tổng số: <b className="font-black text-slate-900 dark:text-white">{totalItems}</b> từ
            </span>
            {favoriteCount > 0 && (
              <span              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-amber-200/60 dark:bg-amber-500/10 dark:border-amber-500/20">
                <Star size={12} className="fill-amber-500 text-amber-500" />
                Yêu thích: <b className="font-black text-amber-600 dark:text-amber-300">{favoriteCount}</b>
              </span>
            )}
            <span className="ml-auto text-slate-400">
              {pageStart}–{pageEnd} / {totalItems}
            </span>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <Skeleton className="mb-3 h-6 w-28" />
                  <Skeleton className="mb-3 h-4 w-full" />
                  <Skeleton className="mb-3 h-4 w-3/4" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <Skeleton className="mb-3 h-6 w-48" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-5 w-32 rounded-full" />
                </div>
              ))}
            </div>
          )
        ) : entries.length === 0 ? (
          <div className="flex min-h-96 flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-200 bg-white px-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/[0.02] dark:shadow-none">
            {debouncedSearch ? (
              <>
                <SearchX className="mb-5 h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Không tìm thấy từ &ldquo;{debouncedSearch}&rdquo;
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Xóa tìm kiếm
                </button>
              </>
            ) : (
              <>
                <BookOpen className="mb-5 h-14 w-14 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Sổ tay trống
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Thêm từ vựng vào sổ tay khi học để ghi nhớ lâu hơn. Bạn có thể
                  thêm từ từ danh sách chủ đề hoặc lưu từ trong quá trình học.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => setPickerOpen(true)}
                    className="rounded-xl bg-blue-600 px-5 text-xs font-black uppercase tracking-wider hover:bg-blue-700"
                  >
                    <Plus size={14} className="mr-1.5" />
                    Thêm từ đầu tiên
                  </Button>
                  <Button
                    onClick={() => router.push("/user/learn")}
                    variant="outline"
                    className="rounded-xl border-slate-200 text-xs font-black uppercase tracking-wider dark:border-white/10"
                  >
                    <BookOpen size={14} className="mr-1.5" />
                    Học từ mới
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {entries.map((entry) => (
                  <GridCard key={entry.notebookId} entry={entry} onSpeak={speak} onEdit={(e) => { setEditingEntry(e); setEditNote(e.personalNote || ""); }} onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <ListCard key={entry.notebookId} entry={entry} onSpeak={speak} onEdit={(e) => { setEditingEntry(e); setEditNote(e.personalNote || ""); }} onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <PaginationButton
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </PaginationButton>

                <div className="flex items-center gap-1">
                  {generatePageNumbers(page, totalPages).map((item, index) =>
                    item === "..." ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-xs text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(Number(item))}
                        className={`flex h-9 min-w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                          page === item
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>

                <PaginationButton
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </PaginationButton>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Edit Note Dialog ── */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <DialogContent className="max-w-md rounded-[24px] border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
              <Pencil size={18} className="text-blue-600 dark:text-blue-400" />
              Ghi chú cho &ldquo;{editingEntry?.term}&rdquo;
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Viết ghi chú, câu ví dụ hoặc bất cứ điều gì giúp bạn nhớ từ này.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="Nhập ghi chú của bạn..."
            rows={5}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingEntry(null)}
              className="rounded-xl border-slate-200 dark:border-white/10"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu ghi chú"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VocabularyPreviewDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onNotebookChanged={() => {
          setRefreshKey((value) => value + 1);
        }}
        onStartLearning={(topicId) => router.push(`/user/learn/${topicId}`)}
      />
    </div>
  );
}

// ─── Sort options ─────────────────────────────────────────────────────

const sortOptions = [
  { value: "recent", label: "Gần đây nhất", icon: ChevronRight },
  { value: "oldest", label: "Cũ nhất", icon: ChevronLeft },
  { value: "favorite", label: "Yêu thích", icon: Star },
  { value: "term_asc", label: "Từ A–Z", icon: ArrowDownAZ },
  { value: "term_desc", label: "Từ Z–A", icon: ArrowDownAZ },
  { value: "mastery_desc", label: "Thành thạo giảm dần", icon: ChevronRight },
  { value: "mastery_asc", label: "Thành thạo tăng dần", icon: ChevronLeft },
];

const sortLabels: Record<string, string> = {
  recent: "Gần đây",
  oldest: "Cũ nhất",
  favorite: "Yêu thích",
  term_asc: "A–Z",
  term_desc: "Z–A",
  mastery_desc: "Giỏi nhất",
  mastery_asc: "Yếu nhất",
};

// ─── Sub-components ───────────────────────────────────────────────────

function MasteryBadge({ level }: { level: number }) {
  const colors =
    level >= 8
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : level >= 5
        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
        : level >= 2
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
          : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${colors}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      Thành thạo {level}/10
    </span>
  );
}

function IconButton({
  icon: Icon,
  onClick,
  label,
  className = "",
  fill = false,
}: {
  icon: React.ElementType;
  onClick: () => void;
  label: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${className}`}
      title={label}
    >
      <Icon size={16} fill={fill ? "currentColor" : "none"} />
    </button>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────

function GridCard({ entry, onSpeak, onEdit, onToggleFavorite, onDelete }: {
  entry: NotebookEntry;
  onSpeak: (text: string) => void;
  onEdit: (entry: NotebookEntry) => void;
  onToggleFavorite: (entry: NotebookEntry) => void;
  onDelete: (entry: NotebookEntry) => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      {/* Top-right action buttons */}
      <div className="absolute right-3 top-3 flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <IconButton icon={Pencil} onClick={() => onEdit(entry)} label="Sửa ghi chú" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10" />
        <IconButton icon={Star} fill={entry.isFavorite} onClick={() => onToggleFavorite(entry)} label={entry.isFavorite ? "Bỏ yêu thích" : "Yêu thích"} className={`h-7 w-7 ${entry.isFavorite ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10 opacity-100" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`} />
        <IconButton icon={Trash2} onClick={() => onDelete(entry)} label="Xóa khỏi sổ tay" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" />
      </div>

      <div className="mb-1.5 flex items-center gap-2 pr-20 md:pr-16">
        <button onClick={() => onSpeak(entry.term)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300" title="Nghe phát âm"><Volume2 size={13} /></button>
        <h4 className="truncate text-base font-black text-slate-900 dark:text-white">{entry.term}</h4>
        {entry.phonetic && <span className="hidden truncate font-mono text-[10px] text-slate-400 sm:inline">{entry.phonetic}</span>}
        {entry.partOfSpeechName && <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:bg-white/10 dark:text-slate-400">{entry.partOfSpeechName}</span>}
      </div>

      <p className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-slate-600 dark:text-slate-400">{entry.meaning}</p>

      {entry.personalNote && (
        <p className="mb-2 line-clamp-2 rounded-lg border border-blue-200/50 bg-blue-50/50 px-3 py-1.5 text-[11px] italic leading-snug text-slate-700 dark:border-blue-400/15 dark:bg-blue-400/5 dark:text-slate-400">&ldquo;{entry.personalNote}&rdquo;</p>
      )}

      <div className="flex-1" />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-slate-200 pt-3 dark:border-white/5">
        <MasteryBadge level={entry.masteryLevel} />
        <span className="text-[10px] text-slate-400">{new Date(entry.addedAt).toLocaleDateString("vi-VN")}</span>
      </div>
    </div>
  );
}

// ─── List Card ────────────────────────────────────────────────────────

function ListCard({ entry, onSpeak, onEdit, onToggleFavorite, onDelete }: {
  entry: NotebookEntry;
  onSpeak: (text: string) => void;
  onEdit: (entry: NotebookEntry) => void;
  onToggleFavorite: (entry: NotebookEntry) => void;
  onDelete: (entry: NotebookEntry) => void;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <button onClick={() => onSpeak(entry.term)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300" title="Nghe phát âm"><Volume2 size={14} /></button>
            <h4 className="truncate text-lg font-black text-slate-900 dark:text-white">{entry.term}</h4>
            {entry.phonetic && <span className="font-mono text-xs text-slate-400">{entry.phonetic}</span>}
            {entry.partOfSpeechName && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-white/10 dark:text-slate-400">{entry.partOfSpeechName}</span>}
          </div>
          <p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">{entry.meaning}</p>

          {entry.personalNote && (
            <div className="mb-3 inline-block max-w-lg rounded-xl border border-blue-200/60 bg-blue-50/60 px-4 py-2.5 text-sm italic text-slate-700 dark:border-blue-400/15 dark:bg-blue-400/5 dark:text-slate-300">&ldquo;{entry.personalNote}&rdquo;</div>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <MasteryBadge level={entry.masteryLevel} />
            <span className="text-[11px] text-slate-400">Thêm ngày {new Date(entry.addedAt).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton icon={Pencil} onClick={() => onEdit(entry)} label="Sửa ghi chú" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10" />
          <IconButton icon={Star} fill={entry.isFavorite} onClick={() => onToggleFavorite(entry)} label={entry.isFavorite ? "Bỏ yêu thích" : "Yêu thích"} className={entry.isFavorite ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"} />
          <IconButton icon={Trash2} onClick={() => onDelete(entry)} label="Xóa khỏi sổ tay" className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" />
        </div>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}              className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

